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
app.use(cors()) // Asegúrate de que CORS esté configurado correctamente para tu frontend

const server = new ApolloServer({
  typeDefs,
  resolvers: businessResolvers,
})

await server.start()
server.applyMiddleware({ app, path: '/graphql' }) // Añadimos 'path' explícitamente, aunque es el default

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 4000; // Define un puerto por defecto si no está en .env
    const HOST = '0.0.0.0'; // Escucha en todas las interfaces de red

    app.listen(PORT, HOST, () => { // Aquí la modificación clave: añadir HOST
      console.log(`🚀 Server ready at http://${HOST}:${PORT}${server.graphqlPath}`);
      console.log(`Accesible desde la red local en http://TU_IP_DE_MAC:${PORT}${server.graphqlPath}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err))