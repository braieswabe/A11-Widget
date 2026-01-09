import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

export default function Download() {
  const configCode = `window.__A11Y_WIDGET__ = {
  siteId: "example-site",
  position: "right",
  surfaces: ["body", "main"],
  enableTelemetry: false
};`

  const localPathsCode = `<!-- If widget files are in same directory -->
<link rel="stylesheet" href="a11y-widget.css" />
<script src="a11y-widget.js" defer></script>

<!-- Or use CDN paths -->
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>`

  return (
    <section className="section">
      <div className="container container-narrow">
        <h1 className="section-title">Download Example HTML</h1>
        <p className="text-center">Get a complete, ready-to-use HTML file with the Accessibility Widget v1 pre-installed.</p>

        <div className="download-box">
          <h3>Example HTML File</h3>
          <p>A complete HTML page with:</p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '1rem auto' }}>
            <li>Widget pre-installed and configured</li>
            <li>Sample content demonstrating all features</li>
            <li>Form elements, links, and headings</li>
            <li>Comments explaining configuration</li>
            <li>Ready to open in any browser</li>
          </ul>
          <a 
            href="/downloads/example.html" 
            download="a11y-widget-example.html" 
            className="btn btn-primary download-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download example.html
          </a>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            File size: ~8 KB | Last updated: Today
          </p>
        </div>

        <h2>What's Included</h2>

        <div className="card">
          <h3>Pre-Configured Widget</h3>
          <p>The widget is already installed with sensible defaults:</p>
          <CodeBlock code={configCode} language="javascript" />
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Sample Content</h3>
          <p>The example includes various content types to demonstrate widget features:</p>
          <ul>
            <li>Headings (h1-h3)</li>
            <li>Paragraphs with different lengths</li>
            <li>Lists (ordered and unordered)</li>
            <li>Form elements (inputs, buttons)</li>
            <li>Links</li>
            <li>Code blocks</li>
          </ul>
        </div>

        <h2>How to Use</h2>

        <div className="card">
          <h3>Step 1: Download</h3>
          <p>Click the download button above to get the example.html file.</p>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Step 2: Place Widget Files</h3>
          <p>Ensure <code>a11y-widget.js</code> and <code>a11y-widget.css</code> are in the same directory as the example file, or update the paths in the HTML.</p>
          <CodeBlock code={localPathsCode} />
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Step 3: Open in Browser</h3>
          <p>Simply open <code>example.html</code> in any modern web browser. The widget will load automatically.</p>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Step 4: Customize</h3>
          <p>Edit the configuration to match your needs:</p>
          <ul>
            <li>Change <code>siteId</code> to your site identifier</li>
            <li>Adjust <code>surfaces</code> to match your HTML structure</li>
            <li>Modify <code>position</code> if you prefer left-side placement</li>
            <li>Enable <code>telemetry</code> if you have a backend endpoint</li>
          </ul>
        </div>

        <h2>Next Steps</h2>

        <div className="card-grid">
          <div className="card">
            <h3>Installation Guide</h3>
            <p>Learn how to install the widget on your website.</p>
            <Link to="/getting-started" className="btn btn-secondary">Getting Started</Link>
          </div>
          <div className="card">
            <h3>Platform Tutorials</h3>
            <p>Find platform-specific installation instructions.</p>
            <Link to="/tutorials" className="btn btn-secondary">View Tutorials</Link>
          </div>
          <div className="card">
            <h3>Documentation</h3>
            <p>Read the complete API reference and configuration options.</p>
            <Link to="/docs" className="btn btn-secondary">View Docs</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

