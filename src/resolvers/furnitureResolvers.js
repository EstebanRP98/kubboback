// src/resolvers/furnitureResolvers.js
import Furniture from '../models/Furniture.js'

const furnitureResolvers = {
  Query: {
    furnitures: async (_, { type, style, minPrice, maxPrice }) => {
      const filter = { available: true }
      if (type) filter.type = type
      if (style) filter.style = style
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {}
        if (minPrice !== undefined) filter.price.$gte = minPrice
        if (maxPrice !== undefined) filter.price.$lte = maxPrice
      }
      return await Furniture.find(filter).sort({ order: 1, createdAt: 1 })
    },

    furniture: async (_, { id }) => {
      try {
        const item = await Furniture.findById(id)
        if (!item) throw new Error('Mueble no encontrado')
        return item
      } catch {
        throw new Error('ID inválido o error del servidor')
      }
    },
  },
}

export default furnitureResolvers
