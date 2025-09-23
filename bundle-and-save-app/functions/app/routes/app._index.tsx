import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Badge,
  Text,
  Button,
  Banner,
  ButtonGroup,
} from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { authenticate } from '~/shopify.server'
import { getShopFromRequest } from '~/lib/shopify.server'
import { getSubscriptionStatus } from '~/lib/billing.server'
import { getShopAnalytics } from '~/lib/analytics.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, session } = await getShopFromRequest(request)
  const subscriptionStatus = await getSubscriptionStatus(session)
  const analytics = await getShopAnalytics(shop.id)
  
  return json({
    shop,
    bundles: shop.bundles,
    subscriptionStatus,
    analytics,
  })
}

export default function App() {
  const { bundles, subscriptionStatus, analytics } = useLoaderData<typeof loader>()

  const canCreateBundle = subscriptionStatus.plan === 'PRO' || 
                         subscriptionStatus.activeBundles < (subscriptionStatus.maxBundles || 0)

  const showUpgradeBanner = !subscriptionStatus.hasActiveSubscription && 
                           subscriptionStatus.activeBundles >= (subscriptionStatus.maxBundles || 0)

  const resourceName = {
    singular: 'bundle',
    plural: 'bundles',
  }

  const formatDiscountValue = (type: string, value: number) => {
    return type === 'PERCENT' ? `${value}%` : `$${value.toFixed(2)}`
  }

  const rowMarkup = bundles.map((bundle: any, index: number) => (
    <IndexTable.Row id={bundle.id} key={bundle.id} position={index}>
      <IndexTable.Cell>
        <Link to={`/app/bundles/${bundle.id}`}>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {bundle.title}
          </Text>
        </Link>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={bundle.type === 'FIXED' ? 'info' : 'attention'}>
          {bundle.type === 'FIXED' ? 'Fixed Bundle' : 'Mix & Match'}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {formatDiscountValue(bundle.discountType, bundle.discountValue)}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={bundle.status === 'ACTIVE' ? 'success' : 'subdued'}>
          {bundle.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {bundle.items.length} item{bundle.items.length !== 1 ? 's' : ''}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {new Date(bundle.updatedAt).toLocaleDateString()}
      </IndexTable.Cell>
    </IndexTable.Row>
  ))

  const emptyStateMarkup = (
    <EmptyState
      heading="Create your first bundle"
      action={{
        content: 'Create bundle',
        url: '/app/bundles/new',
        disabled: !canCreateBundle,
      }}
      secondaryAction={
        showUpgradeBanner
          ? {
              content: 'Upgrade to Pro',
              url: '/app/billing',
            }
          : undefined
      }
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Start increasing your average order value by creating product bundles with automatic discounts.</p>
      {showUpgradeBanner && (
        <p>You've reached the free plan limit. Upgrade to Pro for unlimited bundles.</p>
      )}
    </EmptyState>
  )

  const bundleTableMarkup = (
    <IndexTable
      resourceName={resourceName}
      itemCount={bundles.length}
      headings={[
        { title: 'Title' },
        { title: 'Type' },
        { title: 'Discount' },
        { title: 'Status' },
        { title: 'Items' },
        { title: 'Updated' },
      ]}
      selectable={false}
    >
      {rowMarkup}
    </IndexTable>
  )

  return (
    <Page>
      <TitleBar title="Bundle & Save" />
      
      <Layout>
        {showUpgradeBanner && (
          <Layout.Section>
            <Banner
              title="Free plan limit reached"
              status="warning"
              action={{
                content: 'Upgrade to Pro',
                url: '/app/billing',
              }}
            >
              <p>You have {subscriptionStatus.activeBundles} active bundle(s). Upgrade to Pro for unlimited bundles and advanced features.</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <Card>
              <div style={{ padding: '1rem' }}>
                <Text variant="headingMd" as="h3">Total Impressions</Text>
                <Text variant="headingLg" as="p">{analytics.totalImpressions.toLocaleString()}</Text>
              </div>
            </Card>
            <Card>
              <div style={{ padding: '1rem' }}>
                <Text variant="headingMd" as="h3">Total Orders</Text>
                <Text variant="headingLg" as="p">{analytics.totalOrders.toLocaleString()}</Text>
              </div>
            </Card>
            <Card>
              <div style={{ padding: '1rem' }}>
                <Text variant="headingMd" as="h3">Conversion Rate</Text>
                <Text variant="headingLg" as="p">{analytics.averageConversionRate}%</Text>
              </div>
            </Card>
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem 0' }}>
              <Text variant="headingMd" as="h2">
                Bundles ({bundles.length})
              </Text>
              <ButtonGroup>
                <Button url="/app/billing" variant="secondary">
                  {subscriptionStatus.hasActiveSubscription ? 'Manage billing' : 'Upgrade to Pro'}
                </Button>
                <Button 
                  variant="primary" 
                  url="/app/bundles/new"
                  disabled={!canCreateBundle}
                >
                  Create bundle
                </Button>
              </ButtonGroup>
            </div>
            
            {bundles.length === 0 ? emptyStateMarkup : bundleTableMarkup}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
