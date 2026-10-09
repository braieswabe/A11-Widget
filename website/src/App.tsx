import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SiteAccessProvider } from './contexts/SiteAccessContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SiteAccessRoute from './components/SiteAccessRoute'
import SitePasswordGate from './pages/SitePasswordGate'
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
  '/': 'Site Access | Accessibility Widget v1',
  '/welcome': 'Home | Accessibility Widget v1',
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
    <SiteAccessProvider>
      <AuthProvider>
        <BrowserRouter>
          <RouteTitle />
          <Routes>
            <Route path="/" element={<SitePasswordGate />} />

            <Route
              path="/welcome"
              element={
                <SiteAccessRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/getting-started"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <GettingStarted />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/download"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <Download />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/features"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <Features />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/wordpress"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <WordPress />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />

            <Route
              path="/admin/login"
              element={
                <SiteAccessRoute>
                  <AdminLogin />
                </SiteAccessRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/admin/clients/new"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <ClientForm />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/admin/clients/:id/edit"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <ClientForm />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/admin/domains"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <DomainsManagement />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route
              path="/admin/monitoring"
              element={
                <SiteAccessRoute>
                  <ProtectedRoute>
                    <Layout>
                      <Monitoring />
                    </Layout>
                  </ProtectedRoute>
                </SiteAccessRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SiteAccessProvider>
  )
}

export default App
