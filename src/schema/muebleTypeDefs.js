import { gql } from 'apollo-server-express'

const muebleTypeDefs = gql`
  type WallType {
    id: ID!
    key: String!
    name: String!
    illustrationUrl: String!
    defaultWidthCm: Float!
    defaultHeightCm: Float!
    available: Boolean!
    order: Int!
  }

  type WallFinish {
    id: ID!
    key: String!
    name: String!
    kind: String!
    colorHex: String!
    textureUrl: String!
    available: Boolean!
    order: Int!
  }

  type FurnitureDesign {
    id: ID!
    key: String!
    name: String!
    glbUrl: String!
    thumbnailUrl: String!
    widthCm: Float!
    heightCm: Float!
    depthCm: Float!
    price: Float!
    available: Boolean!
    order: Int!
  }

  type DraftMuebleOrderItem {
    designKey: String!
    name: String
    glbUrl: String
    xCm: Float!
    yCm: Float!
    price: Float!
  }

  type DraftMuebleOrderWallType {
    key: String
    name: String
  }

  type DraftMuebleOrderWallFinish {
    key: String
    name: String
    kind: String
    colorHex: String
    textureUrl: String
  }

  type DraftMuebleOrder {
    id: ID!
    code: String!
    wallType: DraftMuebleOrderWallType
    wallFinish: DraftMuebleOrderWallFinish
    widthCm: Float!
    heightCm: Float!
    items: [DraftMuebleOrderItem!]!
    totalPrice: Float!
    snapshotImageUrl: String!
    status: String!
    expiresAt: String!
    createdAt: String!
  }

  input DraftMuebleWallTypeInput {
    key: String!
    name: String!
  }

  input DraftMuebleWallFinishInput {
    key: String!
    name: String!
    kind: String!
    colorHex: String
    textureUrl: String
  }

  input DraftMuebleItemInput {
    designKey: String!
    xCm: Float!
    yCm: Float!
    price: Float!
  }

  input CreateDraftMuebleOrderInput {
    wallType: DraftMuebleWallTypeInput!
    wallFinish: DraftMuebleWallFinishInput!
    widthCm: Float!
    heightCm: Float!
    items: [DraftMuebleItemInput!]!
    totalPrice: Float!
    snapshotImageUrl: String
    _trap: String
  }

  extend type Query {
    wallTypes: [WallType!]!
    wallFinishes: [WallFinish!]!
    furnitureDesigns: [FurnitureDesign!]!
    draftMuebleOrder(code: String!): DraftMuebleOrder
  }

  extend type Mutation {
    createDraftMuebleOrder(input: CreateDraftMuebleOrderInput!): DraftMuebleOrder!
    getMuebleUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!
  }
`

export default muebleTypeDefs
