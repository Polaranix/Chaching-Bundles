import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Save, Store, Bell, Palette } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    storeName: user?.shop_domain || '',
    email: user?.email || '',
    notifications: {
      orderCreated: true,
      lowInventory: true,
      weeklyReport: false,
    },
    display: {
      showSavings: true,
      showIndividualPrices: true,
      defaultLayout: 'grid' as 'grid' | 'list',
    },
    theme: {
      primaryColor: '#10b981',
      buttonStyle: 'rounded' as 'rounded' | 'square',
    },
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save settings to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your app configuration and preferences
        </p>
      </div>

      {/* Store Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <Store className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Store Configuration
            </h2>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Store Domain
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">
              Your Shopify store domain (read-only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email for notifications and support
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Notification Preferences
            </h2>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Order Created</p>
              <p className="text-xs text-gray-500">
                Get notified when a bundle order is placed
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    orderCreated: !settings.notifications.orderCreated,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.notifications.orderCreated ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notifications.orderCreated ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Low Inventory</p>
              <p className="text-xs text-gray-500">
                Alert when bundle products are running low
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    lowInventory: !settings.notifications.lowInventory,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.notifications.lowInventory ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notifications.lowInventory ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Weekly Report</p>
              <p className="text-xs text-gray-500">
                Receive weekly performance summary
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    weeklyReport: !settings.notifications.weeklyReport,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.notifications.weeklyReport ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notifications.weeklyReport ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bundle Display Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <Palette className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Bundle Display Settings
            </h2>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Show Savings</p>
              <p className="text-xs text-gray-500">
                Display savings amount on bundle widgets
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    showSavings: !settings.display.showSavings,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.display.showSavings ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.display.showSavings ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Show Individual Prices</p>
              <p className="text-xs text-gray-500">
                Display original prices for each product
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    showIndividualPrices: !settings.display.showIndividualPrices,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.display.showIndividualPrices ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.display.showIndividualPrices ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Layout
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, defaultLayout: 'grid' },
                  })
                }
                className={`flex-1 py-2 px-4 border rounded-md text-sm font-medium transition-colors ${
                  settings.display.defaultLayout === 'grid'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, defaultLayout: 'list' },
                  })
                }
                className={`flex-1 py-2 px-4 border rounded-md text-sm font-medium transition-colors ${
                  settings.display.defaultLayout === 'list'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
