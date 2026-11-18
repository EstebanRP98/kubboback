// Geometría de los espacios de "Arma tu Mueble" (VISION.md Parte 3, §26–§29).
//
// ⚠️ Este archivo existe IDÉNTICO en kubboback/src/lib/muebleGeometry.js y en
// kubboFront/src/lib/muebleGeometry.js (repos separados). Si cambias uno, copia el otro.
//
// Convenciones (todo en cm):
// - Planta vista desde arriba: eje x a la derecha, eje z "hacia el cliente". La pared del
//   fondo está en z = 0 y el interior del espacio queda en z > 0.
// - Cada pared va de `a` a `b` tal como la ve alguien parado dentro del espacio, de izquierda
//   a derecha. `u` es la dirección a→b y `n` la normal hacia el interior: n = (-u.z, u.x).
// - Mueble de pared: `xCm` = centro medido desde el borde izquierdo de su pared, `yCm` = centro
//   medido desde el piso. Su espalda queda pegada a la pared.
// - Mueble de piso: `floorXCm`/`floorZCm` = centro en la planta, `rotationDeg` ∈ {0,90,180,270}.

export const SHAPES = ['flat', 'corner', 'u', 'room', 'l']

export const SHAPE_LABELS = {
  flat: 'Una pared',
  corner: 'Esquina',
  u: 'Tres paredes',
  room: 'Cuarto cerrado',
  l: 'En L',
}

// Medidas independientes que escribe el cliente, por forma (VISION.md §26)
export const SHAPE_FIELDS = {
  flat:   ['Largo de la pared'],
  corner: ['Pared izquierda', 'Pared del fondo'],
  u:      ['Pared izquierda', 'Pared del fondo', 'Pared derecha'],
  room:   ['Ancho', 'Fondo'],
  l:      ['Ancho total', 'Fondo total', 'Ancho del entrante', 'Fondo del entrante'],
}

export const DEFAULT_LENGTHS = {
  flat:   [300],
  corner: [300, 400],
  u:      [300, 400, 300],
  room:   [400, 300],
  l:      [500, 400, 200, 150],
}

export const LIMITS = {
  minLengthCm: 50,
  maxLengthCm: 1200,
  minHeightCm: 100,
  minHeightOutdoorCm: 50,
  maxHeightCm: 400,
}

// Profundidad del piso delante de las formas abiertas
const MIN_OPEN_FLOOR_DEPTH = 200

/** Forma de un modelo de espacio; los registros viejos sin `shape` se deducen de su key. */
export function resolveShape(model) {
  if (model?.shape && SHAPES.includes(model.shape)) return model.shape
  if (model?.key === 'corner') return 'corner'
  return 'flat'
}

/** Medidas por defecto de un modelo (con respaldo para registros viejos de una sola pared). */
export function defaultLengthsFor(model) {
  const shape = resolveShape(model)
  const n = SHAPE_FIELDS[shape].length
  const raw = Array.isArray(model?.defaultLengthsCm) ? model.defaultLengthsCm.filter(v => Number(v) > 0) : []
  if (raw.length === n) return raw.map(Number)
  if (shape === 'flat' && Number(model?.defaultWidthCm) > 0) return [Number(model.defaultWidthCm)]
  return [...DEFAULT_LENGTHS[shape]]
}

/**
 * Valida las medidas escritas por el cliente. Devuelve un arreglo de mensajes (vacío = válido).
 * `errors[i]` corresponde al campo i; `heightError` y `general` aparte.
 */
