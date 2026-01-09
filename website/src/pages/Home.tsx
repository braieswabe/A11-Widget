import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

export default function Home() {
  const quickStartCode = `<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>`

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Accessibility Widget v1</h1>
          <p>WCAG 2.1 AA–aligned enhancements for your website. Easy to install, lightweight, and accessible.</p>
          <div className="hero-cta">
            <Link to="/download" className="btn btn-primary">Download Example</Link>
            <Link to="/getting-started" className="btn btn-secondary">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="demo-container">
            <h2>Try It Now</h2>
            <p>This page has the accessibility widget installed. Click the widget button in the top-right corner to adjust:</p>
            <ul>
              <li><strong>Contrast modes</strong> — Default, High contrast, Dark, Light</li>
              <li><strong>Text size</strong> — Scale from 100% to 160%</li>
              <li><strong>Text spacing</strong> — Normal, Comfortable, or Max spacing</li>
              <li><strong>Readable font</strong> — System-friendly sans-serif font</li>
              <li><strong>Reduce motion</strong> — Disable animations and transitions</li>
            </ul>
            <p>All settings persist across page reloads. Try adjusting the settings and reloading this page!</p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <h3>Visual Controls</h3>
              <p>Contrast modes, text scaling, and spacing adjustments for better readability.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⌨️</div>
              <h3>Keyboard Support</h3>
              <p>Fully keyboard navigable with visible focus indicators and screen reader support.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💾</div>
              <h3>Persistent Preferences</h3>
              <p>User preferences saved per domain using localStorage with cookie fallback.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Lightweight</h3>
              <p>No dependencies, minimal footprint, and fast loading.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Scoped Transformations</h3>
              <p>Only affects declared surfaces—no interference with your site's existing styles.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">♿</div>
              <h3>WCAG 2.1 AA</h3>
              <p>Aligned with WCAG 2.1 Level AA standards for widget and declared surfaces.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <h2 className="section-title">Quick Start</h2>
          <p className="text-center"><strong>That's it!</strong> Just add these two lines - no configuration needed:</p>
          <CodeBlock code={quickStartCode} />
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-bg-light)', borderRadius: '8px', textAlign: 'left' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>✨ Zero Configuration:</p>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Site ID auto-detected from your domain</li>
              <li>Smart defaults for all settings</li>
              <li>Works immediately - no setup required</li>
            </ul>
          </div>
          <div className="text-center" style={{ marginTop: '1.5rem' }}>
            <Link to="/getting-started" className="btn btn-primary">View Full Guide</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container container-narrow">
          <h2 className="section-title">Scope Boundaries</h2>
          <div className="card">
            <h3>What This Widget Covers</h3>
            <ul>
              <li>Widget UI accessibility</li>
              <li>Declared content surfaces (elements you specify)</li>
              <li>User preference controls</li>
              <li>Keyboard and screen reader support</li>
            </ul>
          </div>
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3>What This Widget Does Not Cover</h3>
            <ul>
              <li>Host-site HTML outside declared surfaces</li>
              <li>Third-party embeds (maps, iframes, booking engines)</li>
              <li>PDFs or downloads</li>
              <li>Full-site ADA compliance guarantee</li>
            </ul>
          </div>
          <p className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/docs#support-statement">Read the full support statement →</Link>
          </p>
        </div>
      </section>
    </>
  )
}

