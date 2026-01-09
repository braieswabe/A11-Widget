import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

export default function GettingStarted() {
  const canonicalCode = `<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "YOUR_SITE_ID",
    position: "right",
    surfaces: ["body"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>`

  const cspCode = `<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script
  src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
  data-site-id="YOUR_SITE_ID"
  data-position="right"
  data-surfaces="body"
  defer
></script>`

  const configCode = `window.__A11Y_WIDGET__ = {
  siteId: "your-site-id",        // Required: Site identifier
  position: "right",              // Widget position: "left" or "right"
  surfaces: ["body"],            // CSS selectors for surfaces to transform
  enableTelemetry: false,        // Enable telemetry events
  zIndex: 2147483000,            // Widget z-index
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
  <link rel="stylesheet" href="a11y-widget.css" />
  <script>
    window.__A11Y_WIDGET__ = {
      siteId: "test",
      surfaces: ["body"]
    };
  </script>
  <script src="a11y-widget.js" defer></script>
</head>
<body>
  <h1>Test Page</h1>
  <p>Try the accessibility widget!</p>
</body>
</html>`

  return (
    <section className="section">
      <div className="container container-narrow">
        <h1>Getting Started</h1>
        <p>Install the Accessibility Widget v1 on your website in minutes. Choose the installation method that works best for your setup.</p>

        <h2>Installation Methods</h2>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Method 1: Canonical Installation (Recommended)</h3>
          <p>Add the widget code to your HTML <code>&lt;head&gt;</code> or before <code>&lt;/body&gt;</code>:</p>
          <CodeBlock code={canonicalCode} />
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Method 2: CSP-Friendly Installation</h3>
          <p>If your Content Security Policy blocks inline scripts, use data attributes:</p>
          <CodeBlock code={cspCode} />
        </div>

        <h2>Configuration</h2>

        <div className="card">
          <h3>Basic Configuration</h3>
          <p>The widget accepts these configuration options:</p>
          <CodeBlock code={configCode} language="javascript" />
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

