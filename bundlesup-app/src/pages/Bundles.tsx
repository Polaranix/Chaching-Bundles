import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Copy, Play, Pause } from 'lucide-react'
import { formatCurrency, formatNumber, getBundleStatusColor } from '../lib/utils'
import type { Bundle } from '../types'

export default function Bundles() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'paused'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchBundles()
  }, [])

  async function fetchBundles() {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(
        `https://api.base44.com/v1/apps/${import.meta.env.VITE_BASE44_APP_ID}/entities/Bundle`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setBundles(data.data || [])
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch bundles:', error)
      setIsLoading(false)
    }
  }

  async function deleteBundle(id: string) {
    if (!confirm('Are you sure you want to delete this bundle?')) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `https://api.base44.com/v1/apps/${import.meta.env.VITE_BASE44_APP_ID}/entities/Bundle/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setBundles(bundles.filter(b => b.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete bundle:', error)
    }
  }

  async function toggleStatus(bundle: Bundle) {
    const newStatus = bundle.status === 'active' ? 'paused' : 'active'

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `https://api.base44.com/v1/apps/${import.meta.env.VITE_BASE44_APP_ID}/entities/Bundle/${bundle.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.ok) {
        setBundles(bundles.map(b => b.id === bundle.id ? { ...b, status: newStatus } : b))
      }
    } catch (error) {
      console.error('Failed to update bundle status:', error)
    }
  }

  const filteredBundles = bundles
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bundles</h1>
          <p className="text-gray-600 mt-1">Create and manage your product bundles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary px-6 py-3 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Bundle
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2">
            {['all', 'active', 'draft', 'paused'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bundles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full md:w-80"
            />
          </div>
        </div>
      </div>

      {/* Bundles Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading bundles...</p>
        </div>
      ) : filteredBundles.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No bundles found</h3>
          <p className="mt-2 text-sm text-gray-600">
            {filter !== 'all' || searchTerm ? 'Try adjusting your filters' : 'Get started by creating a new bundle'}
          </p>
          {filter === 'all' && !searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 btn btn-primary px-6 py-2"
            >
              Create Bundle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBundles.map((bundle) => (
            <div key={bundle.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{bundle.name}</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBundleStatusColor(bundle.status)}`}>
                    {bundle.status}
                  </span>
                </div>
              </div>

              {bundle.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bundle.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{bundle.bundle_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium text-gray-900">{bundle.products?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sales:</span>
                  <span className="font-medium text-gray-900">{formatNumber(bundle.total_sales || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(bundle.total_revenue || 0)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(bundle)}
                  className="flex-1 btn btn-outline py-2 text-sm"
                >
                  {bundle.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Activate
                    </>
                  )}
                </button>
                <button className="btn btn-outline p-2">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteBundle(bundle.id!)}
                  className="btn btn-outline p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Bundle Modal (simplified) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Bundle</h2>
            <p className="text-gray-600 mb-6">
              Bundle creation form would go here. This is a simplified version for demonstration.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline px-6 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Full bundle creation form to be implemented')
                  setShowCreateModal(false)
                }}
                className="btn btn-primary px-6 py-2"
              >
                Create Bundle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
