import mongoose from 'mongoose'

const muebleOrderSchema = new mongoose.Schema({
  code:             { type: String, required: true, unique: true },
  muebleSnapshot:   { type: mongoose.Schema.Types.Mixed },
  totalPrice:       { type: Number, required: true },
  snapshotImageUrl: { type: String, default: '' },
  wallSnapshots:    { type: [new mongoose.Schema({ wallIndex: Number, url: String }, { _id: false })], default: [] },
  adminNotes:       { type: String, default: '' },
  itemsDescription: { type: String, default: '' },
  confirmedAt:      { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('MuebleOrder', muebleOrderSchema)
