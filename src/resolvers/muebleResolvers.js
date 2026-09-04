import WallType from '../models/WallType.js'
import WallFinish from '../models/WallFinish.js'
import FurnitureDesign from '../models/FurnitureDesign.js'
import DraftMuebleOrder from '../models/DraftMuebleOrder.js'
import { generateMuebleCode } from '../lib/muebleCode.js'
import { generatePresignedUrl, generatePresignedGetUrl, isS3Key } from '../lib/s3.js'

// In-memory rate limiter: { ip -> { count, resetAt } } — separado del de collar
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

const ALLOWED_PREFIXES = ['drafts/mueble-snapshots/']

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

const muebleResolvers = {
  Query: {
    wallTypes: async () => WallType.find({ available: true }).sort({ order: 1 }),

    wallFinishes: async () => {
      const finishes = await WallFinish.find({ available: true }).sort({ order: 1 })
      return Promise.all(finishes.map(async f => {
        const obj = f.toObject({ virtuals: true })
        if (obj.textureUrl && isS3Key(obj.textureUrl)) {
          obj.textureUrl = await generatePresignedGetUrl(obj.textureUrl)
        }
        return obj
      }))
    },

    furnitureDesigns: async () => {
      const designs = await FurnitureDesign.find({ available: true }).sort({ order: 1 })
      return Promise.all(designs.map(async d => {
        const obj = d.toObject({ virtuals: true })
        if (obj.glbUrl && isS3Key(obj.glbUrl)) obj.glbUrl = await generatePresignedGetUrl(obj.glbUrl)
        if (obj.thumbnailUrl && isS3Key(obj.thumbnailUrl)) obj.thumbnailUrl = await generatePresignedGetUrl(obj.thumbnailUrl)
        return obj
      }))
    },

    draftMuebleOrder: async (_, { code }) => {
      const draft = await DraftMuebleOrder.findOne({ code })
      if (!draft) return null
      const obj = draft.toObject({ virtuals: true })
      if (obj.snapshotImageUrl && isS3Key(obj.snapshotImageUrl)) {
        obj.snapshotImageUrl = await generatePresignedGetUrl(obj.snapshotImageUrl)
      }
      if (obj.items?.length) {
        obj.items = await Promise.all(obj.items.map(async item => {
          if (item.glbUrl && isS3Key(item.glbUrl)) {
            return { ...item, glbUrl: await generatePresignedGetUrl(item.glbUrl) }
          }
          return item
        }))
      }
      obj.expiresAt = obj.expiresAt?.toISOString?.() ?? String(obj.expiresAt)
      obj.createdAt = obj.createdAt?.toISOString?.() ?? String(obj.createdAt)
      return obj
    },
  },

  Mutation: {
    createDraftMuebleOrder: async (_, { input }, { req }) => {
      // Honeypot check
      if (input._trap) throw new Error('Solicitud inválida')

      // Rate limit by IP
      const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
        || req?.socket?.remoteAddress
        || 'unknown'
      checkRateLimit(ip)

      if (!input.items.length) throw new Error('Coloca al menos un mueble antes de continuar.')

      // Server-side price validation against the real catalog (cada diseño tiene su propio precio,
      // a diferencia del collar donde el precio es fijo por tipo — no hay fórmula fija que validar)
      const designKeys = input.items.map(i => i.designKey)
      const designs = await FurnitureDesign.find({ key: { $in: designKeys }, available: true })
      const designByKey = new Map(designs.map(d => [d.key, d]))

      let expectedPrice = 0
      for (const item of input.items) {
        const design = designByKey.get(item.designKey)
        if (!design) throw new Error('Uno de los muebles ya no está disponible. Recarga la página e intenta de nuevo.')
        expectedPrice += design.price
      }
      if (Math.abs(input.totalPrice - expectedPrice) > 0.01) {
        throw new Error('El precio no coincide. Recarga la página e intenta de nuevo.')
      }

      // Generate unique code (retry up to 5 times on collision)
      let code, attempts = 0
      do {
        code = generateMuebleCode()
        attempts++
        if (attempts > 5) throw new Error('Error generando código. Intenta de nuevo.')
      } while (await DraftMuebleOrder.exists({ code }))

      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72h

      // Los datos del mueble (nombre, glb, precio) se resuelven del catálogo de confianza,
      // no del input del cliente — solo la posición (xCm/yCm) viene del cliente.
      const items = input.items.map(item => {
        const design = designByKey.get(item.designKey)
        return {
          designKey: design.key,
          name:      design.name,
          glbUrl:    design.glbUrl || '',
          xCm:       item.xCm,
          yCm:       item.yCm,
          price:     design.price,
        }
      })

      const draft = await DraftMuebleOrder.create({
        code,
        wallType:         input.wallType,
        wallFinish:       input.wallFinish,
        widthCm:          input.widthCm,
        heightCm:         input.heightCm,
        items,
        totalPrice:       input.totalPrice,
        snapshotImageUrl: input.snapshotImageUrl ? extractS3Key(input.snapshotImageUrl) : '',
        clientIp:         ip,
        expiresAt,
      })

      return draft
    },

    getMuebleUploadUrl: async (_, { filename, contentType }) => {
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

export default muebleResolvers
