import CollarColor from '../models/CollarColor.js'
import CollarDesign from '../models/CollarDesign.js'
import CollarCharm from '../models/CollarCharm.js'
import CollarCategory from '../models/CollarCategory.js'
import CollarPricing from '../models/CollarPricing.js'
import DraftOrder from '../models/DraftOrder.js'
import { generateCollarCode } from '../lib/collarCode.js'
import { generatePresignedUrl, generatePresignedGetUrl, isS3Key } from '../lib/s3.js'

// Helper: resolve the categories array for a charm (multi-cat or legacy single-cat)
function getCharmCategories(charm) {
  if (charm.categories?.length) return charm.categories
  if (charm.category) return [charm.category]
  return []
}

// In-memory rate limiter: { ip -> { count, resetAt } }
const rateLimitMap = new Map()
const RATE_LIMIT = 5        // max requests
const RATE_WINDOW = 60_000  // per 60 seconds

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return
  }
  if (entry.count >= RATE_LIMIT) {
    throw new Error('Demasiadas solicitudes. Intenta en un momento.')
  }
  entry.count++
}

const ALLOWED_PREFIXES = ['drafts/snapshots/']

// Extract S3 key from a presigned URL (or return value if already a key)
function extractS3Key(value) {
  if (!value) return ''
  if (isS3Key(value)) return value
  try {
    const url = new URL(value)
    return url.pathname.slice(1)
  } catch {
    return value
  }
}

const collarResolvers = {
  Query: {
    collarColors: async () => CollarColor.find({ available: true }).sort({ order: 1 }),

    collarDesigns: async () => CollarDesign.find({ available: true }).sort({ order: 1 }),

    collarCharms: async (_, { category }) => {
      const allCategories = await CollarCategory.find()
      const allCatNames    = new Set(allCategories.map(c => c.name))
      const activeCatNames = new Set(allCategories.filter(c => c.available !== false).map(c => c.name))

      const charms = await CollarCharm.find({ available: true }).sort({ order: 1 })

      let filtered = charms.filter(charm => {
        const cats = getCharmCategories(charm)
        // Legacy charm: none of its categories exist in the DB → always show
        const hasDbCategory = cats.some(c => allCatNames.has(c))
        if (!hasDbCategory) return true
        // Has DB categories → at least one must be active
        return cats.some(c => activeCatNames.has(c))
      })

      if (category) {
        const cat = allCategories.find(c => c.name === category)
        if (!cat || cat.available === false) return []
        filtered = filtered.filter(charm => getCharmCategories(charm).includes(category))
      }

      return Promise.all(filtered.map(async charm => {
        const obj = charm.toObject({ virtuals: true })
        obj.categories = getCharmCategories(charm)
        if (obj.imageUrl && isS3Key(obj.imageUrl)) {
          obj.imageUrl = await generatePresignedGetUrl(obj.imageUrl)
        }
        return obj
      }))
    },

    collarCharmCategories: async () =>
      CollarCategory.find({ available: true }).sort({ order: 1, name: 1 }),

    collarPricing: async () => {
      let pricing = await CollarPricing.findOne()
      if (!pricing) pricing = await CollarPricing.create({})
      return pricing
    },

    draftOrder: async (_, { code }) => {
      const draft = await DraftOrder.findOne({ code })
      if (!draft) return null
      const obj = draft.toObject({ virtuals: true })
      if (obj.snapshotImageUrl && isS3Key(obj.snapshotImageUrl)) {
        obj.snapshotImageUrl = await generatePresignedGetUrl(obj.snapshotImageUrl)
      }
      // Refresh presigned URLs for charm item images
      if (obj.items?.length) {
        obj.items = await Promise.all(obj.items.map(async item => {
          if (item.type === 'charm' && item.imageUrl && isS3Key(item.imageUrl)) {
            return { ...item, imageUrl: await generatePresignedGetUrl(item.imageUrl) }
          }
          return item
        }))
      }
      // Explicit ISO strings so GraphQL String! scalar receives a proper value
      obj.expiresAt = obj.expiresAt?.toISOString?.() ?? String(obj.expiresAt)
      obj.createdAt = obj.createdAt?.toISOString?.() ?? String(obj.createdAt)
      return obj
    },
  },

  Mutation: {
    createDraftOrder: async (_, { input }, { req }) => {
      // Honeypot check
      if (input._trap) throw new Error('Solicitud inválida')

      // Rate limit by IP
      const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
        || req?.socket?.remoteAddress
        || 'unknown'
      checkRateLimit(ip)

      // Server-side price validation
      const pricing = await CollarPricing.findOne() || await CollarPricing.create({})
      const charmItems = input.items.filter(i => i.type === 'charm')
      const letterItems = input.items.filter(i => i.type === 'letter')
      const expectedPrice = pricing.basePrice
        + charmItems.length * pricing.charmPrice
        + letterItems.length * pricing.letterPrice

      if (Math.abs(input.totalPrice - expectedPrice) > 0.01) {
        throw new Error('El precio no coincide. Recarga la página e intenta de nuevo.')
      }

      // Generate unique code (retry up to 5 times on collision)
      let code, attempts = 0
      do {
        code = generateCollarCode()
        attempts++
        if (attempts > 5) throw new Error('Error generando código. Intenta de nuevo.')
      } while (await DraftOrder.exists({ code }))

      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72h

      // Store charm imageUrls as S3 keys so they never expire
      const items = input.items.map(item => ({
        ...item,
        imageUrl: item.type === 'charm' && item.imageUrl
          ? extractS3Key(item.imageUrl)
          : (item.imageUrl || ''),
      }))

      const draft = await DraftOrder.create({
        code,
        collarColor:      input.collarColor,
        collarDesign:     input.collarDesign,
        size:             input.size,
        items,
        totalPrice:       input.totalPrice,
        snapshotImageUrl: input.snapshotImageUrl || '',
        clientIp:         ip,
        expiresAt,
      })

      return draft
    },

    getUploadUrl: async (_, { filename, contentType }) => {
      const allowed = ALLOWED_PREFIXES.some(p => filename.startsWith(p))
      if (!allowed) throw new Error('Ruta de archivo no permitida')

      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
      if (!allowedTypes.includes(contentType)) throw new Error('Tipo de archivo no permitido')

      const uploadUrl = await generatePresignedUrl(filename, contentType)
      // publicUrl is a short-lived presigned GET for immediate preview only
      const publicUrl = await generatePresignedGetUrl(filename, 300)
      return { uploadUrl, publicUrl, key: filename }
    },
  },
}

export default collarResolvers
