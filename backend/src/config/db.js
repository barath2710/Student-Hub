const mongoose = require('mongoose')

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not set. Skipping database connection.')
    return null
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅  MongoDB connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`)
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    throw error
  }
}

module.exports = connectDB
