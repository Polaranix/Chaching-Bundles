import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const SHOPIFY_API_KEY = import.meta.env.VITE_SHOPIFY_API_KEY
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

export default function ShopifyLoader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const shop = params.get('shop')
    const hmac = params.get('hmac')

    // Loop prevention (max 2 attempts)
    if (attempts >= 2) {
      setError('Authentication loop detected. Please reinstall the app.')
      return
    }

    // Check if we have auth token
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (token) {
      // Save token from OAuth callback
      localStorage.setItem('auth_token', token)
      if (shop) {
        localStorage.setItem('shop', shop)
      }

      // Fetch user data
      fetchUserData(token)
        .then(user => {
          localStorage.setItem('user', JSON.stringify(user))

          if (!user.has_completed_onboarding) {
            navigate('/onboarding')
          } else {
            navigate('/dashboard')
          }
        })
        .catch(err => {
          console.error('Failed to fetch user:', err)
          setError('Authentication failed. Please try again.')
        })

      return
    }

    if (storedToken && storedUser) {
      // Already authenticated, check where to redirect
      const user = JSON.parse(storedUser)

      if (!user.has_completed_onboarding) {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }

      return
    }

    // Not authenticated, check if we have shop parameter
    if (shop || hmac) {
      // Redirect to OAuth
      setAttempts(prev => prev + 1)
      const redirectUrl = `${APP_URL}/functions/shopifyAuth?shop=${shop || params.get('shop')}`

      // Break out of iframe
      if (window.top !== window.self) {
        window.top!.location.href = redirectUrl
      } else {
        window.location.href = redirectUrl
      }

      return
    }

    // No auth and no shop parameter
    setError('Missing shop parameter. Please install the app from the Shopify App Store.')

  }, [location, navigate, attempts])

  async function fetchUserData(token: string) {
    const response = await fetch('https://api.base44.com/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }

    return await response.json()
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Error</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-primary px-4 py-2"
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
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading BundlesUp...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we set up your account</p>
      </div>
    </div>
  )
}
