import mongoose from 'mongoose'

// Ambiente del espacio (sala, habitación, patio…) — VISION.md Parte 3, §29
const ambientSchema = new mongoose.Schema({
  key:                   { type: String, required: true, unique: true },
  name:                  { type: String, required: true },
  outdoor:               { type: Boolean, default: false },  // patio: cielo abierto, solo acabados/muebles de exterior
  defaultHeightCm:       { type: Number, default: 240 },
  defaultWallFinishKey:  { type: String, default: '' },
  defaultFloorFinishKey: { type: String, default: '' },
  illustrationUrl:       { type: String, default: '' },
  available:             { type: Boolean, default: true },
  order:                 { type: Number, default: 0 },
}, { timestamps: true })

ambientSchema.index({ available: 1, order: 1 })

export default mongoose.model('Ambient', ambientSchema)
