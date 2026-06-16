import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
