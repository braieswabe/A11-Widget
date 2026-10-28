import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSiteAccess } from '../contexts/SiteAccessContext'
import { teardownA11yWidget } from '../utils/teardownA11yWidget'
import {
  WIDGET_VERSION,
  WIDGET_LOADER_URL,
  WIDGET_LOADER_FILENAME,
  WIDGET_RUNTIME_FILENAME
} from '../constants'
import A11yLogo from './A11yLogo'
import './Layout.css'

const WIDGET_SCRIPT_MARKERS = [WIDGET_LOADER_FILENAME, WIDGET_RUNTIME_FILENAME, 'a11y-widget.js']

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { admin } = useAuth()
  const { hasSiteAccess } = useSiteAccess()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const [widgetError, setWidgetError] = useState<string | null>(null)

  useEffect(() => {
    // Configure widget with all features enabled and telemetry
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const apiBase = isDevelopment ? 'http://localhost:3000' : window.location.origin
    
    // Set widget configuration before loading
    window.__A11Y_WIDGET__ = {
      siteId: window.location.hostname || 'localhost',
      position: 'right',
      keyboardShortcut: 'Alt+A',
      enableTelemetry: true,
      telemetryEndpoint: `${apiBase}/api/telemetry`,
      translateEndpoint: `${apiBase}/api/translate`,
      heartbeatEndpoint: `${apiBase}/api/widget/heartbeat`,
      errorEndpoint: `${apiBase}/api/widget/errors`,
      supportEndpoint: `${apiBase}/api/support/cases`,
      supportEnabled: true,
      heartbeatIntervalMs: 300000,
      licenseKey: import.meta.env.VITE_A11Y_LICENSE_KEY || undefined,
      apiKey: import.meta.env.VITE_A11Y_API_KEY || undefined,
      initialOpen: false,
      features: {
        contrast: true,
        fontScale: true,
        spacing: true,
        reduceMotion: true,
        readableFont: true,
        presets: true,
        reset: true,
        skipLink: true,
        textToSpeech: true,
        translation: true,
        readingRuler: true,
        screenMask: true,
        textOnlyMode: true,
        margins: true,
        cursorOptions: true,
        dictionary: true,
        magnifier: true
      }
    }
  }, [])

  useEffect(() => {
    if (!hasSiteAccess) {
      teardownA11yWidget()
      setWidgetLoaded(false)
      setWidgetError(null)
      return
    }

    const waitForWidgetReady = (timeoutMs = 8000) => {
      const started = Date.now()
      const interval = setInterval(() => {
        if (window.__a11yWidget?.__loaded || document.getElementById('a11y-widget-toggle')) {
          setWidgetLoaded(true)
          clearInterval(interval)
          return
        }
        if (Date.now() - started >= timeoutMs) {
          clearInterval(interval)
          if (!window.__a11yWidget?.__loaded && !document.getElementById('a11y-widget-toggle')) {
            setWidgetError('Widget failed to initialize. Check browser console for errors.')
          } else {
            setWidgetLoaded(true)
          }
        }
      }, 100)
      return () => clearInterval(interval)
    }

    const loadWidget = () => {
      const hasLoaderOrRuntime = WIDGET_SCRIPT_MARKERS.some(
        (marker) => !!document.querySelector(`script[src*="${marker}"]`)
      )

      if (window.__a11yWidget?.__loaded && hasLoaderOrRuntime) {
        setWidgetLoaded(true)
        return () => undefined
      }

      if (hasLoaderOrRuntime) {
        return waitForWidgetReady()
      }

      teardownA11yWidget()

      const hostedLoaderUrl = WIDGET_LOADER_URL

      const appendLoaderScript = (loaderUrl: string) => {
        const loaderScript = document.createElement('script')
        loaderScript.id = 'a11y-widget-loader-script'
        loaderScript.src = loaderUrl
        loaderScript.defer = true
        loaderScript.crossOrigin = 'anonymous'
        loaderScript.onerror = () => {
          if (loaderScript.dataset.hostedFallback !== '1') {
            loaderScript.dataset.hostedFallback = '1'
            delete window.__A11Y_ASSET_BASE__
            loaderScript.src = `${hostedLoaderUrl}?v=${Date.now()}`
            return
          }
          setWidgetError('Failed to load widget loader.')
        }
        document.head.appendChild(loaderScript)
      }

      window.__A11Y_ASSET_BASE__ = `${window.location.origin}/`
      appendLoaderScript(`/${WIDGET_LOADER_FILENAME}?v=${Date.now()}`)
    }

    let stopWaiting: (() => void) | undefined
    const timer = setTimeout(() => {
      loadWidget()
      stopWaiting = waitForWidgetReady()
    }, 100)

    return () => {
      clearTimeout(timer)
      stopWaiting?.()
      teardownA11yWidget()
    }
  }, [hasSiteAccess])

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
          <Link to="/welcome" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <A11yLogo size={32} />
            <span>
              Accessibility Widget <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>{WIDGET_VERSION}</span>
            </span>
          </Link>
          <button 
            className="mobile-menu-toggle" 
            aria-label="Toggle menu" 
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li><Link to="/welcome" className={isActive('/welcome') ? 'active' : ''}>Home</Link></li>
            {/* Employee-only links, including Monitoring, stay hidden unless an admin session is active. */}
            {admin && (
              <>
                <li><Link to="/features" className={isActive('/features') ? 'active' : ''}>Features</Link></li>
                <li><Link to="/getting-started" className={isActive('/getting-started') ? 'active' : ''}>Installation</Link></li>
                <li><Link to="/wordpress" className={isActive('/wordpress') ? 'active' : ''}>WordPress</Link></li>
                <li><Link to="/download" className={isActive('/download') ? 'active' : ''}>Download</Link></li>
                <li><Link to="/admin/monitoring" className={isActive('/admin/monitoring') ? 'active' : ''}>Monitoring</Link></li>
              </>
            )}
            <li>
              <Link 
                to={admin ? "/admin/dashboard" : "/admin/login"}
                className={isActive('/admin/login') || isActive('/admin/dashboard') ? 'active' : ''}
                style={{
                  backgroundColor: 'var(--color-primary, #0066cc)',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}
              >
                {admin ? 'Admin Dashboard' : 'Admin Login'}
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="demo-content">
        {children}
      </main>

      {/* Widget Loading Status - Show in development, or if there's an error in production */}
      {(import.meta.env.DEV || widgetError) && (
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: '300px'
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
            {/* Monitoring exposes operational data and is only linked for authenticated admins. */}
            {admin ? (
              <>
                <Link to="/features">Features</Link>
                <Link to="/getting-started">Installation</Link>
                <Link to="/wordpress">WordPress</Link>
                <Link to="/download">Download</Link>
                <Link to="/admin/monitoring">Monitoring</Link>
              </>
            ) : (
              <Link to="/admin/login">Employee Login</Link>
            )}
          </div>
          <p>Accessibility Widget {WIDGET_VERSION} — site access password required; installation materials also require employee admin login.</p>
        </div>
      </footer>
    </>
  )
}
