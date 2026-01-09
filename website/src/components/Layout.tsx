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
    // Load widget from GitHub CDN with cache-busting for updates
    // Uses jsDelivr CDN as primary (more reliable than raw GitHub)
    const loadWidget = () => {
      // Check if widget is already loaded
      if (window.__a11yWidget?.__loaded) {
        setWidgetLoaded(true)
        return
      }

      // Check if loader script already exists
      const existingLoader = document.getElementById('a11y-widget-loader')
      if (existingLoader) {
        // Script already loading, wait for widget to initialize
        const checkWidget = setInterval(() => {
          if (window.__a11yWidget?.__loaded) {
            setWidgetLoaded(true)
            clearInterval(checkWidget)
          }
        }, 100)
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkWidget)
          if (!window.__a11yWidget?.__loaded) {
            setWidgetError('Widget initialization timeout')
          }
        }, 5000)
        return
      }

      // Create loader script with cache-busting
      const loaderScript = document.createElement('script')
      loaderScript.id = 'a11y-widget-loader'
      
      // In development, load from local files; in production, try raw GitHub first, fallback to jsDelivr
      const timestamp = Date.now() // Use milliseconds for better cache-busting
      const random = Math.random().toString(36).substring(7)
      const isDev = import.meta.env.DEV
      
      let loaderUrl: string
      let fallbackUrl: string
      
      if (isDev) {
        // Development: Load widget files directly from local files
        // First, load CSS
        const cssLink = document.createElement('link')
        cssLink.id = 'a11y-widget-stylesheet'
        cssLink.rel = 'stylesheet'
        cssLink.href = '/a11y-widget.css?v=' + timestamp
        document.head.appendChild(cssLink)
        
        // Then load JS directly
        loaderUrl = '/a11y-widget.js?v=' + timestamp
        fallbackUrl = loaderUrl // No fallback needed in dev
      } else {
        // Production: Try raw GitHub first, fallback to jsDelivr CDN
        // Use commit hash or timestamp for maximum cache-busting
        // Add multiple cache-busting parameters to ensure fresh load
        var cacheBuster = timestamp + '_' + random + '_' + Date.now();
        loaderUrl = `https://raw.githubusercontent.com/braieswabe/A11-Widget/main/a11y-widget-loader.js?v=${cacheBuster}&_=${Math.random()}&nocache=${Date.now()}&t=${Date.now()}&cb=${cacheBuster}`
        fallbackUrl = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js?v=${cacheBuster}&_=${Math.random()}&nocache=${Date.now()}&t=${Date.now()}&cb=${cacheBuster}`
      }
      
      loaderScript.src = loaderUrl
      loaderScript.defer = true // Defer ensures script runs after DOM is parsed
      
      // Add error handler with fallback
      loaderScript.onerror = () => {
        console.warn('Failed to load widget loader from raw GitHub, trying jsDelivr CDN fallback...')
        // Remove failed script
        if (loaderScript.parentNode) {
          loaderScript.parentNode.removeChild(loaderScript)
        }
        
        // Try fallback URL (jsDelivr CDN) with even more aggressive cache-busting
        const fallbackScript = document.createElement('script')
        fallbackScript.id = 'a11y-widget-loader'
        // Add additional cache-busting for fallback
        const fallbackCacheBuster = Date.now() + '_' + Math.random().toString(36).substring(7)
        fallbackScript.src = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js?v=${fallbackCacheBuster}&_=${Math.random()}&nocache=${Date.now()}&t=${Date.now()}&cb=${fallbackCacheBuster}&force=${Date.now()}`
        fallbackScript.setAttribute('data-version', '1.3') // Set version attribute
        fallbackScript.defer = true
        
        fallbackScript.onload = () => {
          // Use the same loading logic as the main script
          let attempts = 0
          const maxAttempts = 60
          
          const checkWidget = setInterval(() => {
            attempts++
            
            if (window.__a11yWidget?.__loaded) {
              setWidgetLoaded(true)
              clearInterval(checkWidget)
              return
            }
            
            if (document.getElementById('a11y-widget-toggle') || document.getElementById('a11y-widget-root')) {
              setWidgetLoaded(true)
              clearInterval(checkWidget)
              return
            }
            
            if (attempts >= maxAttempts) {
              clearInterval(checkWidget)
              if (!window.__a11yWidget?.__loaded && !document.getElementById('a11y-widget-toggle')) {
                setWidgetError('Widget failed to initialize. Check browser console for errors.')
                console.error('Widget initialization timeout. Check if CSS/JS loaded correctly.')
              }
            }
          }, 100)
        }
        
        fallbackScript.onerror = () => {
          setWidgetError('Failed to load widget loader script from both sources')
          console.error('Failed to load accessibility widget loader from both:', loaderUrl, 'and', fallbackUrl)
        }
        
        // Insert fallback script
        const firstScript = document.getElementsByTagName('script')[0]
        if (firstScript?.parentNode) {
          firstScript.parentNode.insertBefore(fallbackScript, firstScript)
        } else {
          document.head.appendChild(fallbackScript)
        }
      }
      
      // Track loading state
      loaderScript.onload = () => {
        // Wait for widget to initialize (loader loads CSS/JS, then widget initializes)
        let attempts = 0
        const maxAttempts = 60 // 6 seconds max (widget needs time to load CSS/JS and initialize)
        
        const checkWidget = setInterval(() => {
          attempts++
          
          // Check if widget is loaded
          if (window.__a11yWidget?.__loaded) {
            setWidgetLoaded(true)
            clearInterval(checkWidget)
            return
          }
          
          // Also check if widget button exists in DOM (widget might be loaded but __loaded flag not set yet)
          if (document.getElementById('a11y-widget-toggle') || document.getElementById('a11y-widget-root')) {
            setWidgetLoaded(true)
            clearInterval(checkWidget)
            return
          }
          
          // Timeout check
          if (attempts >= maxAttempts) {
            clearInterval(checkWidget)
            // Check one more time before showing error
            if (!window.__a11yWidget?.__loaded && !document.getElementById('a11y-widget-toggle')) {
              setWidgetError('Widget failed to initialize. Check browser console for errors.')
              console.error('Widget initialization timeout. Check if CSS/JS loaded correctly.')
            }
          }
        }, 100)
      }
      
      loaderScript.onerror = () => {
        // Try fallback to jsDelivr CDN if raw GitHub fails
        if (!isDev) {
          console.warn('Failed to load widget loader from raw GitHub, trying jsDelivr CDN fallback...')
          
          // Remove failed script
          if (loaderScript.parentNode) {
            loaderScript.parentNode.removeChild(loaderScript)
          }
          
          // Try fallback URL (jsDelivr CDN)
          const fallbackScript = document.createElement('script')
          fallbackScript.id = 'a11y-widget-loader'
          fallbackScript.src = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js?v=${timestamp}&_=${random}`
          fallbackScript.defer = true
          
          fallbackScript.onload = () => {
            // Use the same loading logic as the main script
            let attempts = 0
            const maxAttempts = 60
            
            const checkWidget = setInterval(() => {
              attempts++
              
              if (window.__a11yWidget?.__loaded) {
                setWidgetLoaded(true)
                clearInterval(checkWidget)
                return
              }
              
              if (document.getElementById('a11y-widget-toggle') || document.getElementById('a11y-widget-root')) {
                setWidgetLoaded(true)
                clearInterval(checkWidget)
                return
              }
              
              if (attempts >= maxAttempts) {
                clearInterval(checkWidget)
                if (!window.__a11yWidget?.__loaded && !document.getElementById('a11y-widget-toggle')) {
                  setWidgetError('Widget failed to initialize. Check browser console for errors.')
                  console.error('Widget initialization timeout. Check if CSS/JS loaded correctly.')
                }
              }
            }, 100)
          }
          
          fallbackScript.onerror = () => {
            setWidgetError('Failed to load widget loader script from both sources')
            console.error('Failed to load accessibility widget loader from both raw GitHub and jsDelivr CDN')
          }
          
          // Insert fallback script
          const firstScript = document.getElementsByTagName('script')[0]
          if (firstScript?.parentNode) {
            firstScript.parentNode.insertBefore(fallbackScript, firstScript)
          } else {
            document.head.appendChild(fallbackScript)
          }
        } else {
          setWidgetError('Failed to load widget loader script')
          console.error('Failed to load accessibility widget loader from:', loaderUrl)
        }
      }
      
      // Insert script before first script or append to head
      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(loaderScript, firstScript)
      } else {
        document.head.appendChild(loaderScript)
      }
    }

    // Load widget after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadWidget()
    }, 100)

    return () => clearTimeout(timer)
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
            <li><Link to="/features" className={isActive('/features') ? 'active' : ''}>Features</Link></li>
            <li><Link to="/getting-started" className={isActive('/getting-started') ? 'active' : ''}>Installation</Link></li>
            <li><Link to="/download" className={isActive('/download') ? 'active' : ''}>Download</Link></li>
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
            <Link to="/features">Features</Link>
            <Link to="/getting-started">Installation</Link>
            <Link to="/download">Download</Link>
          </div>
          <p>Accessibility Widget v1 — WCAG 2.1 AA-aligned enhancements for supported surfaces only.</p>
        </div>
      </footer>
    </>
  )
}

