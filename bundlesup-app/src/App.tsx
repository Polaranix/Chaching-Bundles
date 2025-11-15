import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
    <Router>
      <Routes>
        <Route path="/" element={<ShopifyLoader />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/products" element={<Products />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
