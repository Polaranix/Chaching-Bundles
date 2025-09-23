import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react'
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  CalloutCard,
  List,
  Badge,
  Toast,
  Frame,
} from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { useState } from 'react'
import { getShopFromRequest } from '~/lib/shopify.server'
import { getSubscriptionStatus, createSubscription, BILLING_CONFIG } from '~/lib/billing.server'
import { logError, logInfo } from '~/lib/logger.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, session } = await getShopFromRequest(request)
  const subscriptionStatus = await getSubscriptionStatus(session)
  
  return json({
    shop,
    subscriptionStatus,
    billingConfig: BILLING_CONFIG,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await getShopFromRequest(request)
  
  try {
    const formData = await request.formData()
    const intent = formData.get('intent') as string
    
    if (intent === 'subscribe') {
      const result = await createSubscription(session)
      
      if (result.success && result.subscriptionUrl) {
        return redirect(result.subscriptionUrl)
      } else {
        return json(
          { 
            error: result.error || 'Failed to create subscription',
            success: false 
          },
          { status: 400 }
        )
      }
    }
    
    return json(
      { 
        error: 'Invalid action',
        success: false 
      },
      { status: 400 }
    )
  } catch (error) {
    logError('Failed to handle billing action', error as Error)
    return json(
      { 
        error: 'Failed to process billing request. Please try again.',
        success: false 
      },
      { status: 500 }
    )
  }
}

export default function Billing() {
  const { subscriptionStatus, billingConfig } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [showToast, setShowToast] = useState(false)
  
  const isSubmitting = navigation.state === 'submitting'
  
  const toastMarkup = showToast && actionData?.error ? (
    <Toast
      content={actionData.error}
      error
      onDismiss={() => setShowToast(false)}
    />
  ) : null

  const currentPlanCard = (
    <Card title="Current Plan" sectioned>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text variant="headingMd" as="h3">
            {subscriptionStatus.hasActiveSubscription ? 'Pro Plan' : 'Free Plan'}
          </Text>
          <Text variant="bodyMd" as="p" color="subdued">
            {subscriptionStatus.hasActiveSubscription 
              ? 'Unlimited bundles and advanced features'
              : `${subscriptionStatus.activeBundles}/${subscriptionStatus.maxBundles} active bundles`
            }
          </Text>
        </div>
        <Badge tone={subscriptionStatus.hasActiveSubscription ? 'success' : 'info'}>
          {subscriptionStatus.hasActiveSubscription ? 'Active' : 'Free'}
        </Badge>
      </div>
    </Card>
  )

  const freeFeatures = [
    '1 active bundle',
    'Basic analytics',
    'Standard support',
  ]

  const proFeatures = [
    'Unlimited bundles',
    'Advanced analytics',
    'Priority support',
    'Custom discount rules',
    'A/B testing (coming soon)',
  ]

  const upgradeCard = !subscriptionStatus.hasActiveSubscription ? (
    <CalloutCard
      title="Upgrade to Pro"
      illustration="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
      primaryAction={{
        content: `Start ${billingConfig.trialDays}-day free trial`,
        url: '#',
        onAction: () => {
          const form = document.createElement('form')
          form.method = 'POST'
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = 'intent'
          input.value = 'subscribe'
          form.appendChild(input)
          document.body.appendChild(form)
          form.submit()
        },
        loading: isSubmitting,
      }}
    >
      <p>
        Unlock unlimited bundles and advanced features for just ${billingConfig.price}/month. 
        Start with a {billingConfig.trialDays}-day free trial.
      </p>
    </CalloutCard>
  ) : null

  return (
    <Frame>
      <Page
        backAction={{ content: 'Dashboard', url: '/app' }}
        title="Billing"
        subtitle="Manage your subscription and billing preferences"
      >
        <TitleBar title="Billing" />
        
        <Layout>
          <Layout.Section>
            {currentPlanCard}
          </Layout.Section>
          
          {upgradeCard && (
            <Layout.Section>
              {upgradeCard}
            </Layout.Section>
          )}
          
          <Layout.Section secondary>
            <Card title="Free Plan" sectioned>
              <List>
                {freeFeatures.map((feature, index) => (
                  <List.Item key={index}>{feature}</List.Item>
                ))}
              </List>
            </Card>
          </Layout.Section>
          
          <Layout.Section secondary>
            <Card title="Pro Plan" sectioned>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h3">
                  ${billingConfig.price}/month
                </Text>
                <Text variant="bodyMd" as="p" color="subdued">
                  {billingConfig.trialDays}-day free trial
                </Text>
              </div>
              <List>
                {proFeatures.map((feature, index) => (
                  <List.Item key={index}>{feature}</List.Item>
                ))}
              </List>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      
      {toastMarkup}
    </Frame>
  )
}
