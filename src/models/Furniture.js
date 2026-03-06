// src/models/Furniture.js
import mongoose from 'mongoose'

const furnitureSchema = new mongoose.Schema({
  name: { type: String, required: true },       // "Repisa Nórdica", "Rascador Columna"
  tagline: { type: String },                    // "El toque elegante que faltaba"
  description: { type: String },               // Descripción completa
  type: {
    type: String,
    enum: ['repisa', 'rascador'],
    required: true,
  },
  price: { type: Number, required: true },      // USD
  images: [{ type: String }],                   // URLs Firebase Storage
  mainImage: { type: String },                  // Imagen principal
  style: { type: String },                      // 'natural', 'blanco', 'negro', 'nogal'
  colors: [{ type: String }],                   // Variantes disponibles: ['natural', 'negro']
  dimensions: { type: String },                 // "60 × 20 × 5 cm"
  materials: [{ type: String }],               // ["MDF", "Cuerda de sisal"]
  weight: { type: String },                     // "2.5 kg"
  details: [{ type: String }],                 // Beneficios/características bullet points
  available: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

furnitureSchema.index({ available: 1, order: 1 })
furnitureSchema.index({ type: 1 })
furnitureSchema.index({ style: 1 })
furnitureSchema.index({ price: 1 })

export default mongoose.model('Furniture', furnitureSchema)
