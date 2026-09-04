import mongoose from 'mongoose'

const furnitureDesignSchema = new mongoose.Schema({
  key:          { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  glbUrl:       { type: String, default: '' },  // vacío = usa placeholder 3D primitivo
  thumbnailUrl: { type: String, default: '' },  // preview .jpg para la tarjeta del catálogo
  widthCm:      { type: Number, required: true },
  heightCm:     { type: Number, required: true },
  depthCm:      { type: Number, required: true },
  price:        { type: Number, required: true },
  available:    { type: Boolean, default: true },
  order:        { type: Number, default: 0 },
}, { timestamps: true })

furnitureDesignSchema.index({ available: 1, order: 1 })

export default mongoose.model('FurnitureDesign', furnitureDesignSchema)
