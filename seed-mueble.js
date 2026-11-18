// Seed del catálogo de Arma tu Mueble (ambientes, modelos de espacio, acabados de pared y piso,
// diseños de mueble). NO destructivo: solo crea lo que falta. Uso: npm run seed:mueble
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { seedMissing } from './seed-utils.js'

dotenv.config()

// Dynamic imports to use ESM models
const { default: Ambient }         = await import('./src/models/Ambient.js')
const { default: WallType }        = await import('./src/models/WallType.js')
const { default: WallFinish }      = await import('./src/models/WallFinish.js')
const { default: FloorFinish }     = await import('./src/models/FloorFinish.js')
const { default: FurnitureDesign } = await import('./src/models/FurnitureDesign.js')

await mongoose.connect(process.env.MONGO_URI)
console.log('✅ Connected to MongoDB')

// ── Ambientes (VISION.md Parte 3) ──
const ambients = [
  { key: 'sala',       name: 'Sala',       outdoor: false, defaultHeightCm: 240, defaultWallFinishKey: 'blanco',       defaultFloorFinishKey: 'madera_clara', order: 1 },
  { key: 'habitacion', name: 'Habitación', outdoor: false, defaultHeightCm: 240, defaultWallFinishKey: 'arena',        defaultFloorFinishKey: 'alfombra_gris', order: 2 },
  { key: 'patio',      name: 'Patio',      outdoor: true,  defaultHeightCm: 120, defaultWallFinishKey: 'cerca_madera', defaultFloorFinishKey: 'cesped',       order: 3 },
]

// ── Modelos de espacio (colección WallType) ──
// 'flat' y 'corner' ya existían del MVP; el resto es nuevo.
const wallTypes = [
  { key: 'flat',   name: 'Pared plana',    shape: 'flat',   defaultLengthsCm: [300],                defaultWidthCm: 300, defaultHeightCm: 240, available: true, order: 1 },
  { key: 'corner', name: 'Esquina',        shape: 'corner', defaultLengthsCm: [300, 400],           defaultWidthCm: 300, defaultHeightCm: 240, available: true, order: 2 },
  { key: 'u',      name: 'Tres paredes',   shape: 'u',      defaultLengthsCm: [300, 400, 300],      defaultWidthCm: 300, defaultHeightCm: 240, available: true, order: 3 },
  { key: 'room',   name: 'Cuarto cerrado', shape: 'room',   defaultLengthsCm: [400, 300],           defaultWidthCm: 400, defaultHeightCm: 240, available: true, order: 4 },
  { key: 'l',      name: 'En L',           shape: 'l',      defaultLengthsCm: [500, 400, 200, 150], defaultWidthCm: 500, defaultHeightCm: 240, available: true, order: 5 },
]

// ── Acabados de pared ──
const wallFinishes = [
  { key: 'blanco',       name: 'Blanco',          kind: 'color',   colorHex: '#f7f3ec', textureUrl: '', order: 1 },
  { key: 'negro',        name: 'Negro',           kind: 'color',   colorHex: '#33323a', textureUrl: '', order: 2 },
  { key: 'empastado',    name: 'Empastado',       kind: 'color',   colorHex: '#e2d8c8', textureUrl: '', order: 3 },
  { key: 'ladrillo',     name: 'Ladrillo',        kind: 'texture', colorHex: '#b4674c', textureUrl: '', order: 4 },
  { key: 'arena',        name: 'Arena',           kind: 'color',   colorHex: '#e0c3a4', textureUrl: '', order: 5 },
  { key: 'salvia',       name: 'Salvia',          kind: 'color',   colorHex: '#b6c3b3', textureUrl: '', order: 6 },
  { key: 'cerca_madera', name: 'Cerca de madera', kind: 'texture', colorHex: '#9a7552', textureUrl: '', scope: 'exterior', order: 7 },
  { key: 'muro_exterior', name: 'Muro exterior',  kind: 'color',   colorHex: '#d9cbb5', textureUrl: '', scope: 'exterior', order: 8 },
]

