import mongoose from 'mongoose'

const wallTypeSchema = new mongoose.Schema({
  key:             { type: String, required: true, unique: true },
  name:            { type: String, required: true },
  // "Modelo de espacio" (VISION.md Parte 3): forma de la planta. Los registros viejos sin shape
  // se tratan como 'flat' (o 'corner' si su key es 'corner') — ver resolveShape() en lib/muebleGeometry.js
  shape:           { type: String, enum: ['flat', 'corner', 'u', 'room', 'l'] },
  defaultLengthsCm: { type: [Number], default: undefined }, // medidas independientes de la forma (§26)
  ambients:        { type: [String], default: undefined },  // keys de Ambient; vacío = todos
  illustrationUrl: { type: String, default: '' },
  defaultWidthCm:  { type: Number, required: true },
  defaultHeightCm: { type: Number, required: true },
  available:       { type: Boolean, default: true },
  order:           { type: Number, default: 0 },
}, { timestamps: true })

wallTypeSchema.index({ available: 1, order: 1 })

export default mongoose.model('WallType', wallTypeSchema)
