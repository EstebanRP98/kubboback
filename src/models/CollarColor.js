import mongoose from 'mongoose'

const collarColorSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  lightHex:  { type: String, required: true },
  darkHex:   { type: String, required: true },
  showFirst: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
}, { timestamps: true })

collarColorSchema.index({ available: 1, order: 1 })

export default mongoose.model('CollarColor', collarColorSchema)
