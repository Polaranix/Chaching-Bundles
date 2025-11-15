import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { entities } from '../lib/api'
import { Bundle, Stats } from '../types'
import { Package, DollarSign, ShoppingCart, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage, getStatusColor, getBundleTypeLabel } from '../lib/utils'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    activeBundles: 0,
    totalRevenue: 0,
    totalSales: 0,
    avgConversion: 0,
  })
  const [recentBundles, setRecentBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const bundlesResponse = await entities.query<Bundle>('Bundle', { limit: 5 })
      
      if (bundlesResponse.success && bundlesResponse.data) {
        const bundles = bundlesResponse.data
        setRecentBundles(bundles)

        // Calculate stats
        const activeBundles = bundles.filter(b => b.status === 'active').length
        const totalRevenue = bundles.reduce((sum, b) => sum + (b.total_revenue || 0), 0)
        const totalSales = bundles.reduce((sum, b) => sum + (b.total_sales || 0), 0)
        const avgConversion = bundles.length > 0
          ? bundles.reduce((sum, b) => sum + (b.conversion_rate || 0), 0) / bundles.length
          : 0

        setStats({
          activeBundles,
          totalRevenue,
          totalSales,
          avgConversion,
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Active Bundles',
      value: stats.activeBundles,
      icon: Package,
      color: 'bg-blue-500',
      format: (v: number) => formatNumber(v),
    },
    {
      name: 'Total Revenue',
      value: stats.totalRevenue,
      icon: DollarSign,
      color: 'bg-green-500',
      format: (v: number) => formatCurrency(v),
    },
    {
      name: 'Total Sales',
      value: stats.totalSales,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      format: (v: number) => formatNumber(v),
    },
    {
      name: 'Avg Conversion',
      value: stats.avgConversion,
      icon: TrendingUp,
      color: 'bg-orange-500',
      format: (v: number) => formatPercentage(v),
    },
  ]

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your bundle performance
          </p>
        </div>
        <Link
          to="/app/bundles"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Bundle
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.format(stat.value)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bundles */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Bundles</h2>
            <Link
              to="/app/bundles"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentBundles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bundles yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first bundle.
              </p>
              <div className="mt-6">
                <Link
                  to="/app/bundles"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bundle
                </Link>
              </div>
            </div>
          ) : (
            recentBundles.map((bundle) => (
              <div key={bundle.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {bundle.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bundle.status)}`}>
                        {bundle.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{getBundleTypeLabel(bundle.bundle_type)}</span>
                      <span>•</span>
                      <span>{bundle.products.length} products</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-right">
                      <div className="text-gray-900 font-medium">
                        {formatNumber(bundle.total_sales)}
                      </div>
                      <div className="text-gray-500">sales</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-medium">
                        {formatCurrency(bundle.total_revenue)}
                      </div>
                      <div className="text-gray-500">revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/app/bundles"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <div className="flex-shrink-0">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Create Bundle</p>
              <p className="text-sm text-gray-500 truncate">Set up a new bundle</p>
            </div>
          </Link>

          <Link
            to="/app/products"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <div className="flex-shrink-0">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Sync Products</p>
              <p className="text-sm text-gray-500 truncate">Update product catalog</p>
            </div>
          </Link>

          <Link
            to="/app/analytics"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500 truncate">Track performance</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
