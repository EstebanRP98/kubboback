import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import CollarColor from '../models/CollarColor.js'
import CollarDesign from '../models/CollarDesign.js'
import CollarCharm from '../models/CollarCharm.js'
import CollarCategory from '../models/CollarCategory.js'
import CollarPricing from '../models/CollarPricing.js'
import DraftOrder from '../models/DraftOrder.js'
import Order from '../models/Order.js'
import AdminUser from '../models/AdminUser.js'
import { generatePresignedUrl, generatePresignedGetUrl, isS3Key, moveObject } from '../lib/s3.js'
import { requireAdmin } from '../middleware/auth.js'

// Helper: resolve the categories array for a charm (multi-cat or legacy single-cat)
function getCharmCategories(charm) {
  if (charm.categories?.length) return charm.categories
  if (charm.category) return [charm.category]
  return []
}

// Extracts the S3 key from a presigned URL (or returns the value if it's already a key)
function extractS3Key(value) {
  if (!value) return ''
  if (isS3Key(value)) return value
  try {
    const url = new URL(value)
    // Presigned URL path starts with /<key>, strip leading slash
    return url.pathname.slice(1)
  } catch {
    return value
  }
}

const adminResolvers = {
  Query: {
    adminPendingOrders: async (_, __, context) => {
      requireAdmin(context)
      const drafts = await DraftOrder.find({ status: 'pending' }).sort({ createdAt: -1 })
      return Promise.all(drafts.map(async draft => {
        const obj = draft.toObject({ virtuals: true })
        if (obj.snapshotImageUrl && isS3Key(obj.snapshotImageUrl)) {
          obj.snapshotImageUrl = await generatePresignedGetUrl(obj.snapshotImageUrl)
        }
        if (obj.items?.length) {
          obj.items = await Promise.all(obj.items.map(async item => {
            if (item.type === 'charm' && item.imageUrl && isS3Key(item.imageUrl)) {
              return { ...item, imageUrl: await generatePresignedGetUrl(item.imageUrl) }
            }
            return item
          }))
        }
        obj.expiresAt = obj.expiresAt?.toISOString?.() ?? String(obj.expiresAt)
        obj.createdAt = obj.createdAt?.toISOString?.() ?? String(obj.createdAt)
        return obj
      }))
    },

    adminCharmCategories: async (_, __, context) => {
      requireAdmin(context)
      return CollarCategory.find().sort({ order: 1, name: 1 })
    },

    adminCollarCharms: async (_, __, context) => {
      requireAdmin(context)
      const charms = await CollarCharm.find().sort({ order: 1 })
      return Promise.all(charms.map(async charm => {
        const obj = charm.toObject({ virtuals: true })
        obj.categories = getCharmCategories(charm)
        if (obj.imageUrl && isS3Key(obj.imageUrl)) {
          obj.imageUrl = await generatePresignedGetUrl(obj.imageUrl)
        }
        return obj
      }))
    },

    adminCollarColors: async (_, __, context) => {
      requireAdmin(context)
      return CollarColor.find().sort({ order: 1 })
    },

    adminConfirmedOrders: async (_, __, context) => {
      requireAdmin(context)
      const orders = await Order.find().sort({ confirmedAt: -1 })
      return Promise.all(orders.map(async o => {
        const obj = o.toObject({ virtuals: true })
        let snapshotImageUrl = obj.snapshotImageUrl || ''
        if (snapshotImageUrl && isS3Key(snapshotImageUrl)) {
          snapshotImageUrl = await generatePresignedGetUrl(snapshotImageUrl)
        }
        return {
          ...obj,
          id: o._id.toString(),
          snapshotImageUrl,
          itemsDescription: obj.itemsDescription || '',
          collarSnapshot: obj.collarSnapshot ? JSON.stringify(obj.collarSnapshot) : null,
          confirmedAt: o.confirmedAt?.toISOString(),
        }
      }))
    },
  },

  Mutation: {
    adminLogin: async (_, { username, password }) => {
      const user = await AdminUser.findOne({ username })
      if (!user) throw new Error('Credenciales inválidas')
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) throw new Error('Credenciales inválidas')
      const token = jwt.sign(
        { sub: user._id.toString(), username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      )
      return { token, username: user.username }
    },

    confirmOrder: async (_, { code, adminNotes }, context) => {
      requireAdmin(context)
      const draft = await DraftOrder.findOne({ code })
      if (!draft) throw new Error('Pedido no encontrado')

      // snapshotImageUrl is stored as an S3 key (e.g. "drafts/snapshots/MK-XXXX.png")
      let snapshotKey = draft.snapshotImageUrl || ''
      if (snapshotKey && isS3Key(snapshotKey) && snapshotKey.startsWith('drafts/')) {
        try {
          const destKey = snapshotKey.replace('drafts/', 'orders/')
          await moveObject(snapshotKey, destKey)
          snapshotKey = destKey
        } catch { /* keep original key if S3 move fails */ }
      }

      // Build human-readable items description sorted by order field
      const sortedItems = [...(draft.items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const itemsDescription = sortedItems
        .map((item, i) => {
          if (item.type === 'charm') return `${i + 1}. ${item.name} [charm]`
          const color = item.color ? `, ${item.color}` : ''
          return `${i + 1}. ${item.name} [letra${color}]`
        })
        .join(' · ')

      const order = await Order.create({
        code:             draft.code,
        collarSnapshot: {
          collarColor:  draft.collarColor,
          collarDesign: draft.collarDesign,
          size:         draft.size,
          items:        sortedItems,
        },
        totalPrice:       draft.totalPrice,
        snapshotImageUrl: snapshotKey, // stored as S3 key
        adminNotes:       adminNotes || '',
        itemsDescription,
      })

      draft.status = 'confirmed'
      await draft.save()

      // Generate presigned GET URL for the response
      let snapshotImageUrl = snapshotKey
      if (snapshotKey && isS3Key(snapshotKey)) {
        snapshotImageUrl = await generatePresignedGetUrl(snapshotKey)
      }

      return {
        ...order.toObject({ virtuals: true }),
        id: order._id.toString(),
        snapshotImageUrl,
        collarSnapshot: JSON.stringify(order.collarSnapshot),
        confirmedAt: order.confirmedAt?.toISOString(),
      }
    },

    deleteDraftOrder: async (_, { code }, context) => {
      requireAdmin(context)
      await DraftOrder.deleteOne({ code })
      return true
    },

    // ── Color CRUD ──────────────────────────────────────────────
    createCollarColor: async (_, { input }, context) => {
      requireAdmin(context)
      return CollarColor.create(input)
    },
    updateCollarColor: async (_, { id, input }, context) => {
      requireAdmin(context)
      return CollarColor.findByIdAndUpdate(id, input, { new: true })
    },
    deleteCollarColor: async (_, { id }, context) => {
      requireAdmin(context)
      await CollarColor.findByIdAndDelete(id)
      return true
    },

    // ── Design CRUD ─────────────────────────────────────────────
    createCollarDesign: async (_, { input }, context) => {
      requireAdmin(context)
      return CollarDesign.create(input)
    },
    updateCollarDesign: async (_, { id, input }, context) => {
      requireAdmin(context)
      return CollarDesign.findByIdAndUpdate(id, input, { new: true })
    },
    deleteCollarDesign: async (_, { id }, context) => {
      requireAdmin(context)
      await CollarDesign.findByIdAndDelete(id)
      return true
    },

    // ── Charm CRUD ──────────────────────────────────────────────
    createCollarCharm: async (_, { input }, context) => {
      requireAdmin(context)
      const imageUrl = input.imageUrl ? extractS3Key(input.imageUrl) : ''
      const categories = input.categories?.length
        ? input.categories
        : (input.category ? [input.category] : [])
      const charm = await CollarCharm.create({ ...input, imageUrl, categories })
      const obj = charm.toObject({ virtuals: true })
      obj.categories = categories
      if (obj.imageUrl && isS3Key(obj.imageUrl)) obj.imageUrl = await generatePresignedGetUrl(obj.imageUrl)
      return obj
    },
    updateCollarCharm: async (_, { id, input }, context) => {
      requireAdmin(context)
      const imageUrl = input.imageUrl ? extractS3Key(input.imageUrl) : ''
      const categories = input.categories?.length
        ? input.categories
        : (input.category ? [input.category] : [])
      const charm = await CollarCharm.findByIdAndUpdate(id, { ...input, imageUrl, categories }, { new: true })
      const obj = charm.toObject({ virtuals: true })
      obj.categories = getCharmCategories(charm)
      if (obj.imageUrl && isS3Key(obj.imageUrl)) obj.imageUrl = await generatePresignedGetUrl(obj.imageUrl)
      return obj
    },
    deleteCollarCharm: async (_, { id }, context) => {
      requireAdmin(context)
      await CollarCharm.findByIdAndDelete(id)
      return true
    },
    getCharmUploadUrl: async (_, { filename, contentType }, context) => {
      requireAdmin(context)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
      if (!allowedTypes.includes(contentType)) throw new Error('Tipo de archivo no permitido')
      if (!filename.startsWith('charms/')) throw new Error('Ruta de archivo no permitida')
      const uploadUrl = await generatePresignedUrl(filename, contentType)
      const publicUrl = await generatePresignedGetUrl(filename, 300)
      return { uploadUrl, publicUrl, key: filename }
    },

    setCollarCharmAvailable: async (_, { id, available }, context) => {
      requireAdmin(context)
      const charm = await CollarCharm.findByIdAndUpdate(id, { available }, { new: true })
      const obj = charm.toObject({ virtuals: true })
      obj.categories = getCharmCategories(charm)
      if (obj.imageUrl && isS3Key(obj.imageUrl)) obj.imageUrl = await generatePresignedGetUrl(obj.imageUrl)
      return obj
    },

    setCharmCategoryAvailable: async (_, { id, available }, context) => {
      requireAdmin(context)
      return CollarCategory.findByIdAndUpdate(id, { available }, { new: true })
    },

    // ── Category CRUD ────────────────────────────────────────────
    createCharmCategory: async (_, { name, order }, context) => {
      requireAdmin(context)
      const count = await CollarCategory.countDocuments()
      return CollarCategory.create({ name: name.trim(), order: order ?? count })
    },
    renameCharmCategory: async (_, { id, name }, context) => {
      requireAdmin(context)
      return CollarCategory.findByIdAndUpdate(id, { name: name.trim() }, { new: true })
    },
    deleteCharmCategory: async (_, { id }, context) => {
      requireAdmin(context)
      await CollarCategory.findByIdAndDelete(id)
      return true
    },

    // ── Pricing ─────────────────────────────────────────────────
    updateCollarPricing: async (_, { input }, context) => {
      requireAdmin(context)
      let pricing = await CollarPricing.findOne()
      if (!pricing) {
        pricing = await CollarPricing.create(input)
      } else {
        Object.assign(pricing, input)
        await pricing.save()
      }
      return pricing
    },
  },
}

export default adminResolvers
