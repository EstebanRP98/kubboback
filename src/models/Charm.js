// src/models/Charm.js
import mongoose from 'mongoose'

const charmSchema = new mongoose.Schema({
  name: { type: String, required: true },          // "Hueso", "Miel", "Arco Iris"
  tagline: { type: String },                        // Copy corto: "El clásico que nunca falla"
  description: { type: String },                    // Descripción completa del producto
  price: { type: Number, required: true },          // Precio en USD (Ecuador)
  images: [{ type: String }],                       // Array de URLs (Firebase Storage)
  mainImage: { type: String },                      // URL de la imagen principal del producto
  category: {
    type: String,
    enum: ['dog', 'cat', 'both'],
    default: 'both',
  },
  details: [{ type: String }],                      // ["Compatible con collares de 1-2cm", "Peso: 5g"]
  emoji: { type: String },                          // 🦴 Fallback visual cuando no hay imagen
  color: { type: String },                          // Color de acento hex: "#ffbe17" para UI
  available: { type: Boolean, default: true },
  order: { type: Number, default: 0 },             // Orden de aparición en catálogo
}, { timestamps: true })

// Índices para queries frecuentes
charmSchema.index({ available: 1, order: 1 })
charmSchema.index({ category: 1 })

export default mongoose.model('Charm', charmSchema)