export function validateDimensions(shape, lengthsCm, heightCm, outdoor = false) {
  const fields = SHAPE_FIELDS[shape] || []
  const errors = fields.map(() => '')
  let heightError = ''
  const general = []
  const { minLengthCm, maxLengthCm, maxHeightCm } = LIMITS
  const minH = outdoor ? LIMITS.minHeightOutdoorCm : LIMITS.minHeightCm

  if (!Array.isArray(lengthsCm) || lengthsCm.length !== fields.length) {
    general.push('Faltan medidas de las paredes.')
    return { ok: false, errors, heightError, general }
  }
  lengthsCm.forEach((v, i) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0) errors[i] = 'Escribe una medida'
    else if (n < minLengthCm) errors[i] = `Mínimo ${minLengthCm} cm`
    else if (n > maxLengthCm) errors[i] = `Máximo ${maxLengthCm} cm`
  })
  const h = Number(heightCm)
  if (!Number.isFinite(h) || h <= 0) heightError = 'Escribe el alto'
  else if (h < minH) heightError = `Mínimo ${minH} cm`
  else if (h > maxHeightCm) heightError = `Máximo ${maxHeightCm} cm`

  if (shape === 'l' && errors.every(e => !e)) {
    const [W, D, nW, nD] = lengthsCm.map(Number)
    if (W - nW < minLengthCm) errors[2] = `Debe ser al menos ${minLengthCm} cm menor que el ancho total`
    if (D - nD < minLengthCm) errors[3] = `Debe ser al menos ${minLengthCm} cm menor que el fondo total`
  }
  const ok = errors.every(e => !e) && !heightError && general.length === 0
  return { ok, errors, heightError, general }
}

function wallFrom(index, label, a, b) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const lengthCm = Math.hypot(dx, dz)
  const u = [dx / lengthCm, dz / lengthCm]
  const n = [-u[1], u[0]]
  return { index, label, a, b, u, n, lengthCm }
}

/**
 * Construye el espacio a partir de la forma y las medidas independientes.
 * Devuelve { shape, walls, floor: [[x,z]...] (polígono), closed, bounds, backWallIndex }.
 */
export function buildSpace(shape, lengthsCm) {
  const L = (lengthsCm || []).map(Number)
  let pts
  let closed = false
  let floor

  switch (shape) {
    case 'corner': {
      const [left, back] = L
      pts = [[0, left], [0, 0], [back, 0]]
      floor = rect(0, 0, back, Math.max(left, MIN_OPEN_FLOOR_DEPTH))
      break
    }
    case 'u': {
      const [left, back, right] = L
      pts = [[0, left], [0, 0], [back, 0], [back, right]]
      floor = rect(0, 0, back, Math.max(left, right, MIN_OPEN_FLOOR_DEPTH))
      break
    }
    case 'room': {
      const [W, D] = L
      pts = [[0, D], [0, 0], [W, 0], [W, D], [0, D]]
      closed = true
      floor = rect(0, 0, W, D)
      break
    }
    case 'l': {
      const [W, D, nW, nD] = L
      pts = [[0, D], [0, 0], [W, 0], [W, D - nD], [W - nW, D - nD], [W - nW, D], [0, D]]
      closed = true
      floor = [[0, 0], [W, 0], [W, D - nD], [W - nW, D - nD], [W - nW, D], [0, D]]
      break
    }
    case 'flat':
    default: {
      const [len] = L
      pts = [[0, 0], [len, 0]]
      floor = rect(0, 0, len, Math.max(MIN_OPEN_FLOOR_DEPTH, Math.min(len * 0.6, 400)))
      break
    }
  }

  const walls = []
  for (let i = 0; i < pts.length - 1; i++) {
    walls.push(wallFrom(i, `Pared ${i + 1}`, pts[i], pts[i + 1]))
  }

  const xs = floor.map(p => p[0])
  const zs = floor.map(p => p[1])
  const bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) }

  // Pared del fondo = la de normal +z más larga (la que queda frente al cliente)
  let backWallIndex = 0
  let best = -1
  walls.forEach(w => {
    if (Math.abs(w.n[1] - 1) < 1e-6 && w.lengthCm > best) { best = w.lengthCm; backWallIndex = w.index }
  })

  return { shape: SHAPES.includes(shape) ? shape : 'flat', walls, floor, closed, bounds, backWallIndex }
}

