import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Dynamic imports to use ESM models
const { default: WallType }        = await import('./src/models/WallType.js')
const { default: WallFinish }      = await import('./src/models/WallFinish.js')
const { default: FurnitureDesign } = await import('./src/models/FurnitureDesign.js')

await mongoose.connect(process.env.MONGO_URI)
console.log('✅ Connected to MongoDB')

// ── Wall types (MVP: solo pared plana disponible — ver VISION.md §14) ──
const wallTypes = [
  { key: 'flat',   name: 'Pared plana',   illustrationUrl: '', defaultWidthCm: 180, defaultHeightCm: 210, available: true,  order: 1 },
  { key: 'corner', name: 'Pared esquina', illustrationUrl: '', defaultWidthCm: 180, defaultHeightCm: 210, available: false, order: 2 },
]

// ── Wall finishes (del mockup real: 4 colores + 1 textura + 1 color extra) ──
const wallFinishes = [
  { key: 'blanco',    name: 'Blanco',     kind: 'color',   colorHex: '#f7f3ec', textureUrl: '', order: 1 },
  { key: 'negro',     name: 'Negro',      kind: 'color',   colorHex: '#33323a', textureUrl: '', order: 2 },
  { key: 'empastado', name: 'Empastado',  kind: 'color',   colorHex: '#e2d8c8', textureUrl: '', order: 3 },
  { key: 'ladrillo',  name: 'Ladrillo',   kind: 'texture', colorHex: '#b4674c', textureUrl: '', order: 4 },
  { key: 'arena',     name: 'Arena',      kind: 'color',   colorHex: '#e0c3a4', textureUrl: '', order: 5 },
  { key: 'salvia',    name: 'Salvia',     kind: 'color',   colorHex: '#b6c3b3', textureUrl: '', order: 6 },
]

// ── Furniture designs (MVP: 2 diseños — placeholders 3D hasta subir .glb reales) ──
const furnitureDesigns = [
  { key: 'repisa_circular', name: 'Repisa circular', glbUrl: '', thumbnailUrl: '', widthCm: 30, heightCm: 30, depthCm: 15, price: 22, order: 1 },
  { key: 'repisa_plancha',  name: 'Repisa plancha',  glbUrl: '', thumbnailUrl: '', widthCm: 40, heightCm: 4,  depthCm: 20, price: 20, order: 2 },
]

// ── Seed ──────────────────────────────────────────────────────
await WallType.deleteMany({})
await WallType.insertMany(wallTypes)
console.log(`✅ WallTypes: ${wallTypes.length} insertados`)

await WallFinish.deleteMany({})
await WallFinish.insertMany(wallFinishes)
console.log(`✅ WallFinishes: ${wallFinishes.length} insertados`)

await FurnitureDesign.deleteMany({})
await FurnitureDesign.insertMany(furnitureDesigns)
console.log(`✅ FurnitureDesigns: ${furnitureDesigns.length} insertados`)

await mongoose.disconnect()
console.log('🎉 Seed completado')
