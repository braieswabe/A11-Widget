import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import { WIDGET_LOADER_URL, WIDGET_VERSION } from '../constants'
import './Pages.css'

export default function GettingStarted() {
  const canonicalCode = `<script src="${WIDGET_LOADER_URL}" defer></script>`

  const testCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Page</title>
  <!-- Just one line - loads everything from GitHub automatically! -->
  <script src="${WIDGET_LOADER_URL}" defer></script>
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
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
          All snippets on this site load the current <strong>{WIDGET_VERSION}</strong> widget files from GitHub/jsDelivr (same as the demo widget in the site header).
        </p>

        <h2>Quick Installation</h2>
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--color-secondary)' }}>
          <h3>One Line Installation</h3>
          <p>Add this to your HTML <code>&lt;head&gt;</code> or before the closing <code>&lt;/body&gt;</code> tag:</p>
          <CodeBlock code={canonicalCode} />
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            ✅ No configuration needed<br/>
            ✅ Works immediately<br/>
            ✅ Loads the {WIDGET_VERSION} widget files from jsDelivr/GitHub
          </p>
        </div>

        <h2>Optional Configuration</h2>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <p>Configure surfaces and optional backend tracking. If you set <code>telemetryEndpoint</code>, the widget derives heartbeat, error, support, and translation endpoints from the same backend.</p>
          <CodeBlock code={`<script>
  window.__A11Y_WIDGET__ = {
    siteId: "example.com",
    apiKey: "YOUR_CLIENT_API_KEY",
    position: "left",              // "left" or "right"
    surfaces: ["body", "main"],    // CSS selectors
    telemetryEndpoint: "https://your-widget-backend.com/api/telemetry"
  };
</script>
<script src="${WIDGET_LOADER_URL}" defer></script>`} />
        </div>

        <h2>Authorized Monitoring Setup</h2>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <p>Heartbeat tracking, widget error logs, visitor support cases, and translation use database-backed API validation. Complete these steps before installing the monitored snippet on a production site:</p>
          <ol>
            <li>Log in as an employee/admin and open the client or domain management area.</li>
            <li>Create or select the client record and copy the client API key.</li>
            <li>Add each allowed production domain without protocol, for example <code>example.com</code> and <code>www.example.com</code>.</li>
            <li>Use the assigned <code>siteId</code> in the widget config and include the copied <code>apiKey</code>.</li>
            <li>Set <code>telemetryEndpoint</code> to this backend&apos;s <code>/api/telemetry</code> URL. Heartbeat, error, support, and translation endpoints are derived automatically.</li>
          </ol>
          <p style={{ marginBottom: 0 }}>Local development origins such as <code>localhost</code> and <code>127.0.0.1</code> can use logging endpoints for testing. Real deployed domains still require a registered domain or valid API/license key.</p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Manage Tool Order</h3>
          <p>Open the widget and click <strong>Tools</strong> in the panel header to move controls up/down or hide/show unused tools. The Support button always stays available.</p>
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
