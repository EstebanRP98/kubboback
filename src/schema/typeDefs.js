// src/schema/typeDefs.js
import { gql } from 'apollo-server-express'

const typeDefs = gql`
  type Location {
    lat: Float
    lng: Float
    address: String
  }

  type SocialMedia {
    facebook: String
    instagram: String
    website: String
  }

  type Business {
    id: ID!
    name: String!
    description: String
    services: [String]
    location: Location
    contactNumber: String
    socialMedia: SocialMedia
    images: [String]
  }

  type BusinessList {
    items: [Business]
    total: Int
  }

  input FilterInput {
    type: String
    city: String
  }

  type Query {
    businesses(type: String, city: String, limit: Int, offset: Int): BusinessList
    business(id: ID!): Business
  }
`

export default typeDefs
