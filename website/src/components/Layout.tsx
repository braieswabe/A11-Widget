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
    // Load widget from GitHub CDN - updates automatically propagate to all users!
    // This ensures all existing integrations get updates automatically
    if (!document.getElementById('a11y-widget-loader')) {
      const loaderScript = document.createElement('script')
      loaderScript.id = 'a11y-widget-loader'
      loaderScript.src = 'https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js'
      loaderScript.defer = true
      document.head.appendChild(loaderScript)
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
            <li><Link to="/getting-started" className={isActive('/getting-started') ? 'active' : ''}>Installation</Link></li>
            <li><Link to="/download" className={isActive('/download') ? 'active' : ''}>Download</Link></li>
          </ul>
        </nav>
      </header>

      <main className="demo-content">
        {children}
      </main>

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