// ── Acabados de piso ──
// Las texturas sin archivo subido usan las de respaldo en kubboFront/public/textures/
const floorFinishes = [
  { key: 'madera_clara',  name: 'Madera clara',  kind: 'texture', colorHex: '#d8b98f', textureUrl: '', scope: 'interior', order: 1 },
  { key: 'porcelanato',   name: 'Porcelanato',   kind: 'color',   colorHex: '#e8e4de', textureUrl: '', scope: 'interior', order: 2 },
  { key: 'alfombra_gris', name: 'Alfombra gris', kind: 'color',   colorHex: '#b9b6b1', textureUrl: '', scope: 'interior', order: 3 },
  { key: 'cemento',       name: 'Cemento',       kind: 'color',   colorHex: '#a8a49c', textureUrl: '', scope: 'both',     order: 4 },
  { key: 'cesped',        name: 'Césped',        kind: 'texture', colorHex: '#7aa45a', textureUrl: '', scope: 'exterior', order: 5 },
  { key: 'deck',          name: 'Deck de madera', kind: 'texture', colorHex: '#9c6b43', textureUrl: '', scope: 'exterior', order: 6 },
]

// ── Diseños de mueble (placeholders 3D hasta subir .glb reales) ──
const furnitureDesigns = [
  { key: 'repisa_circular', name: 'Repisa circular', glbUrl: '', thumbnailUrl: '', widthCm: 30, heightCm: 30,  depthCm: 15, price: 22, mount: 'wall',  scope: 'interior', order: 1 },
  { key: 'repisa_plancha',  name: 'Repisa plancha',  glbUrl: '', thumbnailUrl: '', widthCm: 40, heightCm: 4,   depthCm: 20, price: 20, mount: 'wall',  scope: 'interior', order: 2 },
  { key: 'rascador_torre',  name: 'Rascador torre',  glbUrl: '', thumbnailUrl: '', widthCm: 45, heightCm: 120, depthCm: 45, price: 45, mount: 'floor', scope: 'interior', order: 3 },
  { key: 'casita_exterior', name: 'Casita exterior', glbUrl: '', thumbnailUrl: '', widthCm: 60, heightCm: 55,  depthCm: 50, price: 55, mount: 'floor', scope: 'exterior', order: 4 },
]

// ── Seed ──────────────────────────────────────────────────────
// NO destructivo: solo crea lo que falta (ver seed-utils.js). El catálogo real se administra
// desde /admin/catalogo (GLB, miniaturas, precios).

await seedMissing(Ambient, ambients, 'Ambients')
await seedMissing(WallType, wallTypes, 'WallTypes (modelos de espacio)')
await seedMissing(WallFinish, wallFinishes, 'WallFinishes')
await seedMissing(FloorFinish, floorFinishes, 'FloorFinishes')
await seedMissing(FurnitureDesign, furnitureDesigns, 'FurnitureDesigns')

// Actualización única de los modelos del MVP de una pared (VISION.md Parte 3, §29):
// - Solo toca registros que todavía NO tienen el campo `shape` (nunca se editaron con el admin nuevo).
// - Solo AGREGA shape y medidas por defecto; no cambia nombre, precio ni otros campos.
// - 'corner' se sembró en el MVP con available:false porque la esquina no existía. Ahora sí existe,
//   así que se habilita una sola vez. Si después lo ocultas desde el admin, el seed ya no lo toca.
const flatUp = await WallType.updateOne(
  { key: 'flat', shape: { $exists: false } },
  { $set: { shape: 'flat' } },
)
const cornerUp = await WallType.updateOne(
  { key: 'corner', shape: { $exists: false } },
  { $set: { shape: 'corner', defaultLengthsCm: [300, 400], available: true } },
)
console.log(`✅ Modelos del MVP actualizados: flat ${flatUp.modifiedCount}, corner ${cornerUp.modifiedCount}`)

await mongoose.disconnect()
console.log('🎉 Seed completado')
