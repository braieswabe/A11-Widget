import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import GettingStarted from './pages/GettingStarted'
import Download from './pages/Download'
import Features from './pages/Features'
import WordPress from './pages/WordPress'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ClientForm from './pages/admin/ClientForm'
import DomainsManagement from './pages/admin/DomainsManagement'
import Monitoring from './pages/admin/Monitoring'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home | Accessibility Widget v1',
  '/getting-started': 'Installation Guide | Accessibility Widget v1',
  '/download': 'Download Example | Accessibility Widget v1',
  '/features': 'Features | Accessibility Widget v1',
  '/wordpress': 'WordPress Install | Accessibility Widget v1',
  '/admin/login': 'Admin Login | Accessibility Widget v1',
  '/admin/dashboard': 'Admin Dashboard | Accessibility Widget v1',
  '/admin/clients/new': 'Create New Client | Accessibility Widget v1',
  '/admin/domains': 'Manage Domains | Accessibility Widget v1',
  '/admin/monitoring': 'Widget Monitoring | Accessibility Widget v1'
}

function RouteTitle() {
  const location = useLocation()

  useEffect(() => {
    const title = location.pathname.match(/^\/admin\/clients\/[^/]+\/edit$/)
      ? 'Edit Client | Accessibility Widget v1'
      : PAGE_TITLES[location.pathname] || 'Accessibility Widget v1'
    document.title = title
  }, [location.pathname])

  return null
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteTitle />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/getting-started" element={<ProtectedRoute><Layout><GettingStarted /></Layout></ProtectedRoute>} />
          <Route path="/download" element={<ProtectedRoute><Layout><Download /></Layout></ProtectedRoute>} />
          <Route path="/features" element={<ProtectedRoute><Layout><Features /></Layout></ProtectedRoute>} />
          <Route path="/wordpress" element={<ProtectedRoute><Layout><WordPress /></Layout></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/clients/new" 
            element={
              <ProtectedRoute>
                <Layout><ClientForm /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/clients/:id/edit" 
            element={
              <ProtectedRoute>
                <Layout><ClientForm /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/domains" 
            element={
              <ProtectedRoute>
                <Layout><DomainsManagement /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/monitoring"
            element={
              <ProtectedRoute>
                <Layout><Monitoring /></Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
