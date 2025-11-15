import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { entities } from '../lib/api'
import { Bundle, Product, BundleProduct } from '../types'

interface CreateBundleModalProps {
  onClose: () => void
  onCreated: (bundle: Bundle) => void
}

export default function CreateBundleModal({ onClose, onCreated }: CreateBundleModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bundle_type: 'fixed' as Bundle['bundle_type'],
    status: 'draft' as Bundle['status'],
    pricing_strategy: 'percentage_discount' as Bundle['pricing_strategy'],
    discount_value: 10,
    fixed_price: 0,
    min_items: 2,
    max_items: 5,
    display_template: 'grid' as Bundle['display_template'],
  })
  const [selectedProducts, setSelectedProducts] = useState<BundleProduct[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await entities.query<Product>('Product')
      if (response.success && response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const handleAddProduct = (product: Product) => {
    if (selectedProducts.find(p => p.product_id === product.id)) {
      return
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        original_price: product.price,
        quantity: 1,
        is_required: true,
      },
    ])
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId))
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(
      selectedProducts.map(p =>
        p.product_id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    )
  }

  const handleSubmit = async () => {
    if (!formData.name || selectedProducts.length === 0) {
      alert('Please fill in all required fields and add at least one product')
      return
    }

    setLoading(true)
    try {
      const bundleData = {
        ...formData,
        products: selectedProducts,
        total_sales: 0,
        total_revenue: 0,
        conversion_rate: 0,
        display_settings: {
          show_savings: true,
          show_individual_prices: true,
          layout: 'grid' as const,
        },
      }

      const response = await entities.create<Bundle>('Bundle', bundleData)
      if (response.success && response.data) {
        onCreated(response.data)
      }
    } catch (error) {
      console.error('Failed to create bundle:', error)
      alert('Failed to create bundle. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Bundle - Step {step} of 2
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bundle Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="e.g., Summer Bundle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe your bundle..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bundle Type
                    </label>
                    <select
                      value={formData.bundle_type}
                      onChange={(e) => setFormData({ ...formData, bundle_type: e.target.value as Bundle['bundle_type'] })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="fixed">Fixed Bundle</option>
                      <option value="mix_match">Mix & Match</option>
                      <option value="upsell">Upsell</option>
                      <option value="frequently_together">Frequently Bought Together</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Bundle['status'] })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pricing Strategy
                    </label>
                    <select
                      value={formData.pricing_strategy}
                      onChange={(e) => setFormData({ ...formData, pricing_strategy: e.target.value as Bundle['pricing_strategy'] })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="percentage_discount">Percentage Discount</option>
                      <option value="amount_discount">Amount Discount</option>
                      <option value="fixed_price">Fixed Price</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.pricing_strategy === 'percentage_discount' ? 'Discount %' : 
                       formData.pricing_strategy === 'amount_discount' ? 'Discount Amount' : 
                       'Fixed Price'}
                    </label>
                    <input
                      type="number"
                      value={formData.pricing_strategy === 'fixed_price' ? formData.fixed_price : formData.discount_value}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (formData.pricing_strategy === 'fixed_price') {
                          setFormData({ ...formData, fixed_price: value })
                        } else {
                          setFormData({ ...formData, discount_value: value })
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      min="0"
                      step={formData.pricing_strategy === 'percentage_discount' ? '1' : '0.01'}
                    />
                  </div>
                </div>

                {formData.bundle_type === 'mix_match' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Min Items
                      </label>
                      <input
                        type="number"
                        value={formData.min_items}
                        onChange={(e) => setFormData({ ...formData, min_items: parseInt(e.target.value) || 2 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Max Items
                      </label>
                      <input
                        type="number"
                        value={formData.max_items}
                        onChange={(e) => setFormData({ ...formData, max_items: parseInt(e.target.value) || 5 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Selected Products ({selectedProducts.length})
                  </h4>
                  {selectedProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">No products selected yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.product_id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                              {product.product_image && (
                                <img
                                  src={product.product_image}
                                  alt={product.product_name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.product_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ${product.original_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => handleUpdateQuantity(product.product_id, parseInt(e.target.value) || 1)}
                              className="w-16 border border-gray-300 rounded-md py-1 px-2 text-sm"
                              min="1"
                            />
                            <button
                              onClick={() => handleRemoveProduct(product.product_id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Available Products
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {products
                      .filter(p => !selectedProducts.find(sp => sp.product_id === p.id))
                      .map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddProduct(product)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={step === 1 ? onClose : () => setStep(1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={step === 1 ? () => setStep(2) : handleSubmit}
              disabled={loading || (step === 1 && !formData.name)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : step === 1 ? 'Next' : 'Create Bundle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
