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

  type ConfirmedMuebleOrder {
    id: ID!
    code: String!
    muebleSnapshot: String
    totalPrice: Float!
    snapshotImageUrl: String!
    adminNotes: String!
    itemsDescription: String!
    confirmedAt: String!
  }

  input WallTypeInput {
    key: String!
    name: String!
    illustrationUrl: String
    defaultWidthCm: Float!
    defaultHeightCm: Float!
    available: Boolean
    order: Int
  }

  input WallFinishInput {
    key: String!
    name: String!
    kind: String!
    colorHex: String
    textureUrl: String
    available: Boolean
    order: Int
  }

  input FurnitureDesignInput {
    key: String!
    name: String!
    glbUrl: String
    thumbnailUrl: String
    widthCm: Float!
    heightCm: Float!
    depthCm: Float!
    price: Float!
    available: Boolean
    order: Int
  }

  extend type Query {
    adminPendingOrders: [DraftOrder!]!
    adminConfirmedOrders: [ConfirmedOrder!]!
    adminCharmCategories: [CharmCategory!]!
    adminCollarCharms: [CollarCharm!]!
    adminCollarColors: [CollarColor!]!

    adminPendingMuebleOrders: [DraftMuebleOrder!]!
    adminConfirmedMuebleOrders: [ConfirmedMuebleOrder!]!
    adminWallTypes: [WallType!]!
    adminWallFinishes: [WallFinish!]!
    adminFurnitureDesigns: [FurnitureDesign!]!
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

    confirmMuebleOrder(code: String!, adminNotes: String): ConfirmedMuebleOrder!
    deleteDraftMuebleOrder(code: String!): Boolean!

    createWallType(input: WallTypeInput!): WallType!
    updateWallType(id: ID!, input: WallTypeInput!): WallType!
    deleteWallType(id: ID!): Boolean!

    createWallFinish(input: WallFinishInput!): WallFinish!
    updateWallFinish(id: ID!, input: WallFinishInput!): WallFinish!
    deleteWallFinish(id: ID!): Boolean!
    getWallFinishTextureUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!

    createFurnitureDesign(input: FurnitureDesignInput!): FurnitureDesign!
    updateFurnitureDesign(id: ID!, input: FurnitureDesignInput!): FurnitureDesign!
    deleteFurnitureDesign(id: ID!): Boolean!
    getFurnitureGlbUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!
    getFurnitureThumbnailUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!
  }
`

export default adminTypeDefs
