import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

// Dynamic imports to use ESM models
const { default: CollarColor }   = await import('./src/models/CollarColor.js')
const { default: CollarDesign }  = await import('./src/models/CollarDesign.js')
const { default: CollarCharm }   = await import('./src/models/CollarCharm.js')
const { default: CollarPricing } = await import('./src/models/CollarPricing.js')
const { default: AdminUser }     = await import('./src/models/AdminUser.js')

await mongoose.connect(process.env.MONGO_URI)
console.log('✅ Connected to MongoDB')

// ── Colors (9 from the design) ────────────────────────────────
const colors = [
  { key: 'lila',     name: 'Lila',         lightHex: '#d9b8f5', darkHex: '#894b8d', showFirst: true,  order: 1 },
  { key: 'rosado',   name: 'Rosado',       lightHex: '#f5b8d0', darkHex: '#c0456e', showFirst: false, order: 2 },
  { key: 'azul',     name: 'Azul',         lightHex: '#b8d0f5', darkHex: '#2a5db0', showFirst: false, order: 3 },
  { key: 'verde',    name: 'Verde',        lightHex: '#b8f5c8', darkHex: '#2a8c4a', showFirst: false, order: 4 },
  { key: 'amarillo', name: 'Amarillo',     lightHex: '#f5e6b8', darkHex: '#c09020', showFirst: false, order: 5 },
  { key: 'naranja',  name: 'Naranja',      lightHex: '#f5cdb8', darkHex: '#c05020', showFirst: false, order: 6 },
  { key: 'rojo',     name: 'Rojo',         lightHex: '#f5b8b8', darkHex: '#b02020', showFirst: false, order: 7 },
  { key: 'negro',    name: 'Negro',        lightHex: '#888888', darkHex: '#111111', showFirst: false, order: 8 },
  { key: 'blanco',   name: 'Blanco',       lightHex: '#f0f0f0', darkHex: '#cccccc', showFirst: false, order: 9 },
]

// ── Designs (3 braid patterns) ────────────────────────────────
const designs = [
  { name: 'Sencillo',  degTop: 0,  degBottom: 90,  order: 1 },
  { name: 'Diagonal',  degTop: 45, degBottom: 135, order: 2 },
  { name: 'Cruzado',   degTop: 30, degBottom: 150, order: 3 },
]

// ── Charms (12 items) ──────────────────────────────────────────
const charms = [
  { key: 'hueso',      name: 'Hueso',      category: 'dog',  emoji: '🦴', showFirst: true,  order: 1  },
  { key: 'pata',       name: 'Pata',       category: 'both', emoji: '🐾', showFirst: true,  order: 2  },
  { key: 'corazon',    name: 'Corazón',    category: 'both', emoji: '❤️', showFirst: false, order: 3  },
  { key: 'estrella',   name: 'Estrella',   category: 'both', emoji: '⭐', showFirst: false, order: 4  },
  { key: 'flor',       name: 'Flor',       category: 'both', emoji: '🌸', showFirst: false, order: 5  },
  { key: 'luna',       name: 'Luna',       category: 'both', emoji: '🌙', showFirst: false, order: 6  },
  { key: 'corona',     name: 'Corona',     category: 'both', emoji: '👑', showFirst: false, order: 7  },
  { key: 'mariposa',   name: 'Mariposa',   category: 'cat',  emoji: '🦋', showFirst: false, order: 8  },
  { key: 'arco_iris',  name: 'Arcoíris',   category: 'both', emoji: '🌈', showFirst: false, order: 9  },
  { key: 'pelota',     name: 'Pelota',     category: 'dog',  emoji: '⚽', showFirst: false, order: 10 },
  { key: 'pescado',    name: 'Pescado',    category: 'cat',  emoji: '🐟', showFirst: false, order: 11 },
  { key: 'diamante',   name: 'Diamante',   category: 'both', emoji: '💎', showFirst: false, order: 12 },
]

// ── Seed ──────────────────────────────────────────────────────
await CollarColor.deleteMany({})
await CollarColor.insertMany(colors)
console.log(`✅ CollarColors: ${colors.length} insertados`)

await CollarDesign.deleteMany({})
await CollarDesign.insertMany(designs)
console.log(`✅ CollarDesigns: ${designs.length} insertados`)

await CollarCharm.deleteMany({})
await CollarCharm.insertMany(charms)
console.log(`✅ CollarCharms: ${charms.length} insertados`)

const existingPricing = await CollarPricing.findOne()
if (!existingPricing) {
  await CollarPricing.create({
    basePrice:      4.00,
    charmPrice:     1.00,
    letterPrice:    0.50,
    maxCharms:      6,
    maxLetters:     10,
    whatsappNumber: '+593992958177',
  })
  console.log('✅ CollarPricing creado')
} else {
  console.log('ℹ️  CollarPricing ya existe, sin cambios')
}

const existingAdmin = await AdminUser.findOne({ username: 'mykubboadmin' })
if (!existingAdmin) {
  const passwordHash = await bcrypt.hash('mykubbo98', 12)
  await AdminUser.create({ username: 'mykubboadmin', passwordHash })
  console.log('✅ AdminUser creado: mykubboadmin')
} else {
  console.log('ℹ️  AdminUser ya existe, sin cambios')
}

await mongoose.disconnect()
console.log('🎉 Seed completado')
