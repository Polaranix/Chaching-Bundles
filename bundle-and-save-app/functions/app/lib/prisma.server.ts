import { PrismaClient } from '@prisma/client'

declare global {
  var __db__: PrismaClient
}

let prisma: PrismaClient

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient()
  }
  prisma = global.__db__
}

export { prisma }

// Helper function to handle database connection
export async function connectDb() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

// Helper function to disconnect from database
export async function disconnectDb() {
  await prisma.$disconnect()
}
