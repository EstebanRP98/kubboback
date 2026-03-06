// seed-furniture.js — ejecutar con: npm run seed:furniture
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Furniture from './src/models/Furniture.js'

dotenv.config()

const furniture = [
  // ── REPISAS ──────────────────────────────────────────────────
  {
    name: 'Repisa Nórdica',
    tagline: 'El toque elegante que faltaba.',
    description: 'Repisa de pared minimalista diseñada para integrarse perfectamente en cualquier espacio. Tu gato tiene su rincón favorito y tú mantienes la estética de tu hogar.',
    type: 'repisa',
    price: 28.99,
    style: 'natural',
    colors: ['natural', 'blanco'],
    dimensions: '60 × 20 × 5 cm',
    materials: ['MDF lacado', 'Alfombra antideslizante'],
    weight: '1.8 kg',
    mainImage: 'PLACEHOLDER_REPISA_NORDICA_MAIN',
    images: ['PLACEHOLDER_REPISA_NORDICA_1', 'PLACEHOLDER_REPISA_NORDICA_2'],
    details: [
      'Soporta hasta 15 kg',
      'Instalación con tacos y tornillos incluidos',
      'Superficie tapizada antideslizante',
      'Compatible con collares de 1 a 2.5 cm',
    ],
    available: true,
    order: 1,
  },
  {
    name: 'Repisa con Hamaca',
    tagline: 'Descanso en las alturas.',
    description: 'La combinación perfecta: repisa sólida con hamaca integrada. Tu gato duerme con vista panorámica mientras tú disfrutas de un hogar ordenado y con estilo.',
    type: 'repisa',
    price: 38.99,
    style: 'nogal',
    colors: ['nogal', 'negro'],
    dimensions: '70 × 25 × 5 cm + hamaca 50 × 30 cm',
    materials: ['MDF laminado', 'Lona premium', 'Herrajes de acero'],
    weight: '2.4 kg',
    mainImage: 'PLACEHOLDER_REPISA_HAMACA_MAIN',
    images: ['PLACEHOLDER_REPISA_HAMACA_1', 'PLACEHOLDER_REPISA_HAMACA_2'],
    details: [
      'Soporta hasta 12 kg',
      'Hamaca extraíble y lavable',
      'Acabado nogal de alta resistencia',
      'Herrajes de acero inoxidable incluidos',
    ],
    available: true,
    order: 2,
  },
  {
    name: 'Repisa Esquinera',
    tagline: 'Aprovecha cada rincón.',
    description: 'Diseñada para las esquinas de tu hogar. Convierte ese espacio vacío en el mirador favorito de tu gato, sin sacrificar una pulgada de tu decoración.',
    type: 'repisa',
    price: 32.99,
    style: 'blanco',
    colors: ['blanco', 'natural'],
    dimensions: '40 × 40 × 5 cm (triangular)',
    materials: ['MDF lacado blanco', 'Alfombra suave'],
    weight: '1.5 kg',
    mainImage: 'PLACEHOLDER_REPISA_ESQUINERA_MAIN',
    images: ['PLACEHOLDER_REPISA_ESQUINERA_1', 'PLACEHOLDER_REPISA_ESQUINERA_2'],
    details: [
      'Diseño triangular para esquinas',
      'Soporta hasta 10 kg',
      'Acabado lacado de alta durabilidad',
      'Instalación en 10 minutos',
    ],
    available: true,
    order: 3,
  },
  {
    name: 'Set Galería 3 Niveles',
    tagline: 'Su propia escalera al cielo.',
    description: 'Tres repisas escalonadas que crean un circuito de escalada para tu gato. Diseño asimétrico que parece arte en tu pared. Porque el reino de tu gato puede ser hermoso.',
    type: 'repisa',
    price: 74.99,
    style: 'negro',
    colors: ['negro', 'nogal'],
    dimensions: 'Set: 3 repisas de 50 × 18 cm c/u',
    materials: ['MDF lacado', 'Alfombra de sisal natural'],
    weight: '4.2 kg (set completo)',
    mainImage: 'PLACEHOLDER_GALERIA_MAIN',
    images: ['PLACEHOLDER_GALERIA_1', 'PLACEHOLDER_GALERIA_2', 'PLACEHOLDER_GALERIA_3'],
    details: [
      '3 repisas escalonadas incluidas',
      'Soporta hasta 15 kg por repisa',
      'Diseño de galería de arte',
      'Plantilla de instalación incluida',
    ],
    available: true,
    order: 4,
  },

  // ── RASCADORES ───────────────────────────────────────────────
  {
    name: 'Rascador Columna',
    tagline: 'Escultura funcional para tu sala.',
    description: 'Un rascador que parece una pieza de diseño. Columna de sisal natural sobre base sólida. Tu gato rasca donde debe, tú conservas tus muebles y tu hogar sigue luciendo impecable.',
    type: 'rascador',
    price: 42.99,
    style: 'natural',
    colors: ['natural', 'negro'],
    dimensions: 'Ø 15 cm × 65 cm de alto',
    materials: ['Base MDF', 'Cuerda de sisal 100% natural', 'Poste de madera'],
    weight: '3.1 kg',
    mainImage: 'PLACEHOLDER_RASCADOR_COLUMNA_MAIN',
    images: ['PLACEHOLDER_RASCADOR_COLUMNA_1', 'PLACEHOLDER_RASCADOR_COLUMNA_2'],
    details: [
      'Sisal 100% natural — resistente y seguro',
      'Base amplia anti-volcamiento',
      'Apto para gatos de cualquier tamaño',
      'No daña pisos — base con antideslizante',
    ],
    available: true,
    order: 5,
  },
  {
    name: 'Rascador con Repisa',
    tagline: 'Rasca abajo, descansa arriba.',
    description: 'La combinación que todo gato necesita: rascador en la base y repisa de descanso en la cima. Diseño vertical que ocupa mínimo espacio con máximo beneficio para tu felino.',
    type: 'rascador',
    price: 54.99,
    style: 'nogal',
    colors: ['nogal', 'blanco'],
    dimensions: 'Ø 15 cm × 90 cm de alto, repisa 30 × 25 cm',
    materials: ['MDF laminado nogal', 'Sisal natural', 'Alfombra suave en repisa'],
    weight: '4.5 kg',
    mainImage: 'PLACEHOLDER_RASCADOR_REPISA_MAIN',
    images: ['PLACEHOLDER_RASCADOR_REPISA_1', 'PLACEHOLDER_RASCADOR_REPISA_2'],
    details: [
      'Doble función: rascador + mirador',
      'Repisa superior tapizada',
      'Estable para gatos de hasta 8 kg',
      'Diseño vertical — mínimo espacio',
    ],
    available: true,
    order: 6,
  },
  {
    name: 'Rascador Plano de Pared',
    tagline: 'El que no se ve, pero se siente.',
    description: 'Rascador montado en pared a ras de suelo. Invisible en tu decoración, irresistible para tu gato. La solución discreta para quienes no quieren sacrificar el diseño de su hogar.',
    type: 'rascador',
    price: 36.99,
    style: 'natural',
    colors: ['natural'],
    dimensions: '60 × 30 × 4 cm',
    materials: ['Marco MDF', 'Sisal natural trenzado'],
    weight: '1.9 kg',
    mainImage: 'PLACEHOLDER_RASCADOR_PLANO_MAIN',
    images: ['PLACEHOLDER_RASCADOR_PLANO_1', 'PLACEHOLDER_RASCADOR_PLANO_2'],
    details: [
      'Montaje en pared — no ocupa suelo',
      'Sisal reemplazable cuando se desgaste',
      'Ideal para espacios pequeños',
      'Compatible con cualquier estilo de hogar',
    ],
    available: true,
    order: 7,
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB conectado')

    await Furniture.deleteMany({})
    console.log('🗑️  Muebles anteriores eliminados')

    const created = await Furniture.insertMany(furniture)
    console.log(`✅ ${created.length} muebles insertados:`)
    created.forEach(f =>
      console.log(`   ${f.type === 'repisa' ? '🪵' : '🐱'} ${f.name} (${f.type}) — $${f.price}`)
    )
  } catch (err) {
    console.error('❌ Error en seed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
  }
}

seed()
