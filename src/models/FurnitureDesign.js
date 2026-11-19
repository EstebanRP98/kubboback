import mongoose from 'mongoose'

// Partes del .glb que el cliente puede pintar (VISION.md Parte 4). `key` = nombre del material
// en el .glb (p. ej. "madera", "fieltro"); la primera opción es la de fábrica.
const colorOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex:  { type: String, required: true },
}, { _id: false })

const colorPartSchema = new mongoose.Schema({
  key:     { type: String, required: true },
  label:   { type: String, required: true },
  options: { type: [colorOptionSchema], default: [] },
}, { _id: false })

const furnitureDesignSchema = new mongoose.Schema({
  key:          { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  glbUrl:       { type: String, default: '' },  // vacío = usa placeholder 3D primitivo
  thumbnailUrl: { type: String, default: '' },  // preview .jpg para la tarjeta del catálogo
  widthCm:      { type: Number, required: true },
  heightCm:     { type: Number, required: true },
  depthCm:      { type: Number, required: true },
  price:        { type: Number, required: true },
  mount:        { type: String, enum: ['wall', 'floor'], default: 'wall' },            // de pared o de piso
  scope:        { type: String, enum: ['interior', 'exterior', 'both'], default: 'interior' }, // patio = exterior
  available:    { type: Boolean, default: true },
  order:        { type: Number, default: 0 },
  colorParts:   { type: [colorPartSchema], default: [] },
}, { timestamps: true })

furnitureDesignSchema.index({ available: 1, order: 1 })

export default mongoose.model('FurnitureDesign', furnitureDesignSchema)
