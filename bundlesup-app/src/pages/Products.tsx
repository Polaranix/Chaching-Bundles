import { useEffect, useState } from 'react'
import { RefreshCw, Search, Package } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import type { ShopifyProduct } from '../types'

export default function Products() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(
        `https://api.base44.com/v1/apps/${import.meta.env.VITE_BASE44_APP_ID}/entities/Product`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setIsLoading(false)
    }
  }

  async function syncProducts() {
    setIsSyncing(true)

    try {
      const shop = localStorage.getItem('shop')
      const response = await fetch('/functions/shopifyApiProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          type: 'rest',
          endpoint: 'products.json',
          method: 'GET',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Process and save products to database
        alert(`Synced ${data.products?.length || 0} products from Shopify`)
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to sync products:', error)
      alert('Failed to sync products. Please try again.')
    }

    setIsSyncing(false)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage products synced from your Shopify store</p>
        </div>
        <button
          onClick={syncProducts}
          disabled={isSyncing}
          className="btn btn-primary px-6 py-3 flex items-center"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Products'}
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {products.length === 0 ? 'Sync products from your Shopify store to get started' : 'Try adjusting your search'}
          </p>
          {products.length === 0 && (
            <button onClick={syncProducts} className="btn btn-primary px-6 py-2">
              Sync Products
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shopify ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.inventory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.shopify_product_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
