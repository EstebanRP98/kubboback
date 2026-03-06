// src/resolvers/charmResolvers.js
import Charm from '../models/Charm.js'

const charmResolvers = {
  Query: {
    charms: async (_, { category }) => {
      const filter = { available: true }
      if (category) filter.category = { $in: [category, 'both'] }

      return await Charm.find(filter).sort({ order: 1, createdAt: 1 })
    },

    charm: async (_, { id }) => {
      try {
        const charm = await Charm.findById(id)
        if (!charm) throw new Error('Charm no encontrado')
        return charm
      } catch {
        throw new Error('ID inválido o error del servidor')
      }
    },
  },
}

export default charmResolvers
