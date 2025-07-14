// src/index.js
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import typeDefs from './schema/typeDefs.js'
import businessResolvers from './resolvers/businessResolvers.js'

dotenv.config()

const app = express()
app.use(cors())

const server = new ApolloServer({
  typeDefs,
  resolvers: businessResolvers,
})

await server.start()
server.applyMiddleware({ app })

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
    )
  })
  .catch(err => console.error('❌ MongoDB connection error:', err))
