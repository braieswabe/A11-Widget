import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

export default function GettingStarted() {
  const canonicalCode = `<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>`

  const testCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Page</title>
  <!-- Just one line - loads everything from GitHub automatically! -->
  <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>
</head>
<body>
  <h1>Test Page</h1>
  <p>Try the accessibility widget! It loads automatically from GitHub - no files to download!</p>
</body>
</html>`

  return (
    <section className="section">
      <div className="container container-narrow">
        <h1>Installation Guide</h1>
        <p>Add the Accessibility Widget to your website with a single line of code.</p>

        <h2>Quick Installation</h2>
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--color-secondary)' }}>
          <h3>One Line Installation</h3>
          <p>Add this to your HTML <code>&lt;head&gt;</code> or before the closing <code>&lt;/body&gt;</code> tag:</p>
          <CodeBlock code={canonicalCode} />
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            ✅ No configuration needed<br/>
            ✅ Works immediately<br/>
            ✅ Auto-updates from GitHub
          </p>
        </div>

        <h2>Optional Configuration</h2>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <p>Customize widget settings (all optional):</p>
          <CodeBlock code={`<script>
  window.__A11Y_WIDGET__ = {
    position: "left",              // "left" or "right"
    surfaces: ["body", "main"]     // CSS selectors
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>`} />
        </div>

        <h2>Test It</h2>
        <div className="card">
          <p>Try it with this simple HTML:</p>
          <CodeBlock code={testCode} />
        </div>

        <div className="download-box" style={{ marginTop: '2rem' }}>
          <h3>Download Example</h3>
          <p>Get a complete HTML file with the widget pre-installed.</p>
          <Link to="/download" className="btn btn-primary download-button">Download Example HTML</Link>
        </div>
      </div>
    </section>
  )
}

