import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Package, Target } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils'

export default function Analytics() {
  const [stats, setStats] = useState({
    totalBundles: 0,
    totalRevenue: 0,
    totalSales: 0,
    avgConversion: 0,
  })
  const [revenueByBundle, setRevenueByBundle] = useState<any[]>([])
  const [revenueByType, setRevenueByType] = useState<any[]>([])
  const [topBundles, setTopBundles] = useState<any[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      // Fetch bundles for analytics
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
        const bundles = data.data || []

        // Calculate stats
        const totalRevenue = bundles.reduce((sum: number, b: any) => sum + (b.total_revenue || 0), 0)
        const totalSales = bundles.reduce((sum: number, b: any) => sum + (b.total_sales || 0), 0)
        const avgConversion = bundles.reduce((sum: number, b: any) => sum + (b.conversion_rate || 0), 0) / (bundles.length || 1)

        setStats({
          totalBundles: bundles.length,
          totalRevenue,
          totalSales,
          avgConversion,
        })

        // Revenue by bundle (top 10)
        const bundleRevenue = bundles
          .map((b: any) => ({
            name: b.name.length > 20 ? b.name.substring(0, 20) + '...' : b.name,
            revenue: b.total_revenue || 0,
          }))
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 10)

        setRevenueByBundle(bundleRevenue)

        // Revenue by bundle type
        const typeRevenue = bundles.reduce((acc: any, b: any) => {
          const type = b.bundle_type
          acc[type] = (acc[type] || 0) + (b.total_revenue || 0)
          return acc
        }, {})

        setRevenueByType(
          Object.entries(typeRevenue).map(([name, value]) => ({
            name: name.replace('_', ' '),
            value,
          }))
        )

        // Top performing bundles
        setTopBundles(
          bundles
            .sort((a: any, b: any) => (b.total_revenue || 0) - (a.total_revenue || 0))
            .slice(0, 5)
        )
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

  const statCards = [
    {
      title: 'Total Bundles',
      value: formatNumber(stats.totalBundles),
      icon: Package,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Total Sales',
      value: formatNumber(stats.totalSales),
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Avg Conversion',
      value: formatPercent(stats.avgConversion),
      icon: Target,
      color: 'text-orange-600 bg-orange-50',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your bundle performance and insights</p>
      </div>

      {/* Stats Cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Bundle */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Bundle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByBundle}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Bundle Type */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Bundle Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Bundles */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Bundles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bundle Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topBundles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No bundle data available yet
                  </td>
                </tr>
              ) : (
                topBundles.map((bundle, index) => (
                  <tr key={bundle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bundle.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {bundle.bundle_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(bundle.total_sales || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(bundle.total_revenue || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercent(bundle.conversion_rate || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
