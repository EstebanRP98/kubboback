import { gql } from 'apollo-server-express'

const adminTypeDefs = gql`
  type AuthPayload {
    token: String!
    username: String!
  }

  type ConfirmedOrder {
    id: ID!
    code: String!
    collarSnapshot: String
    totalPrice: Float!
    snapshotImageUrl: String!
    adminNotes: String!
    itemsDescription: String!
    confirmedAt: String!
  }

  input CollarColorInput {
    key: String!
    name: String!
    lightHex: String!
    darkHex: String!
    showFirst: Boolean
    available: Boolean
    order: Int
  }

  input CollarDesignInput {
    name: String!
    degTop: Float!
    degBottom: Float!
    available: Boolean
    order: Int
  }

  input CollarCharmInput {
    key: String!
    name: String!
    category: String        # optional legacy
    categories: [String!]   # new multi-category
    imageUrl: String
    showFirst: Boolean
    available: Boolean
    order: Int
  }

  input UpdateCollarPricingInput {
    basePrice: Float
    charmPrice: Float
    letterPrice: Float
    maxCharms: Int
    maxLetters: Int
    whatsappNumber: String
  }

  type CharmCategory {
    id: ID!
    name: String!
    order: Int!
    available: Boolean!
  }

  extend type Query {
    adminPendingOrders: [DraftOrder!]!
    adminConfirmedOrders: [ConfirmedOrder!]!
    adminCharmCategories: [CharmCategory!]!
    adminCollarCharms: [CollarCharm!]!
    adminCollarColors: [CollarColor!]!
  }

  extend type Mutation {
    adminLogin(username: String!, password: String!): AuthPayload!

    createCharmCategory(name: String!, order: Int): CharmCategory!
    renameCharmCategory(id: ID!, name: String!): CharmCategory!
    deleteCharmCategory(id: ID!): Boolean!

    confirmOrder(code: String!, adminNotes: String): ConfirmedOrder!
    deleteDraftOrder(code: String!): Boolean!

    createCollarColor(input: CollarColorInput!): CollarColor!
    updateCollarColor(id: ID!, input: CollarColorInput!): CollarColor!
    deleteCollarColor(id: ID!): Boolean!

    createCollarDesign(input: CollarDesignInput!): CollarDesign!
    updateCollarDesign(id: ID!, input: CollarDesignInput!): CollarDesign!
    deleteCollarDesign(id: ID!): Boolean!

    createCollarCharm(input: CollarCharmInput!): CollarCharm!
    updateCollarCharm(id: ID!, input: CollarCharmInput!): CollarCharm!
    deleteCollarCharm(id: ID!): Boolean!
    getCharmUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!

    setCollarCharmAvailable(id: ID!, available: Boolean!): CollarCharm!
    setCharmCategoryAvailable(id: ID!, available: Boolean!): CharmCategory!

    updateCollarPricing(input: UpdateCollarPricingInput!): CollarPricing!
  }
`

export default adminTypeDefs
