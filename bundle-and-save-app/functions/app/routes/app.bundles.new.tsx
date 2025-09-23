import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react'
import {
  Page,
  Layout,
  Card,
  Button,
  Toast,
  Frame,
} from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { useState } from 'react'
import { getShopFromRequest } from '~/lib/shopify.server'
import { canCreateBundle } from '~/lib/billing.server'
import { validateBundle } from '~/lib/validate'
import { prisma } from '~/lib/prisma.server'
import { logError, logInfo } from '~/lib/logger.server'
import { BundleForm } from '~/components/BundleForm'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, session } = await getShopFromRequest(request)
  const canCreate = await canCreateBundle(shop.id)
  
  if (!canCreate) {
    return redirect('/app?upgrade=true')
  }
  
  return json({ shop })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await getShopFromRequest(request)
  
  try {
    const formData = await request.formData()
    const bundleData = JSON.parse(formData.get('bundle') as string)
    
    // Validate bundle data
    const validation = validateBundle(bundleData)
    if (!validation.success) {
      return json(
        { 
          errors: validation.errors,
          success: false 
        },
        { status: 400 }
      )
    }
    
    // Check if shop can create more bundles
    const canCreate = await canCreateBundle(shop.id)
    if (!canCreate) {
      return json(
        { 
          errors: ['Free plan limit reached. Upgrade to Pro for unlimited bundles.'],
          success: false 
        },
        { status: 403 }
      )
    }
    
    // Create bundle with items
    const bundle = await prisma.bundle.create({
      data: {
        shopId: shop.id,
        title: bundleData.title,
        type: bundleData.type,
        discountType: bundleData.discountType,
        discountValue: bundleData.discountValue,
        minQty: bundleData.minQty,
        status: bundleData.status || 'DRAFT',
        items: {
          create: bundleData.items.map((item: any) => ({
            productGid: item.productGid,
            variantGid: item.variantGid,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    })
    
    logInfo('Bundle created', {
      bundleId: bundle.id,
      title: bundle.title,
      shopId: shop.id,
    })
    
    return redirect(`/app/bundles/${bundle.id}`)
  } catch (error) {
    logError('Failed to create bundle', error as Error)
    return json(
      { 
        errors: ['Failed to create bundle. Please try again.'],
        success: false 
      },
      { status: 500 }
    )
  }
}

export default function NewBundle() {
  const { shop } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [showToast, setShowToast] = useState(false)
  
  const isSubmitting = navigation.state === 'submitting'
  
  const toastMarkup = showToast ? (
    <Toast
      content="Bundle creation failed"
      error
      onDismiss={() => setShowToast(false)}
    />
  ) : null

  return (
    <Frame>
      <Page
        backAction={{ content: 'Bundles', url: '/app' }}
        title="Create bundle"
        subtitle="Set up a new product bundle with automatic discounts"
      >
        <TitleBar title="Create bundle" />
        
        <Layout>
          <Layout.Section>
            <Card>
              <BundleForm
                isSubmitting={isSubmitting}
                errors={actionData?.errors}
                onError={() => setShowToast(true)}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      {toastMarkup}
    </Frame>
  )
}
