import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import { WIDGET_VERSION, WIDGET_LOADER_URL } from '../constants'
import './Pages.css'

export default function Home() {
  const quickStartCode = `<script src="${WIDGET_LOADER_URL}" defer></script>`

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Accessibility Widget v1</h1>
          <p>WCAG 2.1 AA–aligned enhancements for your website. One line to install.</p>
          <div style={{ 
            marginTop: '1rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: 'var(--color-secondary, #007bff)',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '600',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              Current Version: {WIDGET_VERSION}
            </span>
          </div>
          <div className="hero-cta">
            <Link to="/download" className="btn btn-primary">Download Example</Link>
            <Link to="/getting-started" className="btn btn-secondary">Installation Guide</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <h2 className="section-title">Installation</h2>
          <p className="text-center">Add this single line to your HTML:</p>
          <CodeBlock code={quickStartCode} />
          <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
            No configuration needed. The widget loads automatically and works immediately.
          </p>
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/getting-started" className="btn btn-primary">View Installation Guide</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <h3>Visual Controls</h3>
              <p>Contrast, text size, spacing, and readable fonts.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Lightweight</h3>
              <p>No dependencies, minimal footprint.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">♿</div>
              <h3>WCAG 2.1 AA</h3>
              <p>Aligned with accessibility standards.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

