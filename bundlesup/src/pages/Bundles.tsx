import { useEffect, useState } from 'react'
import { entities } from '../lib/api'
import { Bundle } from '../types'
import { Plus, Search } from 'lucide-react'
import BundleCard from '../components/BundleCard'
import CreateBundleModal from '../components/CreateBundleModal'
import { motion } from 'framer-motion'

export default function Bundles() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'paused'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadBundles()
  }, [])

  useEffect(() => {
    filterBundles()
  }, [bundles, searchQuery, statusFilter])

  const loadBundles = async () => {
    try {
      const response = await entities.query<Bundle>('Bundle')
      if (response.success && response.data) {
        setBundles(response.data)
      }
    } catch (error) {
      console.error('Failed to load bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBundles = () => {
    let filtered = bundles

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredBundles(filtered)
  }

  const handleBundleCreated = (bundle: Bundle) => {
    setBundles([bundle, ...bundles])
    setShowCreateModal(false)
  }

  const handleBundleUpdated = (updatedBundle: Bundle) => {
    setBundles(bundles.map(b => b.id === updatedBundle.id ? updatedBundle : b))
  }

  const handleBundleDeleted = (bundleId: string) => {
    setBundles(bundles.filter(b => b.id !== bundleId))
  }

  const statusCounts = {
    all: bundles.length,
    active: bundles.filter(b => b.status === 'active').length,
    draft: bundles.filter(b => b.status === 'draft').length,
    paused: bundles.filter(b => b.status === 'paused').length,
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
          <h1 className="text-2xl font-bold text-gray-900">Bundles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your product bundles
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Bundle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search bundles..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            {(['all', 'active', 'draft', 'paused'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs">({statusCounts[status]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bundles Grid */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Plus className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bundles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first bundle'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Bundle
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBundles.map((bundle, index) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <BundleCard
                bundle={bundle}
                onUpdate={handleBundleUpdated}
                onDelete={handleBundleDeleted}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Bundle Modal */}
      {showCreateModal && (
        <CreateBundleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleBundleCreated}
        />
      )}
    </div>
  )
}
