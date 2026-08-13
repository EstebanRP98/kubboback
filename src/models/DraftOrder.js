import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  type:     { type: String, enum: ['charm', 'letter'], required: true },
  key:      String,
  name:     String,
  imageUrl: String,
  color:    String,   // custom bead color for letters (hex)
  order:    Number,
}, { _id: false })

const draftOrderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  collarColor: {
    key:      String,
    name:     String,
    lightHex: String,
    darkHex:  String,
  },
  collarDesign: {
    name:      String,
    degTop:    Number,
    degBottom: Number,
  },
  size:             { type: String, enum: ['S', 'M', 'L'], required: true },
  items:            [itemSchema],
  totalPrice:       { type: Number, required: true },
  snapshotImageUrl: { type: String, default: '' },
  status:           { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  clientIp:         String,
  expiresAt:        { type: Date, required: true },
  createdAt:        { type: Date, default: Date.now },
})

draftOrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
draftOrderSchema.index({ status: 1, expiresAt: 1 })

export default mongoose.model('DraftOrder', draftOrderSchema)
