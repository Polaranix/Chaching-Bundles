import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { shopify, entities } from '../lib/api'
import { Check, Loader2, Package } from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartTrial = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create Shopify subscription
      const mutation = `
        mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $test: Boolean, $trialDays: Int, $lineItems: [AppSubscriptionLineItemInput!]!) {
          appSubscriptionCreate(
            name: $name
            returnUrl: $returnUrl
            test: $test
            trialDays: $trialDays
            lineItems: $lineItems
          ) {
            userErrors {
              field
              message
            }
            confirmationUrl
            appSubscription {
              id
              status
            }
          }
        }
      `

      const variables = {
        name: 'BundlesUp Pro Plan',
        returnUrl: `${window.location.origin}/app`,
        test: true, // Set to false in production
        trialDays: 14,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: 12.99, currencyCode: 'USD' },
                interval: 'EVERY_30_DAYS',
              },
            },
          },
        ],
      }

      const response = await shopify.graphql<any>(mutation, variables)

      if (response.success && response.data?.appSubscriptionCreate?.confirmationUrl) {
        // Redirect to Shopify billing confirmation
        window.top!.location.href = response.data.appSubscriptionCreate.confirmationUrl
      } else {
        // If subscription creation fails, still mark onboarding as complete
        // (for development/testing purposes)
        await completeOnboarding()
      }
    } catch (err) {
      console.error('Subscription error:', err)
      setError('Failed to start trial. Please try again.')
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    if (user) {
      await entities.update('User', user.id, {
        has_completed_onboarding: true,
      })
      updateUser({ has_completed_onboarding: true })
      navigate('/app', { replace: true })
    }
  }

  const features = [
    'Create unlimited product bundles',
    'Mix & Match bundles',
    'Upsell recommendations',
    'Frequently bought together',
    'Real-time analytics',
    'Customizable bundle displays',
    'Automatic inventory sync',
    'Mobile-optimized widgets',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left side - Welcome */}
            <div className="p-8 md:p-12 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
              <div className="flex items-center mb-6">
                <Package className="h-10 w-10" />
                <span className="ml-3 text-2xl font-bold">BundlesUp</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">
                Welcome to BundlesUp!
              </h1>
              <p className="text-primary-100 mb-8">
                Increase your average order value with smart product bundles and upsells.
              </p>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary-200 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-primary-50">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Pricing */}
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Start Your Free Trial
                </h2>
                <p className="text-gray-600">
                  No credit card required
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-900">
                    $12.99
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Free trial period</span>
                    <span className="font-semibold text-gray-900">14 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bundles</span>
                    <span className="font-semibold text-gray-900">Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Support</span>
                    <span className="font-semibold text-gray-900">Priority</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleStartTrial}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Setting up...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </button>

              <p className="mt-4 text-xs text-center text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
