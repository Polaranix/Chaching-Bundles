import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo shop
  const shop = await prisma.shop.upsert({
    where: { id: 'demo-shop.myshopify.com' },
    update: {},
    create: {
      id: 'demo-shop.myshopify.com',
      domain: 'demo-shop.myshopify.com',
      plan: 'FREE',
    },
  })

  console.log(`✅ Created shop: ${shop.domain}`)

  // Create demo bundles
  const fixedBundle = await prisma.bundle.create({
    data: {
      shopId: shop.id,
      title: 'Summer Essentials Bundle',
      type: 'FIXED',
      discountType: 'PERCENT',
      discountValue: 20,
      status: 'ACTIVE',
      items: {
        create: [
          {
            productGid: 'gid://shopify/Product/1',
            variantGid: 'gid://shopify/ProductVariant/1',
            quantity: 1,
          },
          {
            productGid: 'gid://shopify/Product/2',
            variantGid: 'gid://shopify/ProductVariant/2',
            quantity: 1,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  console.log(`✅ Created fixed bundle: ${fixedBundle.title}`)

  const mixMatchBundle = await prisma.bundle.create({
    data: {
      shopId: shop.id,
      title: 'Pick Any 3 Accessories',
      type: 'MIX_MATCH',
      discountType: 'AMOUNT',
      discountValue: 15.00,
      minQty: 3,
      status: 'ACTIVE',
      items: {
        create: [
          {
            productGid: 'gid://shopify/Product/3',
            variantGid: 'gid://shopify/ProductVariant/3',
            quantity: 1,
          },
          {
            productGid: 'gid://shopify/Product/4',
            variantGid: 'gid://shopify/ProductVariant/4',
            quantity: 1,
          },
          {
            productGid: 'gid://shopify/Product/5',
            variantGid: 'gid://shopify/ProductVariant/5',
            quantity: 1,
          },
          {
            productGid: 'gid://shopify/Product/6',
            variantGid: 'gid://shopify/ProductVariant/6',
            quantity: 1,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  console.log(`✅ Created mix & match bundle: ${mixMatchBundle.title}`)

  // Create some demo analytics
  await prisma.bundleMetric.createMany({
    data: [
      {
        shopId: shop.id,
        bundleId: fixedBundle.id,
        eventType: 'impression',
        count: 150,
      },
      {
        shopId: shop.id,
        bundleId: fixedBundle.id,
        eventType: 'click',
        count: 45,
      },
      {
        shopId: shop.id,
        bundleId: fixedBundle.id,
        eventType: 'order',
        count: 12,
      },
      {
        shopId: shop.id,
        bundleId: mixMatchBundle.id,
        eventType: 'impression',
        count: 89,
      },
      {
        shopId: shop.id,
        bundleId: mixMatchBundle.id,
        eventType: 'click',
        count: 23,
      },
      {
        shopId: shop.id,
        bundleId: mixMatchBundle.id,
        eventType: 'order',
        count: 7,
      },
    ],
  })

  console.log('✅ Created demo analytics')

  console.log('🎉 Seeding completed!')
  console.log('\nDemo data created:')
  console.log(`- Shop: ${shop.domain}`)
  console.log(`- Fixed Bundle: "${fixedBundle.title}" (20% off, 2 items)`)
  console.log(`- Mix & Match Bundle: "${mixMatchBundle.title}" ($15 off, pick 3 of 4 items)`)
  console.log('- Sample analytics for both bundles')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
