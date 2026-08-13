import mongoose from 'mongoose'

const collarPricingSchema = new mongoose.Schema({
  basePrice:      { type: Number, required: true, default: 4.00 },
  charmPrice:     { type: Number, required: true, default: 1.00 },
  letterPrice:    { type: Number, required: true, default: 0.50 },
  maxCharms:      { type: Number, required: true, default: 6 },
  maxLetters:     { type: Number, required: true, default: 10 },
  whatsappNumber: { type: String, required: true, default: '+593992958177' },
}, { timestamps: true })

export default mongoose.model('CollarPricing', collarPricingSchema)
