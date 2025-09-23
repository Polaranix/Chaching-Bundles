import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useActionData, useNavigation } from '@remix-run/react'
import {
  Page,
  Layout,
  Card,
  Button,
  ButtonGroup,
  Toast,
  Frame,
  Modal,
  TextContainer,
} from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { useState } from 'react'
import { getShopFromRequest } from '~/lib/shopify.server'
import { validateBundle } from '~/lib/validate'
import { prisma } from '~/lib/prisma.server'
import { logError, logInfo } from '~/lib/logger.server'
import { getBundleAnalytics } from '~/lib/analytics.server'
import { BundleForm } from '~/components/BundleForm'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { shop } = await getShopFromRequest(request)
  const bundleId = params.id!
  
  const bundle = await prisma.bundle.findFirst({
    where: {
      id: bundleId,
      shopId: shop.id,
    },
    include: {
      items: true,
    },
  })
  
  if (!bundle) {
    throw new Response('Bundle not found', { status: 404 })
  }
  
  const analytics = await getBundleAnalytics(shop.id, bundle.id)
  
  return json({ bundle, analytics })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { shop } = await getShopFromRequest(request)
  const bundleId = params.id!
  
  try {
    const formData = await request.formData()
    const intent = formData.get('intent') as string
    
    if (intent === 'delete') {
      await prisma.bundle.delete({
        where: {
          id: bundleId,
          shopId: shop.id,
        },
      })
      
      logInfo('Bundle deleted', {
        bundleId,
        shopId: shop.id,
      })
      
      return redirect('/app')
    }
    
    if (intent === 'update') {
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
      
      // Update bundle
      await prisma.bundle.update({
        where: {
          id: bundleId,
          shopId: shop.id,
        },
        data: {
          title: bundleData.title,
          type: bundleData.type,
          discountType: bundleData.discountType,
          discountValue: bundleData.discountValue,
          minQty: bundleData.minQty,
          status: bundleData.status,
          items: {
            deleteMany: {},
            create: bundleData.items.map((item: any) => ({
              productGid: item.productGid,
              variantGid: item.variantGid,
              quantity: item.quantity,
            })),
          },
        },
      })
      
      logInfo('Bundle updated', {
        bundleId,
        title: bundleData.title,
        shopId: shop.id,
      })
      
      return json({ success: true })
    }
    
    return json(
      { 
        errors: ['Invalid action'],
        success: false 
      },
      { status: 400 }
    )
  } catch (error) {
    logError('Failed to update bundle', error as Error)
    return json(
      { 
        errors: ['Failed to update bundle. Please try again.'],
        success: false 
      },
      { status: 500 }
    )
  }
}

export default function BundleDetail() {
  const { bundle, analytics } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  
  const isSubmitting = navigation.state === 'submitting'
  
  const formatDiscountValue = (type: string, value: number) => {
    return type === 'PERCENT' ? `${value}%` : `$${value.toFixed(2)}`
  }
  
  const toastMarkup = showToast ? (
    <Toast
      content={actionData?.success ? 'Bundle updated successfully' : 'Update failed'}
      error={!actionData?.success}
      onDismiss={() => setShowToast(false)}
    />
  ) : null

  const deleteModal = showDeleteModal ? (
    <Modal
      open={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Delete bundle"
      primaryAction={{
        content: 'Delete',
        destructive: true,
        onAction: () => {
          const form = document.createElement('form')
          form.method = 'POST'
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = 'intent'
          input.value = 'delete'
          form.appendChild(input)
          document.body.appendChild(form)
          form.submit()
        },
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: () => setShowDeleteModal(false),
        },
      ]}
    >
      <Modal.Section>
        <TextContainer>
          <p>
            Are you sure you want to delete "{bundle.title}"? This action cannot be undone.
          </p>
        </TextContainer>
      </Modal.Section>
    </Modal>
  ) : null

  return (
    <Frame>
      <Page
        backAction={{ content: 'Bundles', url: '/app' }}
        title={bundle.title}
        subtitle={`${bundle.type === 'FIXED' ? 'Fixed Bundle' : 'Mix & Match'} • ${formatDiscountValue(bundle.discountType, bundle.discountValue)} off`}
        secondaryActions={[
          {
            content: 'Delete',
            destructive: true,
            onAction: () => setShowDeleteModal(true),
          },
        ]}
      >
        <TitleBar title={bundle.title} />
        
        <Layout>
          <Layout.Section secondary>
            <Card title="Analytics" sectioned>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <strong>Impressions:</strong> {analytics.impressions.toLocaleString()}
                </div>
                <div>
                  <strong>Clicks:</strong> {analytics.clicks.toLocaleString()}
                </div>
                <div>
                  <strong>Orders:</strong> {analytics.orders.toLocaleString()}
                </div>
                <div>
                  <strong>Conversion Rate:</strong> {analytics.conversionRate}%
                </div>
              </div>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BundleForm
                bundle={bundle}
                isSubmitting={isSubmitting}
                errors={actionData?.errors}
                onError={() => setShowToast(true)}
                onSuccess={() => setShowToast(true)}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      
      {toastMarkup}
      {deleteModal}
    </Frame>
  )
}
