import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const SHOPIFY_API_KEY = import.meta.env.VITE_SHOPIFY_API_KEY
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin
const MAX_REDIRECT_ATTEMPTS = 2

export default function ShopifyLoader() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading, login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      // Get redirect attempt count from sessionStorage
      const attempts = parseInt(sessionStorage.getItem('redirect_attempts') || '0')

      // Check if we have a token from OAuth callback
      const token = searchParams.get('token')
      if (token) {
        sessionStorage.removeItem('redirect_attempts')
        await login(token)
        return
      }

      // Check if we have shop parameter (initial install)
      const shop = searchParams.get('shop')
      if (shop && !user && attempts < MAX_REDIRECT_ATTEMPTS) {
        sessionStorage.setItem('redirect_attempts', String(attempts + 1))
        initiateOAuth(shop)
        return
      }

      // If we have a user, check onboarding status
      if (user && !loading) {
        if (!user.has_completed_onboarding) {
          navigate('/onboarding', { replace: true })
        } else {
          navigate('/app', { replace: true })
        }
        return
      }

      // If no user and no shop parameter, show error
      if (!loading && !user && !shop) {
        if (attempts >= MAX_REDIRECT_ATTEMPTS) {
          setError('Authentication failed. Please try reinstalling the app.')
        } else {
          setError('Missing shop parameter. Please install the app from the Shopify App Store.')
        }
      }
    }

    handleAuth()
  }, [user, loading, searchParams, navigate, login])

  const initiateOAuth = (shop: string) => {
    const scopes = 'read_products,write_products,read_product_listings,read_discounts,write_discounts'
    const redirectUri = `${APP_URL}/functions/shopifyAuth?callback=1`
    const nonce = Math.random().toString(36).substring(7)
    
    const authUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${SHOPIFY_API_KEY}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${nonce}`

    // Break out of iframe if embedded
    if (window.top && window.top !== window.self) {
      window.top.location.href = authUrl
    } else {
      window.location.href = authUrl
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Error</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  sessionStorage.removeItem('redirect_attempts')
                  window.location.reload()
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading BundlesUp...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we set up your account</p>
      </div>
    </div>
  )
}
