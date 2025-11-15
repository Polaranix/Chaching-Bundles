import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent, getBundleStatusColor } from '../lib/utils'
import type { Bundle, DashboardStats } from '../types'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    active_bundles: 0,
    total_revenue: 0,
    total_sales: 0,
    avg_conversion: 0,
  })
  const [recentBundles, setRecentBundles] = useState<Bundle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      // Fetch bundles
      const response = await fetch(
        `https://api.base44.com/v1/apps/${import.meta.env.VITE_BASE44_APP_ID}/entities/Bundle?limit=5&sort=-created_at`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setRecentBundles(data.data || [])

        // Calculate stats
        const activeBundles = data.data.filter((b: Bundle) => b.status === 'active').length
        const totalRevenue = data.data.reduce((sum: number, b: Bundle) => sum + (b.total_revenue || 0), 0)
        const totalSales = data.data.reduce((sum: number, b: Bundle) => sum + (b.total_sales || 0), 0)
        const avgConversion = data.data.reduce((sum: number, b: Bundle) => sum + (b.conversion_rate || 0), 0) / (data.data.length || 1)

        setStats({
          active_bundles: activeBundles,
          total_revenue: totalRevenue,
          total_sales: totalSales,
          avg_conversion: avgConversion,
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Active Bundles',
      value: formatNumber(stats.active_bundles),
      icon: Package,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Total Sales',
      value: formatNumber(stats.total_sales),
      icon: ShoppingBag,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Avg Conversion',
      value: formatPercent(stats.avg_conversion),
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your bundles.</p>
        </div>
        <Link
          to="/bundles"
          className="btn btn-primary px-6 py-3 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Bundle
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bundles */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bundles</h2>
          <Link
            to="/bundles"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading bundles...</p>
          </div>
        ) : recentBundles.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles yet</h3>
            <p className="text-gray-600 mb-6">Create your first bundle to start increasing your AOV</p>
            <Link to="/bundles" className="btn btn-primary px-6 py-2">
              Create Bundle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bundle Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bundle.name}</div>
                      {bundle.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{bundle.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{bundle.bundle_type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBundleStatusColor(bundle.status)}`}>
                        {bundle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bundle.products?.length || 0} products
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(bundle.total_sales || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(bundle.total_revenue || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/bundles" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Bundles</h3>
              <p className="text-sm text-gray-600">Create and edit product bundles</p>
            </div>
          </div>
        </Link>

        <Link to="/products" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Sync Products</h3>
              <p className="text-sm text-gray-600">Import products from Shopify</p>
            </div>
          </div>
        </Link>

        <Link to="/analytics" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-600">Track bundle performance</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
