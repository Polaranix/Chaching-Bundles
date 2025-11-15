import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartTrial = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const shop = localStorage.getItem('shop')
      const token = localStorage.getItem('auth_token')

      if (!shop || !token) {
        throw new Error('Missing authentication credentials')
      }

      // Call Shopify API to create subscription
      const response = await fetch('/functions/shopifyApiProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          type: 'graphql',
          query: `
            mutation {
              appSubscriptionCreate(
                name: "BundlesUp Pro"
                returnUrl: "${window.location.origin}/onboarding?approved=1"
                test: true
                lineItems: [{
                  plan: {
                    appRecurringPricingDetails: {
                      price: { amount: 2.99, currencyCode: USD }
                      interval: EVERY_30_DAYS
                    }
                  }
                }]
                trialDays: 14
              ) {
                appSubscription {
                  id
                }
                confirmationUrl
                userErrors {
                  field
                  message
                }
              }
            }
          `,
        }),
      })

      const data = await response.json()

      if (data.data?.appSubscriptionCreate?.userErrors?.length > 0) {
        throw new Error(data.data.appSubscriptionCreate.userErrors[0].message)
      }

      if (data.data?.appSubscriptionCreate?.confirmationUrl) {
        // Redirect to Shopify billing confirmation page
        window.top!.location.href = data.data.appSubscriptionCreate.confirmationUrl
      } else {
        throw new Error('Failed to create subscription')
      }

    } catch (err: any) {
      console.error('Subscription error:', err)
      setError(err.message || 'Failed to start trial. Please try again.')
      setIsLoading(false)
    }
  }

  // Check if user just approved billing
  const params = new URLSearchParams(window.location.search)
  if (params.get('approved') === '1') {
    // Update user onboarding status
    const token = localStorage.getItem('auth_token')
    if (token) {
      fetch('https://api.base44.com/v1/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          has_completed_onboarding: true,
        }),
      }).then(() => {
        // Update local storage
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.has_completed_onboarding = true
        localStorage.setItem('user', JSON.stringify(user))

        // Redirect to dashboard
        navigate('/dashboard')
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-12 text-white text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to BundlesUp!</h1>
          <p className="text-emerald-100 text-lg">
            Increase your average order value with smart product bundles
          </p>
        </div>

        <div className="p-8">
          <div className="space-y-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Unlimited Bundles</h3>
                <p className="text-gray-600">
                  Build fixed bundles, mix & match offers, upsells, and frequently bought together bundles
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Flexible Discounts</h3>
                <p className="text-gray-600">
                  Offer percentage discounts, fixed amount off, or set custom bundle prices
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Real-time Analytics</h3>
                <p className="text-gray-600">
                  Track bundle performance, revenue, and conversion rates with detailed analytics
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">$2.99/month</h4>
                <p className="text-gray-600">14-day free trial included</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Cancel anytime</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleStartTrial}
            disabled={isLoading}
            className="w-full btn btn-primary py-4 text-lg font-semibold flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Start Free Trial'
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            By starting your trial, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
