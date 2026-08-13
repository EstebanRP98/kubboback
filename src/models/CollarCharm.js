import mongoose from 'mongoose'

const collarCharmSchema = new mongoose.Schema({
  key:        { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  category:   { type: String, default: '' },          // legacy — kept for migration
  categories: { type: [String], default: [] },         // NEW: multi-category
  imageUrl:   { type: String, default: '' },
  showFirst:  { type: Boolean, default: false },
  available:  { type: Boolean, default: true },
  order:      { type: Number, default: 0 },
}, { timestamps: true })

collarCharmSchema.index({ available: 1, order: 1 })

export default mongoose.model('CollarCharm', collarCharmSchema)
