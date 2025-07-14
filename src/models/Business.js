// src/models/Business.js
import mongoose from 'mongoose'

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  services: [String],
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  contactNumber: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    website: String,
  },
  images: [String], // URLs hosted in Firebase
}, { timestamps: true })

export default mongoose.model('Business', businessSchema)
