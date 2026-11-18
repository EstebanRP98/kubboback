import mongoose from 'mongoose'

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
}, { timestamps: true })

furnitureDesignSchema.index({ available: 1, order: 1 })

export default mongoose.model('FurnitureDesign', furnitureDesignSchema)
