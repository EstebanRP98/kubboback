import mongoose from 'mongoose'

const placedItemSchema = new mongoose.Schema({
  designKey: { type: String, required: true },
  name:      String,
  glbUrl:    String,
  xCm:       { type: Number, default: 0 },   // mueble de pared: centro desde el borde izquierdo de su pared
  yCm:       { type: Number, default: 0 },   // mueble de pared: centro desde el piso
  price:     { type: Number, required: true },
  mount:       { type: String, default: 'wall' },  // 'wall' | 'floor'
  wallIndex:   { type: Number, default: 0 },
  floorXCm:    Number,                              // mueble de piso: centro en planta
  floorZCm:    Number,
  rotationDeg: { type: Number, default: 0 },
  // medidas del mueble al momento del pedido (para describir su ubicación en el admin)
  widthCm:     Number,
  heightCm:    Number,
  depthCm:     Number,
}, { _id: false })

const finishSnapshotSchema = new mongoose.Schema({
  key: String, name: String, kind: String, colorHex: String, textureUrl: String,
}, { _id: false })

// Espacio completo (VISION.md Parte 3, §29). Ausente en los pedidos viejos de una sola pared.
const spaceSchema = new mongoose.Schema({
  ambient:     { key: String, name: String, outdoor: Boolean },
  layout:      { key: String, name: String, shape: String }, // modelo de espacio elegido (WallType)
  heightCm:    Number,
  lengthsCm:   [Number],
  walls:       [new mongoose.Schema({ index: Number, label: String, lengthCm: Number, finish: finishSnapshotSchema }, { _id: false })],
  floorFinish: finishSnapshotSchema,
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
  space:            { type: spaceSchema, default: undefined },
  wallSnapshots:    { type: [new mongoose.Schema({ wallIndex: Number, url: String }, { _id: false })], default: [] },
  status:           { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  clientIp:         String,
  expiresAt:        { type: Date, required: true },
  createdAt:        { type: Date, default: Date.now },
})

draftMuebleOrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
draftMuebleOrderSchema.index({ status: 1, expiresAt: 1 })

export default mongoose.model('DraftMuebleOrder', draftMuebleOrderSchema)
