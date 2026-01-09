import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Load widget script
    if (!document.getElementById('a11y-widget-script')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/a11y-widget.css'
      document.head.appendChild(link)

      const configScript = document.createElement('script')
      configScript.textContent = `
        window.__A11Y_WIDGET__ = {
          siteId: "docs-site",
          position: "right",
          surfaces: ["body", "main"],
          enableTelemetry: false
        };
      `
      document.head.appendChild(configScript)

      const widgetScript = document.createElement('script')
      widgetScript.id = 'a11y-widget-script'
      widgetScript.src = '/a11y-widget.js'
      widgetScript.defer = true
      document.body.appendChild(widgetScript)
    }
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
            <li><Link to="/getting-started" className={isActive('/getting-started') ? 'active' : ''}>Getting Started</Link></li>
            <li><Link to="/tutorials" className={isActive('/tutorials') ? 'active' : ''}>Tutorials</Link></li>
            <li><Link to="/examples" className={isActive('/examples') ? 'active' : ''}>Examples</Link></li>
            <li><Link to="/download" className={isActive('/download') ? 'active' : ''}>Download</Link></li>
            <li><Link to="/docs" className={isActive('/docs') ? 'active' : ''}>Documentation</Link></li>
          </ul>
        </nav>
      </header>

      <main className="demo-content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <Link to="/getting-started">Getting Started</Link>
            <Link to="/tutorials">Tutorials</Link>
            <Link to="/examples">Examples</Link>
            <Link to="/download">Download</Link>
            <Link to="/docs">Documentation</Link>
          </div>
          <p>Accessibility Widget v1 — WCAG 2.1 AA-aligned enhancements for supported surfaces only.</p>
        </div>
      </footer>
    </>
  )
}