function rect(x0, z0, x1, z1) {
  return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]
}

/** Punto dentro de polígono (ray casting). */
export function pointInPolygon(x, z, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]
    const [xj, zj] = poly[j]
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

/** Medidas de la huella en planta de un mueble de piso según su giro. */
export function floorFootprint(design, rotationDeg = 0) {
  const r = ((Math.round(rotationDeg / 90) * 90) % 360 + 360) % 360
  const swap = r === 90 || r === 270
  return { w: swap ? design.depthCm : design.widthCm, d: swap ? design.widthCm : design.depthCm }
}

/**
 * Caja 3D (alineada a los ejes) de un mueble colocado, en cm del mundo.
 * Sirve para la regla "no encimarse" (también entre paredes vecinas y pared/piso).
 */
export function itemBox(item, design, space, heightCm) {
  if (!design) return null
  if ((design.mount || 'wall') === 'floor') {
    const { w, d } = floorFootprint(design, item.rotationDeg)
    const x = Number(item.floorXCm) || 0
    const z = Number(item.floorZCm) || 0
    return { minX: x - w / 2, maxX: x + w / 2, minY: 0, maxY: design.heightCm, minZ: z - d / 2, maxZ: z + d / 2 }
  }
  const wall = space.walls[item.wallIndex ?? 0]
  if (!wall) return null
  const s = Number(item.xCm) || 0
  const cx = wall.a[0] + wall.u[0] * s
  const cz = wall.a[1] + wall.u[1] * s
  // extremos a lo largo de la pared y hacia el interior
  const p1 = [cx - wall.u[0] * design.widthCm / 2, cz - wall.u[1] * design.widthCm / 2]
  const p2 = [cx + wall.u[0] * design.widthCm / 2, cz + wall.u[1] * design.widthCm / 2]
  const p3 = [p1[0] + wall.n[0] * design.depthCm, p1[1] + wall.n[1] * design.depthCm]
  const p4 = [p2[0] + wall.n[0] * design.depthCm, p2[1] + wall.n[1] * design.depthCm]
  const xs = [p1[0], p2[0], p3[0], p4[0]]
  const zs = [p1[1], p2[1], p3[1], p4[1]]
  const y = Number(item.yCm) || 0
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: y - design.heightCm / 2, maxY: y + design.heightCm / 2,
    minZ: Math.min(...zs), maxZ: Math.max(...zs),
  }
}

/** ¿Se superponen dos cajas? Tocarse (bordes alineados por el imán) NO cuenta. */
export function boxesOverlap(a, b, eps = 0.1) {
  if (!a || !b) return false
  return a.minX < b.maxX - eps && a.maxX > b.minX + eps &&
         a.minY < b.maxY - eps && a.maxY > b.minY + eps &&
         a.minZ < b.maxZ - eps && a.maxZ > b.minZ + eps
}

/**
 * ¿El mueble queda completo dentro de su pared o del piso? `tol` = tolerancia en cm
 * (el servidor usa 1 cm para no rechazar redondeos).
 */
export function isItemInside(item, design, space, heightCm, tol = 0) {
  if (!design) return false
  if ((design.mount || 'wall') === 'floor') {
    if (design.heightCm > heightCm + tol && space.closed) return false
    const { w, d } = floorFootprint(design, item.rotationDeg)
    const x = Number(item.floorXCm)
    const z = Number(item.floorZCm)
    if (!Number.isFinite(x) || !Number.isFinite(z)) return false
    const hw = Math.max(0, w / 2 - tol)
    const hd = Math.max(0, d / 2 - tol)
    const e = 0.01 // los bordes exactos cuentan como dentro
    const corners = [[x - hw + e, z - hd + e], [x + hw - e, z - hd + e], [x + hw - e, z + hd - e], [x - hw + e, z + hd - e]]
    return corners.every(([cx, cz]) => pointInPolygon(cx, cz, space.floor))
  }
  const wall = space.walls[item.wallIndex]
  if (!wall) return false
  const x = Number(item.xCm)
  const y = Number(item.yCm)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false
  return x - design.widthCm / 2 >= -tol && x + design.widthCm / 2 <= wall.lengthCm + tol &&
         y - design.heightCm / 2 >= -tol && y + design.heightCm / 2 <= heightCm + tol
}

