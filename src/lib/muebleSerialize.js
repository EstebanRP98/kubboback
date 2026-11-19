// Serializadores compartidos por las queries públicas y admin de Arma tu Mueble.
// Convención S3 heredada del collar: en Mongo se guarda la key y al responder se firma la URL.
import { generatePresignedGetUrl, isS3Key } from './s3.js'
import { resolveShape, defaultLengthsFor } from './muebleGeometry.js'

const sign = async (v) => (v && isS3Key(v) ? generatePresignedGetUrl(v) : (v || ''))

const toObj = (doc) => (typeof doc?.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc })

export function serializeWallType(doc) {
  const obj = toObj(doc)
  const shape = resolveShape(obj)
  const lengths = defaultLengthsFor(obj)
  return {
    ...obj,
    id: obj.id || obj._id?.toString(),
    shape,
    defaultLengthsCm: lengths,
    ambients: Array.isArray(obj.ambients) ? obj.ambients : [],
    illustrationUrl: obj.illustrationUrl || '',
    defaultWidthCm: Number(obj.defaultWidthCm) || lengths[0] || 0,
    defaultHeightCm: Number(obj.defaultHeightCm) || 0,
  }
}

export async function serializeFinish(doc) {
  const obj = toObj(doc)
  return {
    ...obj,
    id: obj.id || obj._id?.toString(),
    colorHex: obj.colorHex || '',
    textureUrl: await sign(obj.textureUrl),
    scope: obj.scope || 'both',
  }
}

export async function serializeDesign(doc) {
  const obj = toObj(doc)
  return {
    ...obj,
    id: obj.id || obj._id?.toString(),
    glbUrl: await sign(obj.glbUrl),
    thumbnailUrl: await sign(obj.thumbnailUrl),
    mount: obj.mount || 'wall',
    scope: obj.scope || 'interior',
    colorParts: Array.isArray(obj.colorParts) ? obj.colorParts : [],
  }
}

export function serializeAmbient(doc) {
  const obj = toObj(doc)
  return {
    ...obj,
    id: obj.id || obj._id?.toString(),
    outdoor: !!obj.outdoor,
    defaultHeightCm: Number(obj.defaultHeightCm) || 240,
    defaultWallFinishKey: obj.defaultWallFinishKey || '',
    defaultFloorFinishKey: obj.defaultFloorFinishKey || '',
    illustrationUrl: obj.illustrationUrl || '',
  }
}

async function signFinishSnapshot(f) {
  if (!f) return f
  return { ...f, textureUrl: await sign(f.textureUrl) }
}

/** Firma snapshot, fotos por pared, glb de los ítems y texturas del espacio de un borrador. */
export async function serializeDraft(doc) {
  const obj = toObj(doc)
  obj.id = obj.id || obj._id?.toString()
  obj.snapshotImageUrl = await sign(obj.snapshotImageUrl)
  obj.wallSnapshots = await Promise.all((obj.wallSnapshots || []).map(async s => ({ wallIndex: s.wallIndex, url: await sign(s.url) })))
  obj.items = await Promise.all((obj.items || []).map(async item => ({
    ...item,
    glbUrl: await sign(item.glbUrl),
    xCm: item.xCm ?? 0,
    yCm: item.yCm ?? 0,
    mount: item.mount || 'wall',
    wallIndex: item.wallIndex ?? 0,
    rotationDeg: item.rotationDeg ?? 0,
    colors: Array.isArray(item.colors) ? item.colors : [],
  })))
  if (obj.wallFinish) obj.wallFinish = await signFinishSnapshot(obj.wallFinish)
  if (obj.space) {
    obj.space = {
      ...obj.space,
      lengthsCm: obj.space.lengthsCm || [],
      walls: await Promise.all((obj.space.walls || []).map(async w => ({ ...w, finish: await signFinishSnapshot(w.finish) }))),
      floorFinish: await signFinishSnapshot(obj.space.floorFinish),
    }
  } else {
    obj.space = null
  }
  obj.expiresAt = obj.expiresAt?.toISOString?.() ?? String(obj.expiresAt)
  obj.createdAt = obj.createdAt?.toISOString?.() ?? String(obj.createdAt)
  return obj
}

export { sign as signS3Value }
