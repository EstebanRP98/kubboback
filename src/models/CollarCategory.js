import mongoose from 'mongoose'

const collarCategorySchema = new mongoose.Schema({
  name:      { type: String, required: true, unique: true, trim: true },
  order:     { type: Number, default: 0 },
  available: { type: Boolean, default: true },   // NEW
}, { timestamps: true })

export default mongoose.model('CollarCategory', collarCategorySchema)
