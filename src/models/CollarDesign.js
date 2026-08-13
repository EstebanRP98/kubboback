import mongoose from 'mongoose'

const collarDesignSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  degTop:    { type: Number, required: true },
  degBottom: { type: Number, required: true },
  available: { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
}, { timestamps: true })

collarDesignSchema.index({ available: 1, order: 1 })

export default mongoose.model('CollarDesign', collarDesignSchema)
