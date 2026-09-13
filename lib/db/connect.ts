import dns from 'node:dns'
import mongoose from 'mongoose'

let isConnected = false

const dnsServers = process.env.DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean)
if (dnsServers?.length) {
  dns.setServers(dnsServers)
}

export async function connectDB() {
  if (isConnected) {
    console.log('Using existing MongoDB connection')
    return mongoose.connection
  }

  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
    })

    isConnected = true
    console.log('MongoDB connected successfully')
    return conn
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    throw error
  }
}