/** Ajusta un mueble para que quede dentro (sin validar superposición). */
export function clampItem(item, design, space, heightCm) {
  if (!design) return item
  if ((design.mount || 'wall') === 'floor') {
    const { w, d } = floorFootprint(design, item.rotationDeg)
    const { minX, maxX, minZ, maxZ } = space.bounds
    let x = clamp(Number(item.floorXCm) || 0, minX + w / 2, maxX - w / 2)
    let z = clamp(Number(item.floorZCm) || 0, minZ + d / 2, maxZ - d / 2)
    // En la L, si cae en el entrante, se empuja al rectángulo más cercano
    if (!isItemInside({ ...item, floorXCm: x, floorZCm: z }, design, space, heightCm)) {
      const best = nearestInsideFloor({ ...item, floorXCm: x, floorZCm: z }, design, space, heightCm)
      if (best) { x = best.floorXCm; z = best.floorZCm }
    }
    return { ...item, floorXCm: x, floorZCm: z }
  }
  const wall = space.walls[item.wallIndex] || space.walls[0]
  const x = clamp(Number(item.xCm) || 0, design.widthCm / 2, wall.lengthCm - design.widthCm / 2)
  const y = clamp(Number(item.yCm) || 0, design.heightCm / 2, heightCm - design.heightCm / 2)
  return { ...item, wallIndex: wall.index, xCm: x, yCm: y }
}

function nearestInsideFloor(item, design, space, heightCm) {
  const { minX, maxX, minZ, maxZ } = space.bounds
  let best = null
  let bestDist = Infinity
  const step = 5
  for (let x = minX; x <= maxX; x += step) {
    for (let z = minZ; z <= maxZ; z += step) {
      const cand = { ...item, floorXCm: x, floorZCm: z }
      if (!isItemInside(cand, design, space, heightCm)) continue
      const dist = Math.hypot(x - item.floorXCm, z - item.floorZCm)
      if (dist < bestDist) { bestDist = dist; best = cand }
    }
  }
  return best
}

function clamp(v, lo, hi) {
  if (hi < lo) return (lo + hi) / 2
  return Math.min(hi, Math.max(lo, v))
}

/** Busca la posición válida libre más cercana a la preferida. Devuelve el item o null. */
export function findFreeSpot(item, design, space, heightCm, others, designsByKey) {
  const otherBoxes = others.map(o => itemBox(o, designsByKey.get(o.designKey), space, heightCm)).filter(Boolean)
  const free = cand => {
    if (!isItemInside(cand, design, space, heightCm)) return false
    const box = itemBox(cand, design, space, heightCm)
    return otherBoxes.every(b => !boxesOverlap(box, b))
  }
  const start = clampItem(item, design, space, heightCm)
  if (free(start)) return start
  const step = 5
  let best = null
  let bestDist = Infinity
  if ((design.mount || 'wall') === 'floor') {
    const { minX, maxX, minZ, maxZ } = space.bounds
    for (let x = minX; x <= maxX; x += step) {
      for (let z = minZ; z <= maxZ; z += step) {
        const cand = { ...start, floorXCm: x, floorZCm: z }
        const dist = Math.hypot(x - start.floorXCm, z - start.floorZCm)
        if (dist < bestDist && free(cand)) { bestDist = dist; best = cand }
      }
    }
    return best
  }
  const wallsToTry = [start.wallIndex, ...space.walls.map(w => w.index).filter(i => i !== start.wallIndex)]
  for (const wi of wallsToTry) {
    const wall = space.walls[wi]
    for (let x = design.widthCm / 2; x <= wall.lengthCm - design.widthCm / 2 + 0.01; x += step) {
      for (let y = design.heightCm / 2; y <= heightCm - design.heightCm / 2 + 0.01; y += step) {
        const cand = { ...start, wallIndex: wi, xCm: x, yCm: y }
        const dist = Math.hypot(x - start.xCm, y - start.yCm) + (wi === start.wallIndex ? 0 : 100000)
        if (dist < bestDist && free(cand)) { bestDist = dist; best = cand }
      }
    }
    if (best) return best
  }
  return best
}

