import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { WIDGET_VERSION, WIDGET_SCRIPT_URL, WIDGET_SCRIPT_URL_FALLBACK, WIDGET_CSS_URL } from '../constants'
import A11yLogo from './A11yLogo'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { admin } = useAuth()
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
    // Load widget directly from GitHub CDN (using versioned file v1.1.0)
    // Uses jsDelivr CDN as primary (more reliable than raw GitHub)
    const loadWidget = () => {
      // Check if widget is already loaded
      if (window.__a11yWidget?.__loaded) {
        console.log('[A11Y Layout] Widget already loaded')
        setWidgetLoaded(true)
        return
      }

      // Check if widget button already exists (widget might be loaded but flag not set)
      const existingToggle = document.getElementById('a11y-widget-toggle')
      const existingRoot = document.getElementById('a11y-widget-root')
      if (existingToggle || existingRoot) {
        console.log('[A11Y Layout] Widget elements already exist in DOM')
        setWidgetLoaded(true)
        return
      }

      // Check if widget script already exists
      const existingWidgetScript = document.querySelector('script[src*="a11y-widget"]')
      if (existingWidgetScript) {
        console.log('[A11Y Layout] Widget script already loading, waiting...')
        // Script already loading, wait for widget to initialize
        const checkWidget = setInterval(() => {
          if (window.__a11yWidget?.__loaded || document.getElementById('a11y-widget-toggle')) {
            setWidgetLoaded(true)
            clearInterval(checkWidget)
          }
        }, 100)
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkWidget)
          if (!window.__a11yWidget?.__loaded && !document.getElementById('a11y-widget-toggle')) {
            setWidgetError('Widget initialization timeout')
          } else {
            setWidgetLoaded(true)
          }
        }, 5000)
        return
      }

      // Detect environment: development, Vercel deployment, or production
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const isVercelDeployment = window.location.hostname === 'a11-widget.vercel.app' || window.location.hostname.endsWith('.vercel.app')
      
      // Always use local files when on localhost (for local development)
      // On Vercel deployment, always use local files for guaranteed availability (testing/demo)
      // In production (external), use CDN URLs
      const useLocalFiles = isDevelopment || isVercelDeployment || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

      // Load CSS first
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      const cssUrl = useLocalFiles 
        ? '/a11y-widget.css?v=' + Date.now() 
        : WIDGET_CSS_URL + '?v=' + Date.now()
      cssLink.href = cssUrl
      cssLink.id = 'a11y-widget-stylesheet'
      
      // Add fallback for CSS on Vercel
      if (isVercelDeployment) {
        cssLink.onerror = function() {
          // Try fallback to CDN if local file fails
          cssLink.href = WIDGET_CSS_URL + '?v=' + Date.now()
        }
      }
      
      document.head.appendChild(cssLink)

      // Load widget script directly (using new versioned file)
      const widgetScript = document.createElement('script')
      widgetScript.id = 'a11y-widget-script'
      
      // Use local files on Vercel/devel, CDN in production
      const widgetUrl = useLocalFiles 
        ? '/a11y-widget-v1.1.0.js?v=' + Date.now()
        : WIDGET_SCRIPT_URL + '?v=' + Date.now()
      const fallbackUrl = useLocalFiles
        ? '/a11y-widget-v1.1.0.js?v=' + Date.now() // Fallback to v1.1.0 in dev/Vercel
        : WIDGET_SCRIPT_URL_FALLBACK + '?v=' + Date.now() // Fallback to v1.1.0 widget file
      
      widgetScript.src = widgetUrl
      widgetScript.defer = true // Defer ensures script runs after DOM is parsed
      
      // Debug logging for local development
      if (isDevelopment) {
        console.log('[A11Y Layout] Loading widget:', {
          widgetUrl,
          fallbackUrl,
          useLocalFiles,
          isDevelopment,
          isVercelDeployment
        })
        // #region agent log
        const logData = {
          location: 'Layout.tsx:loadWidget',
          message: 'Widget loading initiated',
          data: {
            widgetUrl,
            fallbackUrl,
            useLocalFiles,
            isDevelopment,
            isVercelDeployment,
            hostname: window.location.hostname
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'A'
        };
        fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        // #endregion
      }
      
      // Track loading state
      widgetScript.onload = () => {
        // #region agent log
        const logData = {
          location: 'Layout.tsx:widgetScript.onload',
          message: 'Widget script loaded',
          data: {
            scriptSrc: widgetScript.src,
            scriptId: widgetScript.id,
            hasInitFunction: typeof window.__a11yWidgetInit === 'function'
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'D'
        };
        fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        // #endregion
        
        if (isDevelopment) {
          console.log('[A11Y Layout] Widget script loaded, initializing...')
        }
        
        // Initialize widget immediately after script loads
        // The widget exposes __a11yWidgetInit but doesn't auto-initialize
        // Wait a tiny bit to ensure the script has fully executed
        setTimeout(() => {
          // #region agent log
          const checkLog = {
            location: 'Layout.tsx:widgetScript.onload:setTimeout',
            message: 'Checking for init function after delay',
            data: {
              hasInitFunction: typeof window.__a11yWidgetInit === 'function',
              hasWidgetConfig: typeof window.__A11Y_WIDGET__ !== 'undefined',
              widgetConfig: window.__A11Y_WIDGET__ || null,
              windowKeys: Object.keys(window).filter(k => k.includes('a11y') || k.includes('A11Y') || k.includes('widget') || k.includes('Widget'))
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D'
          };
          fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(checkLog)}).catch(()=>{});
          // #endregion
          
          if (typeof window.__a11yWidgetInit === 'function') {
            try {
              // #region agent log
              const logData2 = {
                location: 'Layout.tsx:widgetScript.onload:setTimeout',
                message: 'Calling widget init function',
                data: {
                  hasInitFunction: true,
                  hasWidgetConfig: typeof window.__A11Y_WIDGET__ !== 'undefined',
                  widgetConfig: window.__A11Y_WIDGET__ || null,
                  timestamp: Date.now()
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'D'
              };
              fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
              // #endregion
              
              // Call init with config (or undefined if not set - widget handles this)
              const config = window.__A11Y_WIDGET__ || undefined;
              window.__a11yWidgetInit(config);
              
              if (isDevelopment) {
                console.log('[A11Y Layout] Widget init function called with config:', config)
              }
              
              // #region agent log
              setTimeout(() => {
                const afterInitLog = {
                  location: 'Layout.tsx:widgetScript.onload:afterInit',
                  message: 'After init call - checking widget state',
                  data: {
                    hasWidgetGlobal: typeof window.__a11yWidget !== 'undefined',
                    widgetLoaded: window.__a11yWidget?.__loaded || false,
                    hasToggleButton: !!document.getElementById('a11y-widget-toggle'),
                    hasWidgetRoot: !!document.getElementById('a11y-widget-root')
                  },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'run1',
                  hypothesisId: 'D'
                };
                fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(afterInitLog)}).catch(()=>{});
              }, 500);
              // #endregion
            } catch (error) {
              console.error('[A11Y Layout] Error initializing widget:', error);
              // #region agent log
              const logData3 = {
                location: 'Layout.tsx:widgetScript.onload:setTimeout',
                message: 'Widget init error',
                data: {
                  error: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
                  errorName: error instanceof Error ? error.name : undefined
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'D'
              };
              fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
              // #endregion
            }
          } else {
            console.warn('[A11Y Layout] Widget init function not found after script load');
            // #region agent log
            const logData4 = {
              location: 'Layout.tsx:widgetScript.onload:setTimeout',
              message: 'Widget init function not found',
              data: {
                hasInitFunction: false,
                windowKeys: Object.keys(window).filter(k => k.includes('a11y') || k.includes('A11Y') || k.includes('widget') || k.includes('Widget')),
                scriptSrc: widgetScript.src
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'D'
            };
            fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
            // #endregion
          }
        }, 100);
        
        // Give widget a moment to initialize, then start checking
        setTimeout(() => {
          // Wait for widget to initialize
          let attempts = 0
          const maxAttempts = 80 // 8 seconds max (widget needs time to initialize)
          
          const checkWidget = setInterval(() => {
            attempts++
            
            // Check if widget is loaded
            if (window.__a11yWidget?.__loaded) {
              if (isDevelopment) {
                console.log('[A11Y Layout] Widget initialized successfully (__loaded flag)')
              }
              setWidgetLoaded(true)
              clearInterval(checkWidget)
              return
            }
            
            // Also check if widget button exists in DOM (widget might be loaded but __loaded flag not set yet)
            const toggleButton = document.getElementById('a11y-widget-toggle')
            const widgetRoot = document.getElementById('a11y-widget-root')
            if (toggleButton || widgetRoot) {
              if (isDevelopment) {
                const toggleStyle = toggleButton ? window.getComputedStyle(toggleButton) : null
                console.log('[A11Y Layout] Widget elements found in DOM:', {
                  toggleButton: !!toggleButton,
                  widgetRoot: !!widgetRoot,
                  toggleDisplay: toggleStyle?.display,
                  toggleVisibility: toggleStyle?.visibility,
                  toggleOpacity: toggleStyle?.opacity,
                  hasWidgetGlobal: !!window.__a11yWidget
                })
              }
              setWidgetLoaded(true)
              clearInterval(checkWidget)
              return
            }
            
            // Timeout check
            if (attempts >= maxAttempts) {
              clearInterval(checkWidget)
              // Check one more time before showing error
              // Widget button might exist even if __loaded flag isn't set
              const finalToggleButton = document.getElementById('a11y-widget-toggle')
              const finalWidgetRoot = document.getElementById('a11y-widget-root')
              if (!window.__a11yWidget?.__loaded && !finalToggleButton && !finalWidgetRoot) {
                setWidgetError('Widget failed to initialize. Check browser console for errors.')
                console.error('[A11Y Layout] Widget initialization timeout. Check if CSS/JS loaded correctly.')
                console.error('[A11Y Layout] Debug info:', {
                  hasWidgetGlobal: !!window.__a11yWidget,
                  toggleButton: !!finalToggleButton,
                  widgetRoot: !!finalWidgetRoot,
                  scriptSrc: widgetScript.src
                })
              } else if ((finalToggleButton || finalWidgetRoot) && !window.__a11yWidget?.__loaded) {
                // Button exists but widget not fully initialized - this is OK, widget might be loading
                if (isDevelopment) {
                  console.log('[A11Y Layout] Widget elements exist but __loaded flag not set - marking as loaded')
                }
                setWidgetLoaded(true)
              }
            }
          }, 100)
        }, 500) // Wait 500ms before starting checks to give widget time to initialize
      }
      
      // Add error handler with fallback
      widgetScript.onerror = (error) => {
        console.error('[A11Y Layout] Widget script load error:', {
          widgetUrl,
          error,
          isDevelopment,
          useLocalFiles
        })
        console.warn('Failed to load widget from primary source, trying fallback...')
        // Remove failed script
        if (widgetScript.parentNode) {
          widgetScript.parentNode.removeChild(widgetScript)
        }
        
        // On Vercel, try CDN fallback if local file fails
        // Otherwise, try the configured fallback URL
        const nextFallbackUrl = isVercelDeployment && useLocalFiles
          ? WIDGET_SCRIPT_URL + '?v=' + Date.now() // Try CDN on Vercel if local fails
          : fallbackUrl
        
        // Try fallback URL
        const fallbackScript = document.createElement('script')
        fallbackScript.id = 'a11y-widget-script'
        fallbackScript.src = nextFallbackUrl
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
          setWidgetError('Failed to load widget script from both sources')
          console.error('Failed to load accessibility widget from both:', widgetUrl, 'and', fallbackUrl)
        }
        
        // Insert fallback script
        const firstScript = document.getElementsByTagName('script')[0]
        if (firstScript?.parentNode) {
          firstScript.parentNode.insertBefore(fallbackScript, firstScript)
        } else {
          document.head.appendChild(fallbackScript)
        }
      }
      
      // Insert script before first script or append to head
      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(widgetScript, firstScript)
      } else {
        document.head.appendChild(widgetScript)
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
          <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/features" className={isActive('/features') ? 'active' : ''}>Features</Link></li>
            <li><Link to="/getting-started" className={isActive('/getting-started') ? 'active' : ''}>Installation</Link></li>
            <li><Link to="/download" className={isActive('/download') ? 'active' : ''}>Download</Link></li>
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
            <Link to="/features">Features</Link>
            <Link to="/getting-started">Installation</Link>
            <Link to="/download">Download</Link>
          </div>
          <p>Accessibility Widget {WIDGET_VERSION} — WCAG 2.1 AA-aligned enhancements for supported surfaces only.</p>
        </div>
      </footer>
    </>
  )
}

