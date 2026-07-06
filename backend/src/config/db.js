const mongoose = require('mongoose')

let cachedDbPromise = null

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not set. Skipping database connection.')
    return null
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!cachedDbPromise) {
    cachedDbPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    }).then((conn) => {
      console.log(`✅  MongoDB connected: ${conn.connection.host}`)
      return conn
    }).catch((error) => {
      cachedDbPromise = null // Clear cache on error so subsequent requests can retry
      console.error(`❌  MongoDB connection error: ${error.message}`)
      throw error
    })
  }

  return cachedDbPromise
}

module.exports = connectDB
