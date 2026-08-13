// src/index.js
import 'dotenv/config'   // debe ser el primer import para que process.env esté listo antes de que s3.js se evalúe
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'
import cors from 'cors'

import typeDefs from './schema/typeDefs.js'
import charmTypeDefs from './schema/charmTypeDefs.js'
import furnitureTypeDefs from './schema/furnitureTypeDefs.js'
import collarTypeDefs from './schema/collarTypeDefs.js'
import adminTypeDefs from './schema/adminTypeDefs.js'

import businessResolvers from './resolvers/businessResolvers.js'
import charmResolvers from './resolvers/charmResolvers.js'
import furnitureResolvers from './resolvers/furnitureResolvers.js'
import collarResolvers from './resolvers/collarResolvers.js'
import adminResolvers from './resolvers/adminResolvers.js'

import { getAdminFromToken } from './middleware/auth.js'

const app = express()
app.use(cors())
app.use(express.json()) // necesario para leer req en context

const resolvers = {
  Query: {
    ...businessResolvers.Query,
    ...charmResolvers.Query,
    ...furnitureResolvers.Query,
    ...collarResolvers.Query,
    ...adminResolvers.Query,
  },
  Mutation: {
    ...collarResolvers.Mutation,
    ...adminResolvers.Mutation,
  },
}

const server = new ApolloServer({
  typeDefs: [typeDefs, charmTypeDefs, furnitureTypeDefs, collarTypeDefs, adminTypeDefs],
  resolvers,
  context: ({ req }) => ({
    req,
    admin: getAdminFromToken(req),
  }),
})

await server.start()
server.applyMiddleware({ app, path: '/graphql' })

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 4000
    const HOST = '0.0.0.0'
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server ready at http://${HOST}:${PORT}${server.graphqlPath}`)
    })
  })
  .catch(err => console.error('❌ MongoDB connection error:', err))
