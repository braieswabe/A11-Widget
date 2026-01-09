import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

export default function Examples() {
  const basicCode = `<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>`

  const advancedCode = `window.__A11Y_WIDGET__ = {
  siteId: "my-site",
  position: "left",
  surfaces: [
    "body",
    "main",
    ".content-area",
    "[data-canonical-surface='true']"
  ],
  enableTelemetry: true,
  telemetryEndpoint: "/api/telemetry",
  features: {
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

  const blogSurfaces = `surfaces: [
  "body",
  "article",
  ".post-content"
]`

  const ecommerceSurfaces = `surfaces: [
  "body",
  ".product-description",
  ".checkout-form"
]`

  const docsSurfaces = `surfaces: [
  "body",
  ".docs-content",
  ".code-examples"
]`

  const corporateSurfaces = `surfaces: [
  "body",
  "main",
  "[data-canonical-surface='true']"
]`

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Examples & Use Cases</h1>
        <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
          See the widget in action with live demonstrations and real-world examples.
        </p>

        <div className="demo-container demo-content" style={{ marginBottom: '3rem' }}>
          <h2>Live Demo</h2>
          <p>This page demonstrates the accessibility widget in action. Use the widget controls in the top-right corner to adjust:</p>
          
          <h3>Sample Content</h3>
          <p>This is a paragraph of text that will receive accessibility transforms when you adjust the widget settings. Try adjusting the contrast, text size, and spacing to see how it affects readability.</p>
          
          <h3>Form Elements</h3>
          <form className="demo-form">
            <label htmlFor="demo-name">Name:</label>
            <input type="text" id="demo-name" placeholder="Enter your name" />
            
            <label htmlFor="demo-email">Email:</label>
            <input type="email" id="demo-email" placeholder="Enter your email" />
            
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>

          <h3>Lists</h3>
          <ul>
            <li>First item in a list</li>
            <li>Second item with more text to demonstrate how spacing affects readability</li>
            <li>Third item</li>
          </ul>

          <h3>Links</h3>
          <p>Here are some <a href="#demo">example links</a> to demonstrate link styling with different contrast modes.</p>
        </div>

        <h2>Code Examples</h2>

        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--color-secondary)' }}>
          <h3>✨ Basic Implementation (Zero Config!)</h3>
          <p><strong>That's all you need!</strong> No configuration required:</p>
          <CodeBlock code={basicCode} />
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            The widget automatically detects your site and works immediately.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Advanced Configuration</h3>
          <p>Customize surfaces and features:</p>
          <CodeBlock code={advancedCode} language="javascript" />
        </div>

        <h2>Use Cases</h2>

        <div className="card-grid">
          <div className="card">
            <h3>Blog Sites</h3>
            <p>Perfect for blog content where readers need adjustable text size and spacing for comfortable reading.</p>
            <CodeBlock code={blogSurfaces} language="javascript" />
          </div>

          <div className="card">
            <h3>E-commerce</h3>
            <p>Help customers adjust product descriptions and checkout forms for better readability.</p>
            <CodeBlock code={ecommerceSurfaces} language="javascript" />
          </div>

          <div className="card">
            <h3>Documentation Sites</h3>
            <p>Make technical documentation more accessible with adjustable text and spacing.</p>
            <CodeBlock code={docsSurfaces} language="javascript" />
          </div>

          <div className="card">
            <h3>Corporate Websites</h3>
            <p>Provide accessibility controls for main content areas while preserving brand styling.</p>
            <CodeBlock code={corporateSurfaces} language="javascript" />
          </div>
        </div>

        <div className="card" style={{ marginTop: '3rem', textAlign: 'center' }}>
          <h3>Download Complete Example</h3>
          <p>Get a ready-to-use HTML file with the widget pre-installed and sample content.</p>
          <Link to="/download" className="btn btn-primary">Download Example HTML</Link>
        </div>
      </div>
    </section>
  )
}

