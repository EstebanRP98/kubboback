import mongoose from 'mongoose'

const wallTypeSchema = new mongoose.Schema({
  key:             { type: String, required: true, unique: true }, // 'flat' | 'corner'
  name:            { type: String, required: true },
  illustrationUrl: { type: String, default: '' },
  defaultWidthCm:  { type: Number, required: true },
  defaultHeightCm: { type: Number, required: true },
  available:       { type: Boolean, default: true },
  order:           { type: Number, default: 0 },
}, { timestamps: true })

wallTypeSchema.index({ available: 1, order: 1 })

export default mongoose.model('WallType', wallTypeSchema)
