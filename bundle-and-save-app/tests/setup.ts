import { beforeEach, afterEach } from 'vitest'
import { prisma } from '../app/lib/prisma.server'

// Mock environment variables
process.env.DATABASE_URL = 'file:./test.db'
process.env.SHOPIFY_API_KEY = 'test_api_key'
process.env.SHOPIFY_API_SECRET = 'test_api_secret'
process.env.APP_URL = 'http://localhost:3000'
process.env.SESSION_SECRET = 'test_session_secret'

// Clean up database before each test
beforeEach(async () => {
  // Delete all records in reverse order to avoid foreign key constraints
  await prisma.bundleMetric.deleteMany()
  await prisma.bundleItem.deleteMany()
  await prisma.bundle.deleteMany()
  await prisma.session.deleteMany()
  await prisma.shop.deleteMany()
})

// Clean up after all tests
afterEach(async () => {
  await prisma.$disconnect()
})
