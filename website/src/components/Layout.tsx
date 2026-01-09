import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const [widgetError, setWidgetError] = useState<string | null>(null)

  useEffect(() => {
    // Load widget from GitHub with cache-busting for immediate updates
    // Uses raw GitHub URL to bypass CDN caching and ensure fresh loads
    const loadWidget = () => {
      // Check if widget is already loaded
      if (window.__a11yWidget?.__loaded) {
        setWidgetLoaded(true)
        return
      }

      // Check if loader script already exists
      if (document.getElementById('a11y-widget-loader')) {
        // Wait a bit for widget to initialize
        setTimeout(() => {
          if (window.__a11yWidget?.__loaded) {
            setWidgetLoaded(true)
          }
        }, 500)
        return
      }

      // Create loader script with cache-busting
      const loaderScript = document.createElement('script')
      loaderScript.id = 'a11y-widget-loader'
      
      // Use raw GitHub URL with cache-busting for immediate updates
      const timestamp = Math.floor(Date.now() / 1000)
      const loaderUrl = `https://raw.githubusercontent.com/braieswabe/A11-Widget/main/a11y-widget-loader.js?v=${timestamp}`
      loaderScript.src = loaderUrl
      loaderScript.defer = true
      
      // Track loading state
      loaderScript.onload = () => {
        // Wait for widget to initialize
        const checkWidget = setInterval(() => {
          if (window.__a11yWidget?.__loaded) {
            setWidgetLoaded(true)
            clearInterval(checkWidget)
          }
        }, 100)
        
        // Timeout after 3 seconds
        setTimeout(() => {
          clearInterval(checkWidget)
          if (!window.__a11yWidget?.__loaded) {
            setWidgetError('Widget failed to initialize')
          }
        }, 3000)
      }
      
      loaderScript.onerror = () => {
        // Fallback to jsDelivr CDN if raw GitHub fails
        loaderScript.src = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js?v=${timestamp}`
        loaderScript.onerror = () => {
          setWidgetError('Failed to load accessibility widget')
        }
      }
      
      document.head.appendChild(loaderScript)
    }

    loadWidget()
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link to="/" className="nav-logo">Accessibility Widget v1</Link>
          <button 
            className="mobile-menu-toggle" 
            aria-label="Toggle menu" 
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/getting-started" className={isActive('/getting-started') ? 'active' : ''}>Installation</Link></li>
            <li><Link to="/download" className={isActive('/download') ? 'active' : ''}>Download</Link></li>
          </ul>
        </nav>
      </header>

      <main className="demo-content">
        {children}
      </main>

      {/* Widget Loading Status (Development/Debug) - Only show in development */}
      {import.meta.env.DEV && (
        <div className="widget-status" style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          background: widgetError ? '#d1242f' : widgetLoaded ? '#1a7f37' : '#656d76',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 9999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {widgetError ? (
            <>⚠️ Widget Error: {widgetError}</>
          ) : widgetLoaded ? (
            <>✓ Widget Loaded</>
          ) : (
            <>⏳ Loading Widget...</>
          )}
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <Link to="/getting-started">Installation</Link>
            <Link to="/download">Download</Link>
          </div>
          <p>Accessibility Widget v1 — WCAG 2.1 AA-aligned enhancements for supported surfaces only.</p>
        </div>
      </footer>
    </>
  )
}

