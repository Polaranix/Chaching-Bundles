import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ShopifyLoader from './pages/ShopifyLoader'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Bundles from './pages/Bundles'
import Products from './pages/Products'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ShopifyLoader />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="bundles" element={<Bundles />} />
            <Route path="products" element={<Products />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
