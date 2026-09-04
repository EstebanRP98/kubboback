import mongoose from 'mongoose'

const placedItemSchema = new mongoose.Schema({
  designKey: { type: String, required: true },
  name:      String,
  glbUrl:    String,
  xCm:       { type: Number, required: true },
  yCm:       { type: Number, required: true },
  price:     { type: Number, required: true },
}, { _id: false })

const draftMuebleOrderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  wallType: {
    key:  String,
    name: String,
  },
  wallFinish: {
    key:        String,
    name:       String,
    kind:       String,
    colorHex:   String,
    textureUrl: String,
  },
  widthCm:          { type: Number, required: true },
  heightCm:         { type: Number, required: true },
  items:            [placedItemSchema],
  totalPrice:       { type: Number, required: true },
  snapshotImageUrl: { type: String, default: '' },
  status:           { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  clientIp:         String,
  expiresAt:        { type: Date, required: true },
  createdAt:        { type: Date, default: Date.now },
})

draftMuebleOrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
draftMuebleOrderSchema.index({ status: 1, expiresAt: 1 })

export default mongoose.model('DraftMuebleOrder', draftMuebleOrderSchema)
