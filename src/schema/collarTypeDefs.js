import { gql } from 'apollo-server-express'

const collarTypeDefs = gql`
  type CollarColor {
    id: ID!
    key: String!
    name: String!
    lightHex: String!
    darkHex: String!
    showFirst: Boolean!
    available: Boolean!
    order: Int!
  }

  type CollarDesign {
    id: ID!
    name: String!
    degTop: Float!
    degBottom: Float!
    available: Boolean!
    order: Int!
  }

  type CollarCharm {
    id: ID!
    key: String!
    name: String!
    category: String!       # legacy, kept for compat
    categories: [String!]!  # new multi-category
    imageUrl: String!
    showFirst: Boolean!
    available: Boolean!
    order: Int!
  }

  type CollarPricing {
    id: ID!
    basePrice: Float!
    charmPrice: Float!
    letterPrice: Float!
    maxCharms: Int!
    maxLetters: Int!
    whatsappNumber: String!
  }

  type DraftOrderItem {
    type: String!
    key: String
    name: String
    imageUrl: String
    color: String
    order: Int
  }

  type DraftOrderCollarColor {
    key: String
    name: String
    lightHex: String
    darkHex: String
  }

  type DraftOrderCollarDesign {
    name: String
    degTop: Float
    degBottom: Float
  }

  type DraftOrder {
    id: ID!
    code: String!
    collarColor: DraftOrderCollarColor
    collarDesign: DraftOrderCollarDesign
    size: String!
    items: [DraftOrderItem!]!
    totalPrice: Float!
    snapshotImageUrl: String!
    status: String!
    expiresAt: String!
    createdAt: String!
  }

  input DraftOrderColorInput {
    key: String!
    name: String!
    lightHex: String!
    darkHex: String!
  }

  input DraftOrderDesignInput {
    name: String!
    degTop: Float!
    degBottom: Float!
  }

  input DraftOrderItemInput {
    type: String!
    key: String
    name: String
    imageUrl: String
    color: String
    order: Int
  }

  input CreateDraftOrderInput {
    collarColor: DraftOrderColorInput!
    collarDesign: DraftOrderDesignInput!
    size: String!
    items: [DraftOrderItemInput!]!
    totalPrice: Float!
    snapshotImageUrl: String
    _trap: String
  }

  type UploadUrlPayload {
    uploadUrl: String!
    publicUrl: String!
    key: String!
  }

  extend type Query {
    collarColors: [CollarColor!]!
    collarDesigns: [CollarDesign!]!
    collarCharms(category: String): [CollarCharm!]!
    collarCharmCategories: [CharmCategory!]!
    collarPricing: CollarPricing!
    draftOrder(code: String!): DraftOrder
  }

  extend type Mutation {
    createDraftOrder(input: CreateDraftOrderInput!): DraftOrder!
    getUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!
  }
`

export default collarTypeDefs
