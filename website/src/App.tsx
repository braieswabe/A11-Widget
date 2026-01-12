import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import GettingStarted from './pages/GettingStarted'
import Download from './pages/Download'
import Features from './pages/Features'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ClientForm from './pages/admin/ClientForm'
import DomainsManagement from './pages/admin/DomainsManagement'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/getting-started" element={<Layout><GettingStarted /></Layout>} />
          <Route path="/download" element={<Layout><Download /></Layout>} />
          <Route path="/features" element={<Layout><Features /></Layout>} />
          
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

