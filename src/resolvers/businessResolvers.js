// src/resolvers/businessResolvers.js
import Business from '../models/Business.js'

const businessResolvers = {
  Query: {
    // Cambia el resolver "businesses" así:
businesses: async (_, { type, city, limit = 10, offset = 0 }) => {
  const filter = {}
  if (type) filter.services = type
  if (city) filter['location.address'] = new RegExp(city, 'i')

  const [items, total] = await Promise.all([
    Business.find(filter).skip(offset).limit(limit),
    Business.countDocuments(filter),
  ])

  return { items, total }
}

  }
}

export default businessResolvers
