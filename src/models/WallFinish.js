import mongoose from 'mongoose'

const wallFinishSchema = new mongoose.Schema({
  key:        { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  kind:       { type: String, enum: ['color', 'texture'], required: true },
  colorHex:   { type: String, default: '' },
  textureUrl: { type: String, default: '' },
  available:  { type: Boolean, default: true },
  order:      { type: Number, default: 0 },
}, { timestamps: true })

wallFinishSchema.index({ available: 1, order: 1 })

export default mongoose.model('WallFinish', wallFinishSchema)
