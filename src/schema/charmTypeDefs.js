// src/schema/charmTypeDefs.js
import { gql } from 'apollo-server-express'

const charmTypeDefs = gql`
  type Charm {
    id: ID!
    name: String!
    tagline: String
    description: String
    price: Float!
    images: [String]
    mainImage: String
    category: String
    details: [String]
    emoji: String
    color: String
    available: Boolean
    order: Int
  }

  extend type Query {
    charms(category: String): [Charm]
    charm(id: ID!): Charm
  }
`

export default charmTypeDefs
