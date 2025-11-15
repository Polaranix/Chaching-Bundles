import { useState } from 'react'
import { Bundle } from '../types'
import { entities } from '../lib/api'
import { MoreVertical, Edit, Copy, Pause, Play, Trash2 } from 'lucide-react'
import { formatCurrency, formatNumber, getStatusColor, getBundleTypeLabel } from '../lib/utils'
import EditBundleModal from './EditBundleModal'

interface BundleCardProps {
  bundle: Bundle
  onUpdate: (bundle: Bundle) => void
  onDelete: (bundleId: string) => void
}

export default function BundleCard({ bundle, onUpdate, onDelete }: BundleCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const newStatus = bundle.status === 'active' ? 'paused' : 'active'
      const response = await entities.update<Bundle>('Bundle', bundle.id, {
        status: newStatus,
      })
      if (response.success && response.data) {
        onUpdate(response.data)
      }
    } catch (error) {
      console.error('Failed to toggle status:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const handleDuplicate = async () => {
    setLoading(true)
    try {
      const duplicateData = {
        ...bundle,
        name: `${bundle.name} (Copy)`,
        status: 'draft',
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      }
      const response = await entities.create<Bundle>('Bundle', duplicateData)
      if (response.success && response.data) {
        onUpdate(response.data)
      }
    } catch (error) {
      console.error('Failed to duplicate bundle:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bundle?')) {
      return
    }

    setLoading(true)
    try {
      const response = await entities.delete('Bundle', bundle.id)
      if (response.success) {
        onDelete(bundle.id)
      }
    } catch (error) {
      console.error('Failed to delete bundle:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {bundle.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {bundle.description}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowEditModal(true)
                          setShowMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 mr-3" />
                        Edit
                      </button>
                      <button
                        onClick={handleDuplicate}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Copy className="h-4 w-4 mr-3" />
                        Duplicate
                      </button>
                      <button
                        onClick={handleToggleStatus}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {bundle.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-3" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-3" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bundle.status)}`}>
              {bundle.status}
            </span>
            <span className="text-xs text-gray-500">
              {getBundleTypeLabel(bundle.bundle_type)}
            </span>
          </div>
        </div>

        {/* Products Preview */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {bundle.products.slice(0, 3).map((product, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden"
              >
                {product.product_image ? (
                  <img
                    src={product.product_image}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No img</span>
                )}
              </div>
            ))}
            {bundle.products.length > 3 && (
              <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{bundle.products.length - 3}
                </span>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {bundle.products.length} product{bundle.products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Sales</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(bundle.total_sales || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(bundle.total_revenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditBundleModal
          bundle={bundle}
          onClose={() => setShowEditModal(false)}
          onUpdated={onUpdate}
        />
      )}
    </>
  )
}
