import { useEffect, useState } from 'react'
import { entities, shopify } from '../lib/api'
import { Product } from '../types'
import { RefreshCw, Package, Search } from 'lucide-react'
import { formatCurrency, formatNumber } from '../lib/utils'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery])

  const loadProducts = async () => {
    try {
      const response = await entities.query<Product>('Product')
      if (response.success && response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    if (!searchQuery) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filtered)
  }

  const handleSyncProducts = async () => {
    setSyncing(true)
    try {
      // Fetch products from Shopify
      const query = `
        query {
          products(first: 50) {
            edges {
              node {
                id
                title
                featuredImage {
                  url
                }
                variants(first: 1) {
                  edges {
                    node {
                      price
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          }
        }
      `

      const response = await shopify.graphql<any>(query)
      
      if (response.success && response.data?.products?.edges) {
        const shopifyProducts = response.data.products.edges.map((edge: any) => {
          const product = edge.node
          const variant = product.variants.edges[0]?.node
          
          return {
            name: product.title,
            price: parseFloat(variant?.price || '0'),
            image_url: product.featuredImage?.url || '',
            shopify_product_id: product.id,
            inventory: variant?.inventoryQuantity || 0,
          }
        })

        // Save products to database
        for (const product of shopifyProducts) {
          await entities.create<Product>('Product', product)
        }

        // Reload products
        await loadProducts()
        alert(`Successfully synced ${shopifyProducts.length} products`)
      }
    } catch (error) {
      console.error('Failed to sync products:', error)
      alert('Failed to sync products. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={handleSyncProducts}
          disabled={syncing}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Shopify'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search products..."
          />
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery ? 'No products found' : 'No products yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Sync your products from Shopify to get started'}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <button
                onClick={handleSyncProducts}
                disabled={syncing}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync from Shopify
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.image_url ? (
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.image_url}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatNumber(product.inventory)}
                    </div>
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
