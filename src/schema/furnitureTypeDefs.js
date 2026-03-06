// src/schema/furnitureTypeDefs.js
import { gql } from 'apollo-server-express'

const furnitureTypeDefs = gql`
  type Furniture {
    id: ID!
    name: String!
    tagline: String
    description: String
    type: String!
    price: Float!
    images: [String]
    mainImage: String
    style: String
    colors: [String]
    dimensions: String
    materials: [String]
    weight: String
    details: [String]
    available: Boolean
    order: Int
  }

  extend type Query {
    furnitures(type: String, style: String, minPrice: Float, maxPrice: Float): [Furniture]
    furniture(id: ID!): Furniture
  }
`

export default furnitureTypeDefs
