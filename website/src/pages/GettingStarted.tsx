import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

export default function GettingStarted() {
  const canonicalCode = `<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>`

  const cspCode = `<script
  src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js"
  defer
></script>`

  const configCode = `// Optional: Customize widget settings
window.__A11Y_WIDGET__ = {
  position: "right",              // Widget position: "left" or "right"
  surfaces: ["body", "main"],    // CSS selectors for surfaces to transform
  initialOpen: false,            // Open widget on page load
  features: {                    // Feature flags
    contrast: true,
    fontScale: true,
    spacing: true,
    reduceMotion: true,
    readableFont: true,
    presets: true,
    reset: true,
    skipLink: true
  }
};`

  const surfacesCode = `surfaces: [
  "body",                              // All body content
  "main",                              // Main content area
  ".content",                          // Content wrapper class
  "[data-canonical-surface='true']"    // Custom attribute
]`

  const testCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Page</title>
  <!-- Just one line - loads everything from GitHub automatically! -->
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
</head>
<body>
  <h1>Test Page</h1>
  <p>Try the accessibility widget! It loads automatically from GitHub - no files to download!</p>
</body>
</html>`

  return (
    <section className="section">
      <div className="container container-narrow">
        <h1>Getting Started</h1>
        <p>Install the Accessibility Widget v1 on your website in minutes. Choose the installation method that works best for your setup.</p>

        <h2>Installation Methods</h2>

        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--color-secondary)' }}>
          <h3>✨ Super Simple Installation (No Configuration Needed!)</h3>
          <p><strong>Just add these two lines and you're done!</strong> The widget automatically detects your site and works immediately:</p>
          <CodeBlock code={canonicalCode} />
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            ✅ No siteId needed - auto-detected from your domain<br/>
            ✅ No configuration required - smart defaults<br/>
            ✅ Works immediately - just include the files
          </p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Optional: Customize Settings</h3>
          <p>If you want to customize the widget, add optional configuration before the loader script:</p>
          <CodeBlock code={`<script>
  window.__A11Y_WIDGET__ = {
    position: "left",              // Optional: "left" or "right"
    surfaces: ["body", "main"]     // Optional: CSS selectors
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>`} />
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>CSP-Friendly Installation</h3>
          <p>If your Content Security Policy blocks inline scripts, use data attributes (still no siteId needed!):</p>
          <CodeBlock code={cspCode} />
        </div>

        <h2>Configuration</h2>

        <div className="card">
          <h3>Optional Configuration</h3>
          <p><strong>All configuration is optional!</strong> The widget works with zero configuration. Only add these if you want to customize:</p>
          <CodeBlock code={configCode} language="javascript" />
          <p style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg-light)', borderRadius: '4px', fontSize: '0.875rem' }}>
            <strong>💡 Pro Tip:</strong> The widget automatically detects your siteId from <code>window.location.hostname</code>, so you never need to set it manually!
          </p>
        </div>

        <h2>Surface Scoping</h2>
        <p>The widget only applies transforms to elements you declare in the <code>surfaces</code> array. Those elements will receive the <code>data-a11y-surface="true"</code> attribute.</p>

        <div className="card">
          <h3>Example: Multiple Surfaces</h3>
          <CodeBlock code={surfacesCode} language="javascript" />
        </div>

        <h2>Quick Test</h2>
        <p>Test the widget locally with this simple HTML:</p>
        <CodeBlock code={testCode} />

        <div className="download-box">
          <h3>Ready-to-Use Example</h3>
          <p>Download a complete HTML file with the widget pre-installed and sample content.</p>
          <Link to="/download" className="btn btn-primary download-button">Download Example HTML</Link>
        </div>

        <h2>Next Steps</h2>
        <div className="card-grid">
          <div className="card">
            <h3>Platform-Specific Guides</h3>
            <p>Installation instructions for WordPress, Next.js, React, Shopify, and more.</p>
            <Link to="/tutorials" className="btn btn-secondary">View Tutorials</Link>
          </div>
          <div className="card">
            <h3>Examples & Demos</h3>
            <p>See the widget in action with live examples and use cases.</p>
            <Link to="/examples" className="btn btn-secondary">View Examples</Link>
          </div>
          <div className="card">
            <h3>Full Documentation</h3>
            <p>Complete API reference, configuration options, and developer guide.</p>
            <Link to="/docs" className="btn btn-secondary">View Docs</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

