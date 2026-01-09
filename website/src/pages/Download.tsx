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
        <h1 className="section-title">Download Example</h1>
        <p className="text-center">Get a ready-to-use HTML file with the widget pre-installed.</p>

        <div className="download-box">
          <h3>Example HTML File</h3>
          <p>Complete HTML page with widget installed and sample content.</p>
          <a 
            href="/downloads/example.html" 
            download="a11y-widget-example.html" 
            className="btn btn-primary download-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download example.html
          </a>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>How to Use</h3>
          <ol style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
            <li>Download the example.html file</li>
            <li>Open it in any web browser</li>
            <li>The widget loads automatically from GitHub</li>
            <li>Try the accessibility controls!</li>
          </ol>
        </div>

        <div className="text-center" style={{ marginTop: '2rem' }}>
          <Link to="/getting-started" className="btn btn-secondary">View Installation Guide</Link>
        </div>
      </div>
    </section>
  )
}

