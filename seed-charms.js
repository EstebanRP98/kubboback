// seed-charms.js
// Ejecutar con: node seed-charms.js
// Requiere el archivo .env con MONGO_URI configurado

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Charm from './src/models/Charm.js'

dotenv.config()

// ─── DATOS SEED ────────────────────────────────────────────────────────────────
// Reemplaza los valores de `mainImage` e `images` con las URLs reales de Firebase
// cuando tengas las fotos del producto. Los precios están en USD.

const charms = [
  {
    name: 'Hueso',
    tagline: 'El clásico que nunca falla.',
    description: 'El charm más querido por los perros aventureros. Diseño icónico, liviano y resistente. Perfecto para collares de uso diario.',
    price: 8.99,
    emoji: '🦴',
    color: '#ffbe17',
    category: 'dog',
    mainImage: 'PLACEHOLDER_HUESO_MAIN',
    images: ['PLACEHOLDER_HUESO_1', 'PLACEHOLDER_HUESO_2'],
    details: [
      'Compatible con collares de 1 a 2.5 cm de ancho',
      'Peso: 4g — no molesta al caminar',
      'Diseño: Impresión artesanal',
      'Ideal para perros de todo tamaño',
    ],
    available: true,
    order: 1,
  },
  {
    name: 'Miel',
    tagline: 'Tan dulce como tu peludo.',
    description: 'Un charm adorable para mascotas con personalidad dulce. El tarro de miel que enamora a todos en el parque.',
    price: 8.99,
    emoji: '🍯',
    color: '#f59e0b',
    category: 'both',
    mainImage: 'PLACEHOLDER_MIEL_MAIN',
    images: ['PLACEHOLDER_MIEL_1', 'PLACEHOLDER_MIEL_2'],
    details: [
      'Compatible con collares de 1 a 2.5 cm de ancho',
      'Peso: 4g',
      'Diseño: Impresión artesanal',
      'Para perros y gatos',
    ],
    available: true,
    order: 2,
  },
  {
    name: 'Arco Iris',
    tagline: 'Tan colorido como su personalidad.',
    description: 'Para mascotas que llenan de color cada día. El charm más vibrante de la colección Kubbo.',
    price: 9.99,
    emoji: '🌈',
    color: '#8b5cf6',
    category: 'both',
    mainImage: 'PLACEHOLDER_ARCOIRIS_MAIN',
    images: ['PLACEHOLDER_ARCOIRIS_1', 'PLACEHOLDER_ARCOIRIS_2'],
    details: [
      'Compatible con collares de 1 a 2.5 cm de ancho',
      'Peso: 4g',
      'Diseño: Impresión artesanal multicolor',
      'Para perros y gatos',
    ],
    available: true,
    order: 3,
  },
  {
    name: 'Taza',
    tagline: 'Para las mañanas de paseo.',
    description: 'El charm perfecto para los peludos madrugadores. Ideal para dueños que aman el café tanto como a sus mascotas.',
    price: 8.99,
    emoji: '☕',
    color: '#92400e',
    category: 'both',
    mainImage: 'PLACEHOLDER_TAZA_MAIN',
    images: ['PLACEHOLDER_TAZA_1', 'PLACEHOLDER_TAZA_2'],
    details: [
      'Compatible con collares de 1 a 2.5 cm de ancho',
      'Peso: 4.5g',
      'Diseño: Impresión artesanal',
      'Para perros y gatos',
    ],
    available: true,
    order: 4,
  },
  {
    name: 'Sol',
    tagline: 'Brilla tanto como ellos.',
    description: 'Para las mascotas que iluminan cada habitación. Un rayo de luz en cada salida al parque.',
    price: 8.99,
    emoji: '☀️',
    color: '#fbbf24',
    category: 'both',
    mainImage: 'PLACEHOLDER_SOL_MAIN',
    images: ['PLACEHOLDER_SOL_1', 'PLACEHOLDER_SOL_2'],
    details: [
      'Compatible con collares de 1 a 2.5 cm de ancho',
      'Peso: 4g',
      'Diseño: Impresión artesanal',
      'Para perros y gatos',
    ],
    available: true,
    order: 5,
  },
  {
    name: 'Pelota',
    tagline: 'Para los que siempre quieren jugar.',
    description: 'El charm del perro que nunca se cansa. Lleva su juguete favorito a donde vaya.',
    price: 8.99,
    emoji: '⚽',
    color: '#16a34a',
    category: 'dog',
    mainImage: 'PLACEHOLDER_PELOTA_MAIN',
    images: ['PLACEHOLDER_PELOTA_1', 'PLACEHOLDER_PELOTA_2'],
    details: [
      'Compatible con collares de 1 a 2.5 cm de ancho',
      'Peso: 4g',
      'Diseño: Impresión artesanal',
      'Especial para perros activos',
    ],
    available: true,
    order: 6,
  },
  {
    name: 'Luna',
    tagline: 'Para los más nocturnos.',
    description: 'El charm de los gatos misteriosos. Perfecto para tu felino que se convierte en dueño de la noche.',
    price: 9.99,
    emoji: '🌙',
    color: '#4f46e5',
    category: 'cat',
    mainImage: 'PLACEHOLDER_LUNA_MAIN',
    images: ['PLACEHOLDER_LUNA_1', 'PLACEHOLDER_LUNA_2'],
    details: [
      'Compatible con collares de 0.8 a 1.5 cm de ancho',
      'Peso: 3g — ultra liviano para gatos',
      'Diseño: Impresión artesanal',
      'Especial para gatos',
    ],
    available: true,
    order: 7,
  },
  {
    name: 'Pez',
    tagline: 'El favorito de los gatos curiosos.',
    description: 'Para el gato que no puede ver un acuario sin quedarse hipnotizado. El charm que refleja su instinto cazador.',
    price: 9.99,
    emoji: '🐠',
    color: '#0ea5e9',
    category: 'cat',
    mainImage: 'PLACEHOLDER_PEZ_MAIN',
    images: ['PLACEHOLDER_PEZ_1', 'PLACEHOLDER_PEZ_2'],
    details: [
      'Compatible con collares de 0.8 a 1.5 cm de ancho',
      'Peso: 3g — ultra liviano para gatos',
      'Diseño: Impresión artesanal',
      'Especial para gatos',
    ],
    available: true,
    order: 8,
  },
]

// ─── CONEXIÓN Y SEED ────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB conectado')

    // Elimina charms anteriores para evitar duplicados
    await Charm.deleteMany({})
    console.log('🗑️  Charms anteriores eliminados')

    const created = await Charm.insertMany(charms)
    console.log(`✅ ${created.length} charms insertados:`)
    created.forEach(c => console.log(`   ${c.emoji} ${c.name} — $${c.price}`))

  } catch (err) {
    console.error('❌ Error en seed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
  }
}

seed()
