import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

export default function Docs() {
  const configCode = `window.__A11Y_WIDGET__ = {
  siteId: "string",              // Required: Site identifier
  position: "left" | "right",     // Widget position (default: "right")
  surfaces: ["string"],           // CSS selectors for surfaces (default: ["body"])
  enableTelemetry: boolean,       // Enable telemetry (default: false)
  telemetryEndpoint: "string",    // Backend endpoint (default: null)
  zIndex: number,                 // Widget z-index (default: 2147483000)
  initialOpen: boolean,           // Open on load (default: false)
  locale: "string",               // Locale (default: "en")
  features: {                     // Feature flags
    contrast: boolean,
    fontScale: boolean,
    spacing: boolean,
    reduceMotion: boolean,
    readableFont: boolean,
    presets: boolean,
    reset: boolean,
    skipLink: boolean
  }
};`

  const apiCode = `// Get current preferences
var prefs = window.__a11yWidget.getPrefs();

// Set preferences programmatically
window.__a11yWidget.setPrefs({
  contrast: "high",
  fontScale: 1.4
});

// Reset to defaults
window.__a11yWidget.reset();

// Get configuration
var config = window.__a11yWidget.config;`

  const eventCode = `window.addEventListener('a11yWidget:event', function(e) {
  console.log('Widget event:', e.detail);
  // e.detail contains: { event, siteId, ts, ...payload }
});`

  const telemetryCode = `POST /api/telemetry
Content-Type: application/json

{
  "siteId": "your-site-id",
  "event": "widget_open",
  "payload": {},
  "url": "https://example.com/page",
  "userAgent": "Mozilla/5.0..."
}`

  return (
    <section className="section">
      <div className="container container-narrow">
        <h1>Documentation</h1>
        <p>Complete reference documentation for Accessibility Widget v1.</p>

        <h2 id="api-reference">API Reference</h2>

        <div className="card">
          <h3>Configuration Options</h3>
          <p>All configuration is via <code>window.__A11Y_WIDGET__</code> object:</p>
          <CodeBlock code={configCode} language="javascript" />
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Global API</h3>
          <p>After the widget loads, access it via <code>window.__a11yWidget</code>:</p>
          <CodeBlock code={apiCode} language="javascript" />
        </div>

        <h2 id="telemetry">Telemetry</h2>

        <div className="card">
          <h3>Events</h3>
          <p>If <code>enableTelemetry: true</code>, the widget emits these events:</p>
          <ul>
            <li><code>widget_open</code> — Widget panel opened</li>
            <li><code>setting_change</code> — User changed a setting</li>
            <li><code>reset</code> — User reset preferences</li>
            <li><code>widget_close</code> — Widget panel closed</li>
          </ul>
          <p>Events include: <code>siteId</code>, <code>event</code>, <code>payload</code>, <code>url</code>, <code>userAgent</code> (no PII).</p>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Client-Side Listeners</h3>
          <p>Listen for events via CustomEvent:</p>
          <CodeBlock code={eventCode} language="javascript" />
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Backend Endpoint</h3>
          <p>If <code>telemetryEndpoint</code> is set, events are POSTed to your backend:</p>
          <CodeBlock code={telemetryCode} />
        </div>

        <h2 id="wcag-coverage">WCAG 2.1 AA Coverage</h2>

        <div className="card">
          <p><strong>Scope:</strong> Widget UI + declared surfaces only</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Criterion</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Level</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Covered</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>1.4.3 Contrast (Minimum)</td>
                <td style={{ padding: '0.5rem' }}>AA</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>1.4.4 Resize text</td>
                <td style={{ padding: '0.5rem' }}>AA</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>1.4.10 Reflow</td>
                <td style={{ padding: '0.5rem' }}>AA</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>1.4.12 Text spacing</td>
                <td style={{ padding: '0.5rem' }}>AA</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>2.1.1 Keyboard</td>
                <td style={{ padding: '0.5rem' }}>A</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>2.4.1 Bypass blocks</td>
                <td style={{ padding: '0.5rem' }}>A</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>2.4.7 Focus visible</td>
                <td style={{ padding: '0.5rem' }}>AA</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>3.2.3 Consistent navigation</td>
                <td style={{ padding: '0.5rem' }}>AA</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>3.3.2 Labels/instructions</td>
                <td style={{ padding: '0.5rem' }}>A</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem' }}>4.1.2 Name, role, value</td>
                <td style={{ padding: '0.5rem' }}>A</td>
                <td style={{ padding: '0.5rem' }}>✅</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: '1rem' }}>
            <a href="../wcag-matrix.md" target="_blank" rel="noopener noreferrer">View detailed WCAG coverage matrix →</a>
          </p>
        </div>

        <h2 id="support-statement">Support Statement</h2>

        <div className="card">
          <h3>What This Widget Covers</h3>
          <ul>
            <li>Widget UI accessibility</li>
            <li>Declared content surfaces (elements you specify)</li>
            <li>User preference controls</li>
            <li>Keyboard and screen reader support</li>
            <li>Preference persistence</li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>What This Widget Does Not Cover</h3>
          <ul>
            <li>Host-site HTML outside declared surfaces</li>
            <li>Third-party embeds (maps, iframes, booking engines)</li>
            <li>PDFs or downloads</li>
            <li>Full-site ADA compliance guarantee</li>
            <li>Lawsuit protection or legal assurance</li>
          </ul>
        </div>

        <p style={{ marginTop: '2rem' }}>
          <a href="../support-statement.md" target="_blank" rel="noopener noreferrer">Read the full support statement →</a>
        </p>

        <h2>Additional Resources</h2>

        <div className="card-grid">
          <div className="card">
            <h3>Developer Guide</h3>
            <p>Architecture, code structure, and contributing guidelines.</p>
            <a href="../docs/DEVELOPER.md" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Guide</a>
          </div>

          <div className="card">
            <h3>Acceptance Tests</h3>
            <p>Complete test checklist for keyboard, screen reader, and visual tests.</p>
            <a href="../docs/ACCEPTANCE_TESTS.md" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Tests</a>
          </div>

          <div className="card">
            <h3>Review & Testing</h3>
            <p>How to review the code and test the widget on your website.</p>
            <a href="../docs/REVIEW_AND_TESTING.md" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Guide</a>
          </div>
        </div>

        <h2>Quick Links</h2>

        <div className="card">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '0.5rem 0' }}><Link to="/getting-started">→ Getting Started Guide</Link></li>
            <li style={{ margin: '0.5rem 0' }}><Link to="/tutorials">→ Platform-Specific Tutorials</Link></li>
            <li style={{ margin: '0.5rem 0' }}><Link to="/examples">→ Live Examples</Link></li>
            <li style={{ margin: '0.5rem 0' }}><Link to="/download">→ Download Example HTML</Link></li>
            <li style={{ margin: '0.5rem 0' }}><a href="../DEPLOYMENT.md" target="_blank" rel="noopener noreferrer">→ Deployment Guide</a></li>
            <li style={{ margin: '0.5rem 0' }}><a href="../README.md" target="_blank" rel="noopener noreferrer">→ README</a></li>
          </ul>
        </div>
      </div>
    </section>
  )
}

