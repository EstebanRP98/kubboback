import mongoose from 'mongoose'

// Acabados de piso — mismo patrón que WallFinish (VISION.md Parte 3, §29)
const floorFinishSchema = new mongoose.Schema({
  key:        { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  kind:       { type: String, enum: ['color', 'texture'], required: true },
  colorHex:   { type: String, default: '' },
  textureUrl: { type: String, default: '' },
  scope:      { type: String, enum: ['interior', 'exterior', 'both'], default: 'both' },
  available:  { type: Boolean, default: true },
  order:      { type: Number, default: 0 },
}, { timestamps: true })

floorFinishSchema.index({ available: 1, order: 1 })

export default mongoose.model('FloorFinish', floorFinishSchema)
