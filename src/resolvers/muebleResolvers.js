import Ambient from '../models/Ambient.js'
import WallType from '../models/WallType.js'
import WallFinish from '../models/WallFinish.js'
import FloorFinish from '../models/FloorFinish.js'
import FurnitureDesign from '../models/FurnitureDesign.js'
import DraftMuebleOrder from '../models/DraftMuebleOrder.js'
import { generateMuebleCode } from '../lib/muebleCode.js'
import { generatePresignedUrl, generatePresignedGetUrl, isS3Key } from '../lib/s3.js'
import {
  serializeAmbient, serializeWallType, serializeFinish, serializeDesign, serializeDraft,
} from '../lib/muebleSerialize.js'
import {
  resolveShape, buildSpace, validateDimensions, isItemInside, spaceWidthCm,
} from '../lib/muebleGeometry.js'

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

const SNAPSHOT_PREFIX = 'drafts/mueble-snapshots/'
const ALLOWED_PREFIXES = [SNAPSHOT_PREFIX]

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

// Solo se aceptan fotos subidas a la carpeta de borradores de mueble
function snapshotKeyOrEmpty(value) {
  const key = extractS3Key(value)
  return key && key.startsWith(SNAPSHOT_PREFIX) ? key : ''
}

const scopeFits = (scope, outdoor) => (scope || 'both') === 'both' || (outdoor ? scope === 'exterior' : scope === 'interior')

const finishSnapshot = (f) => ({
  key: f.key, name: f.name, kind: f.kind, colorHex: f.colorHex || '', textureUrl: f.textureUrl || '',
})

/**
 * Colores de un mueble: por cada parte pintable del diseño toma la opción que pidió el cliente
 * (por nombre) o, si no existe, la de fábrica (la primera). Lo que no está en el catálogo se ignora.
 */
export function resolveItemColors(design, requested) {
  const wanted = new Map((requested || []).map(c => [c.part, c.name]))
  return (design.colorParts || [])
    .filter(p => p.options?.length)
    .map(p => {
      const opt = p.options.find(o => o.name === wanted.get(p.key)) || p.options[0]
      return { part: p.key, label: p.label, name: opt.name, hex: opt.hex }
    })
}

const NOT_AVAILABLE = 'Algo de tu diseño ya no está disponible. Recarga la página e intenta de nuevo.'

/** Resuelve y valida el espacio completo contra el catálogo (VISION.md Parte 3, §30). */
async function resolveSpace(spaceInput) {
  const ambient = await Ambient.findOne({ key: spaceInput.ambientKey, available: true })
  if (!ambient) throw new Error(NOT_AVAILABLE)
  const layout = await WallType.findOne({ key: spaceInput.layoutKey, available: true })
  if (!layout) throw new Error(NOT_AVAILABLE)
  if (layout.ambients?.length && !layout.ambients.includes(ambient.key)) throw new Error(NOT_AVAILABLE)

  const shape = resolveShape(layout)
  const lengths = spaceInput.lengthsCm.map(Number)
  const dims = validateDimensions(shape, lengths, spaceInput.heightCm, ambient.outdoor)
  if (!dims.ok) throw new Error('Las medidas del espacio no son válidas. Revísalas e intenta de nuevo.')

  const geo = buildSpace(shape, lengths)
  if (spaceInput.wallFinishKeys.length !== geo.walls.length) throw new Error('Falta el acabado de alguna pared.')

  const finishKeys = [...new Set(spaceInput.wallFinishKeys)]
  const finishes = await WallFinish.find({ key: { $in: finishKeys }, available: true })
  const finishByKey = new Map(finishes.map(f => [f.key, f]))
  for (const k of finishKeys) {
    const f = finishByKey.get(k)
    if (!f || !scopeFits(f.scope, ambient.outdoor)) throw new Error(NOT_AVAILABLE)
  }
  const floor = await FloorFinish.findOne({ key: spaceInput.floorFinishKey, available: true })
  if (!floor || !scopeFits(floor.scope, ambient.outdoor)) throw new Error(NOT_AVAILABLE)

  return {
    ambient, layout, shape, geo, heightCm: Number(spaceInput.heightCm),
    snapshot: {
      ambient: { key: ambient.key, name: ambient.name, outdoor: !!ambient.outdoor },
      layout: { key: layout.key, name: layout.name, shape },
      heightCm: Number(spaceInput.heightCm),
      lengthsCm: lengths,
      walls: geo.walls.map((w, i) => ({
        index: w.index, label: w.label, lengthCm: Math.round(w.lengthCm * 10) / 10,
        finish: finishSnapshot(finishByKey.get(spaceInput.wallFinishKeys[i])),
      })),
      floorFinish: finishSnapshot(floor),
    },
  }
}

