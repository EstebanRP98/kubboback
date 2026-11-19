import { gql } from 'apollo-server-express'

const muebleTypeDefs = gql`
  type Ambient {
    id: ID!
    key: String!
    name: String!
    outdoor: Boolean!
    defaultHeightCm: Float!
    defaultWallFinishKey: String!
    defaultFloorFinishKey: String!
    illustrationUrl: String!
    available: Boolean!
    order: Int!
  }

  # "Modelo de espacio" (antes solo "tipo de pared"). shape: flat | corner | u | room | l
  type WallType {
    id: ID!
    key: String!
    name: String!
    shape: String!
    defaultLengthsCm: [Float!]!
    ambients: [String!]!
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
    scope: String!
    available: Boolean!
    order: Int!
  }

  type FloorFinish {
    id: ID!
    key: String!
    name: String!
    kind: String!
    colorHex: String!
    textureUrl: String!
    scope: String!
    available: Boolean!
    order: Int!
  }

  type FurnitureColorOption {
    name: String!
    hex: String!
  }

  # Parte del .glb que el cliente puede pintar; key = nombre del material en el .glb
  type FurnitureColorPart {
    key: String!
    label: String!
    options: [FurnitureColorOption!]!
  }

  type MuebleItemColor {
    part: String!
    label: String!
    name: String!
    hex: String!
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
    mount: String!
    scope: String!
    available: Boolean!
    order: Int!
    colorParts: [FurnitureColorPart!]!
  }

  type DraftMuebleOrderItem {
    designKey: String!
    name: String
    glbUrl: String
    xCm: Float!
    yCm: Float!
    price: Float!
    mount: String!
    wallIndex: Int!
    floorXCm: Float
    floorZCm: Float
    rotationDeg: Float!
    widthCm: Float
    heightCm: Float
    depthCm: Float
    colors: [MuebleItemColor!]!
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

  type MuebleSpaceAmbient {
    key: String
    name: String
    outdoor: Boolean
  }

  type MuebleSpaceLayout {
    key: String
    name: String
    shape: String
  }

  type MuebleSpaceWall {
    index: Int!
    label: String!
    lengthCm: Float!
    finish: DraftMuebleOrderWallFinish
  }

  type MuebleSpace {
    ambient: MuebleSpaceAmbient
    layout: MuebleSpaceLayout
    heightCm: Float!
    lengthsCm: [Float!]!
    walls: [MuebleSpaceWall!]!
    floorFinish: DraftMuebleOrderWallFinish
  }

  type MuebleWallSnapshot {
    wallIndex: Int!
    url: String!
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
    space: MuebleSpace
    wallSnapshots: [MuebleWallSnapshot!]!
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
    xCm: Float
    yCm: Float
    price: Float!
    wallIndex: Int
    floorXCm: Float
    floorZCm: Float
    rotationDeg: Float
    colors: [MuebleItemColorInput!]
  }

  # El cliente solo manda la parte y el nombre del color; el servidor resuelve el hex del catálogo
  input MuebleItemColorInput {
    part: String!
    name: String!
  }

  # Espacio completo (VISION.md Parte 3). El servidor resuelve nombres, colores y medidas de
  # cada pared desde el catálogo: el cliente solo manda keys y medidas.
  input DraftMuebleSpaceInput {
    ambientKey: String!
    layoutKey: String!
    lengthsCm: [Float!]!
    heightCm: Float!
    wallFinishKeys: [String!]!
    floorFinishKey: String!
  }

  input MuebleWallSnapshotInput {
    wallIndex: Int!
    url: String!
  }

  input CreateDraftMuebleOrderInput {
    # Campos del flujo viejo de una pared (opcionales si viene space)
    wallType: DraftMuebleWallTypeInput
    wallFinish: DraftMuebleWallFinishInput
    widthCm: Float
    heightCm: Float
    space: DraftMuebleSpaceInput
    items: [DraftMuebleItemInput!]!
    totalPrice: Float!
    snapshotImageUrl: String
    wallSnapshots: [MuebleWallSnapshotInput!]
    _trap: String
  }

  extend type Query {
    ambients: [Ambient!]!
    wallTypes: [WallType!]!
    wallFinishes: [WallFinish!]!
    floorFinishes: [FloorFinish!]!
    furnitureDesigns: [FurnitureDesign!]!
    draftMuebleOrder(code: String!): DraftMuebleOrder
  }

  extend type Mutation {
    createDraftMuebleOrder(input: CreateDraftMuebleOrderInput!): DraftMuebleOrder!
    getMuebleUploadUrl(filename: String!, contentType: String!): UploadUrlPayload!
  }
`

export default muebleTypeDefs