/** Distancias de un mueble a su entorno (para las etiquetas y la descripción del admin). */
export function placementInfo(item, design, space, heightCm) {
  if (!design) return null
  if ((design.mount || 'wall') === 'floor') {
    const box = itemBox(item, design, space, heightCm)
    const near = []
    space.walls.forEach(w => {
      const vertical = Math.abs(w.u[0]) < 1e-6 // la pared va a lo largo de z
      if (vertical) {
        const wx = w.a[0]
        const z0 = Math.min(w.a[1], w.b[1]); const z1 = Math.max(w.a[1], w.b[1])
        if (box.maxZ <= z0 || box.minZ >= z1) return
        const dist = w.n[0] > 0 ? box.minX - wx : wx - box.maxX
        if (dist >= -0.5) near.push({ wallIndex: w.index, label: w.label, distCm: Math.max(0, dist), axis: 'x' })
      } else {
        const wz = w.a[1]
        const x0 = Math.min(w.a[0], w.b[0]); const x1 = Math.max(w.a[0], w.b[0])
        if (box.maxX <= x0 || box.minX >= x1) return
        const dist = w.n[1] > 0 ? box.minZ - wz : wz - box.maxZ
        if (dist >= -0.5) near.push({ wallIndex: w.index, label: w.label, distCm: Math.max(0, dist), axis: 'z' })
      }
    })
    // la más cercana en cada eje
    const pick = axis => near.filter(n => n.axis === axis).sort((a, b) => a.distCm - b.distCm)[0]
    const walls = [pick('z'), pick('x')].filter(Boolean)
    return { mount: 'floor', walls, rotationDeg: ((Number(item.rotationDeg) || 0) % 360 + 360) % 360 }
  }
  const wall = space.walls[item.wallIndex]
  if (!wall) return null
  return {
    mount: 'wall',
    wallIndex: wall.index,
    label: wall.label,
    leftCm: Math.max(0, item.xCm - design.widthCm / 2),
    rightCm: Math.max(0, wall.lengthCm - (item.xCm + design.widthCm / 2)),
    floorCm: Math.max(0, item.yCm - design.heightCm / 2),
    centerFromLeftCm: item.xCm,
    centerFromFloorCm: item.yCm,
  }
}

/** Texto para el admin: "Pared 2 · centro a 45 cm del borde izquierdo y 120 cm del piso". */
export function describePlacement(item, design, space, heightCm) {
  const info = placementInfo(item, design, space, heightCm)
  if (!info) return ''
  const r = n => Math.round(n)
  if (info.mount === 'floor') {
    const parts = info.walls.map(w => `a ${r(w.distCm)} cm de la ${w.label.toLowerCase()}`)
    const rot = info.rotationDeg ? ` · girado ${info.rotationDeg}°` : ''
    return `Piso${parts.length ? ' · ' + parts.join(' y ') : ''}${rot}`
  }
  return `${info.label} · centro a ${r(info.centerFromLeftCm)} cm del borde izquierdo y ${r(info.centerFromFloorCm)} cm del piso`
}

/** Distancia horizontal total del espacio (para el campo legacy widthCm del pedido). */
export function spaceWidthCm(space) {
  return Math.round(space.bounds.maxX - space.bounds.minX)
}