const muebleResolvers = {
  Query: {
    ambients: async () => (await Ambient.find({ available: true }).sort({ order: 1 })).map(serializeAmbient),

    wallTypes: async () => (await WallType.find({ available: true }).sort({ order: 1 })).map(serializeWallType),

    wallFinishes: async () => {
      const finishes = await WallFinish.find({ available: true }).sort({ order: 1 })
      return Promise.all(finishes.map(serializeFinish))
    },

    floorFinishes: async () => {
      const finishes = await FloorFinish.find({ available: true }).sort({ order: 1 })
      return Promise.all(finishes.map(serializeFinish))
    },

    furnitureDesigns: async () => {
      const designs = await FurnitureDesign.find({ available: true }).sort({ order: 1 })
      return Promise.all(designs.map(serializeDesign))
    },

    draftMuebleOrder: async (_, { code }) => {
      const draft = await DraftMuebleOrder.findOne({ code })
      if (!draft) return null
      return serializeDraft(draft)
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

      // Server-side price validation against the real catalog (cada diseño tiene su propio precio)
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

      // ── Espacio completo (flujo nuevo) o una sola pared (flujo viejo) ──
      let space = null
      let legacy
      if (input.space) {
        space = await resolveSpace(input.space)
        for (const item of input.items) {
          const design = designByKey.get(item.designKey)
          if (!scopeFits(design.scope, space.ambient.outdoor)) throw new Error(NOT_AVAILABLE)
          const rot = Number(item.rotationDeg) || 0
          if (![0, 90, 180, 270].includes(rot)) throw new Error('Giro de mueble no válido.')
          const placed = { ...item, rotationDeg: rot }
          if (!isItemInside(placed, design, space.geo, space.heightCm, 1)) {
            throw new Error('Un mueble quedó fuera del espacio. Revisa tu diseño e intenta de nuevo.')
          }
        }
        const firstWall = space.snapshot.walls[space.geo.backWallIndex] || space.snapshot.walls[0]
        legacy = {
          wallType: { key: space.layout.key, name: space.layout.name },
          wallFinish: firstWall.finish,
          widthCm: spaceWidthCm(space.geo),
          heightCm: space.heightCm,
        }
      } else {
        if (!input.wallType || !input.wallFinish || !(input.widthCm > 0) || !(input.heightCm > 0)) {
          throw new Error('Faltan datos del espacio. Recarga la página e intenta de nuevo.')
        }
        legacy = { wallType: input.wallType, wallFinish: input.wallFinish, widthCm: input.widthCm, heightCm: input.heightCm }
      }

      // Generate unique code (retry up to 5 times on collision)
      let code, attempts = 0
      do {
        code = generateMuebleCode()
        attempts++
        if (attempts > 5) throw new Error('Error generando código. Intenta de nuevo.')
      } while (await DraftMuebleOrder.exists({ code }))

      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72h

      // Los datos del mueble (nombre, glb, precio, tipo) se resuelven del catálogo de confianza;
      // del cliente solo viene la posición.
      const items = input.items.map(item => {
        const design = designByKey.get(item.designKey)
        const mount = space ? (design.mount || 'wall') : 'wall'
        const base = {
          designKey: design.key,
          name:      design.name,
          glbUrl:    design.glbUrl || '',
          price:     design.price,
          mount,
          rotationDeg: Number(item.rotationDeg) || 0,
          widthCm:   design.widthCm,
          heightCm:  design.heightCm,
          depthCm:   design.depthCm,
          colors:    resolveItemColors(design, item.colors),
        }
        if (mount === 'floor') {
          return { ...base, wallIndex: 0, xCm: 0, yCm: 0, floorXCm: item.floorXCm, floorZCm: item.floorZCm }
        }
        return { ...base, wallIndex: space ? (item.wallIndex ?? 0) : 0, xCm: item.xCm ?? 0, yCm: item.yCm ?? 0 }
      })

      const wallSnapshots = (input.wallSnapshots || [])
        .map(s => ({ wallIndex: s.wallIndex, url: snapshotKeyOrEmpty(s.url) }))
        .filter(s => s.url && (!space || space.geo.walls[s.wallIndex]))

      const draft = await DraftMuebleOrder.create({
        code,
        ...legacy,
        items,
        totalPrice:       input.totalPrice,
        snapshotImageUrl: snapshotKeyOrEmpty(input.snapshotImageUrl),
        space:            space ? space.snapshot : undefined,
        wallSnapshots,
        clientIp:         ip,
        expiresAt,
      })

      return serializeDraft(draft)
    },

    getMuebleUploadUrl: async (_, { filename, contentType }) => {
      const allowed = ALLOWED_PREFIXES.some(p => filename.startsWith(p))
      if (!allowed || filename.includes('..')) throw new Error('Ruta de archivo no permitida')

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
