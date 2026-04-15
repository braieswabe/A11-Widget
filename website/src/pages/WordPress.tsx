import { useState } from 'react'
import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import { WIDGET_LOADER_URL } from '../constants'
import './Pages.css'

const steps = [
  {
    number: 1,
    title: 'Install WPCode Plugin',
    content: `Go to your WordPress admin dashboard. Navigate to Plugins → Add New and search for "WPCode". Install and activate the WPCode – Insert Headers and Footers + Custom Code Snippets plugin by WPCode.`,
    substeps: [
      'Log in to your WordPress admin (yourdomain.com/wp-admin)',
      'Go to Plugins → Add New',
      'Search for "WPCode"',
      'Click Install Now on "WPCode – Insert Headers and Footers + Custom Code Snippets"',
      'Click Activate'
    ]
  },
  {
    number: 2,
    title: 'Open WPCode Header & Footer Settings',
    content: 'Once WPCode is activated, navigate to the Header & Footer settings where you can inject scripts site-wide.',
    substeps: [
      'In your WordPress admin sidebar, click Code Snippets → Header & Footer',
      'You will see three sections: Header, Body, and Footer',
      'We will paste the widget code in the Header section'
    ]
  },
  {
    number: 3,
    title: 'Paste the Widget Script',
    content: 'Copy the one-line script tag below and paste it into the Header section of WPCode. This single line loads the entire widget automatically from the CDN.',
    code: `<script src="${WIDGET_LOADER_URL}" defer></script>`,
    substeps: [
      'Copy the script tag above (click the Copy button)',
      'Paste it into the Header section in WPCode',
      'Click Save Changes'
    ]
  },
  {
    number: 4,
    title: 'Clear Your Cache',
    content: 'If you use any caching plugin (WP Super Cache, W3 Total Cache, LiteSpeed Cache, WP Rocket, etc.), clear your cache so the new script is served to visitors.',
    substeps: [
      'Go to your caching plugin settings',
      'Click Purge / Clear All Cache',
      'If using a CDN like Cloudflare, purge the CDN cache as well'
    ]
  },
  {
    number: 5,
    title: 'Verify the Widget',
    content: 'Open your website in a new browser tab (or incognito window). You should see the accessibility widget button appear in the bottom-right corner of the page.',
    substeps: [
      'Open your site in a new tab or incognito window',
      'Look for the accessibility icon (bottom-right corner by default)',
      'Click it to open the accessibility panel',
      'Try pressing Alt + A (Option + A on Mac) to toggle the widget via keyboard'
    ]
  }
]

export default function WordPress() {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const customConfigCode = `<script>
  window.__A11Y_WIDGET__ = {
    siteId: "yourdomain.com",
    position: "right",
    keyboardShortcut: "Alt+A",
    surfaces: [
      "body",
      "main",
      ".entry-content",
      ".wp-block-post-content"
    ]
  };
</script>
<script src="${WIDGET_LOADER_URL}" defer></script>`

  const globalModeCode = `<script>
  window.__A11Y_WIDGET__ = {
    siteId: "yourdomain.com",
    position: "right",
    globalMode: true
  };
</script>
<script src="${WIDGET_LOADER_URL}" defer></script>`

  const telemetryCode = `<script>
  window.__A11Y_WIDGET__ = {
    siteId: "yourdomain.com",
    position: "right",
    enableTelemetry: true,
    telemetryEndpoint: "https://your-backend.com/api/telemetry",
    surfaces: [
      "body",
      "main",
      ".entry-content",
      ".wp-block-post-content"
    ]
  };
</script>
<script src="${WIDGET_LOADER_URL}" defer></script>`

  return (
    <section className="section">
      <div className="container container-narrow">

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            <span role="img" aria-label="WordPress">🔌</span>
          </div>
          <h1>Install on WordPress</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', maxWidth: '600px', margin: '0 auto' }}>
            Add the Accessibility Widget to any WordPress site in under 5 minutes using the free WPCode plugin. No coding experience required.
          </p>
        </div>

        {/* Prerequisites */}
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-secondary)' }}>
          <h3 style={{ marginTop: 0 }}>Before You Start</h3>
          <ul style={{ marginBottom: 0 }}>
            <li>WordPress admin access (Administrator role)</li>
            <li>Ability to install plugins on your WordPress site</li>
            <li>5 minutes of your time</li>
          </ul>
        </div>

        {/* Compatibility */}
        <div className="card" style={{ marginBottom: '3rem', background: 'var(--color-bg-light)' }}>
          <h3 style={{ marginTop: 0 }}>Compatibility</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>WordPress</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>5.0+ (Classic & Block Editor)</p>
            </div>
            <div>
              <strong>PHP</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>7.4+ (any modern host)</p>
            </div>
            <div>
              <strong>Themes</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>All themes supported</p>
            </div>
            <div>
              <strong>Multisite</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Supported (network activate or per-site)</p>
            </div>
          </div>
        </div>

        {/* Step-by-step */}
        <h2>Step-by-Step Installation</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--color-text-light)' }}>
          Follow these 5 steps to get the accessibility widget running on your WordPress site.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          {steps.map((step) => (
            <div
              key={step.number}
              className="card"
              style={{
                cursor: 'pointer',
                borderLeft: activeStep === step.number ? '4px solid var(--color-secondary)' : '4px solid transparent',
                transition: 'border-color 0.2s'
              }}
              onClick={() => setActiveStep(activeStep === step.number ? null : step.number)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  flexShrink: 0,
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: activeStep === step.number ? 'var(--color-secondary)' : 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  transition: 'background 0.2s'
                }}>
                  {step.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{step.title}</h3>
                    <span style={{
                      fontSize: '1.25rem',
                      transform: activeStep === step.number ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: 'var(--color-text-light)'
                    }}>
                      ▾
                    </span>
                  </div>
                  <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                    {step.content}
                  </p>

                  {activeStep === step.number && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                      {step.code && (
                        <div style={{ marginBottom: '1.25rem' }}>
                          <CodeBlock code={step.code} language="html" />
                        </div>
                      )}
                      <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                        {step.substeps.map((sub, i) => (
                          <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}>{sub}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success */}
        <div className="card" style={{
          marginBottom: '3rem',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '2px solid #86efac',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#166534' }}>That's It!</h3>
          <p style={{ margin: 0, color: '#166534' }}>
            Your WordPress site now has a fully functional WCAG 2.1 AA-aligned accessibility widget.
            Visitors can adjust text size, contrast, spacing, and more.
          </p>
        </div>

        {/* Advanced Configuration */}
        <h2>Advanced Configuration (Optional)</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--color-text-light)' }}>
          The widget works with zero configuration, but you can customize it for your WordPress site.
          Add the configuration script <strong>before</strong> the loader script in WPCode's Header section.
        </p>

        {/* Custom surfaces config */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Custom Configuration</h3>
          <p>Target specific WordPress content areas and set your site ID:</p>
          <CodeBlock code={customConfigCode} language="html" />
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            <strong>WordPress surfaces explained:</strong>
            <ul style={{ marginTop: '0.5rem' }}>
              <li><code>.entry-content</code> — Classic editor post/page content</li>
              <li><code>.wp-block-post-content</code> — Block editor (Gutenberg) content</li>
              <li><code>main</code> — Main content area in most themes</li>
              <li><code>body</code> — Entire page (broadest scope)</li>
            </ul>
          </div>
        </div>

        {/* Global mode */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Global Mode (Full Site Transformation)</h3>
          <p>Apply accessibility transforms to your entire WordPress site — fonts, colors, spacing, everything:</p>
          <CodeBlock code={globalModeCode} language="html" />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            When <code>globalMode</code> is enabled, the <code>surfaces</code> setting is ignored — all elements are transformed.
          </p>
        </div>

        {/* Telemetry */}
        <div className="card" style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginTop: 0 }}>Enable Usage Tracking</h3>
          <p>Track how visitors use accessibility features (no personal data collected):</p>
          <CodeBlock code={telemetryCode} language="html" />
        </div>

        {/* Troubleshooting */}
        <h2>Troubleshooting</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div className="card">
            <h4 style={{ marginTop: 0, color: 'var(--color-secondary)' }}>Widget Not Appearing</h4>
            <ol>
              <li>Clear your WordPress cache (WP Super Cache, W3 Total Cache, LiteSpeed, WP Rocket, etc.)</li>
              <li>Clear your browser cache or try an incognito window</li>
              <li>Open browser DevTools (F12) → Console tab and look for errors</li>
              <li>Check Network tab to verify <code>a11y-widget-loader</code> script loads (status 200)</li>
              <li>Temporarily switch to a default theme (Twenty Twenty-Four) to rule out theme conflicts</li>
            </ol>
          </div>

          <div className="card">
            <h4 style={{ marginTop: 0, color: 'var(--color-secondary)' }}>Script Blocked by Security Plugin</h4>
            <p>
              Plugins like Wordfence, Sucuri, or iThemes Security may block external scripts.
              Whitelist these domains in your security plugin:
            </p>
            <ul>
              <li><code>cdn.jsdelivr.net</code></li>
              <li><code>raw.githubusercontent.com</code></li>
            </ul>
          </div>

          <div className="card">
            <h4 style={{ marginTop: 0, color: 'var(--color-secondary)' }}>Widget Overlaps Theme Elements</h4>
            <p>If the widget button overlaps your theme's chat widget or floating elements, adjust the position:</p>
            <CodeBlock code={`<script>
  window.__A11Y_WIDGET__ = {
    position: "left"  // Move to left side
  };
</script>
<script src="${WIDGET_LOADER_URL}" defer></script>`} language="html" />
          </div>

          <div className="card">
            <h4 style={{ marginTop: 0, color: 'var(--color-secondary)' }}>Widget Styles Conflict with Theme</h4>
            <p>
              The widget uses scoped CSS under <code>#a11y-widget-root</code>, so conflicts are rare.
              If you notice style issues, check if your theme applies aggressive global resets.
              The widget's <code>z-index</code> is very high (<code>2147483000</code>) by default.
            </p>
          </div>

          <div className="card">
            <h4 style={{ marginTop: 0, color: 'var(--color-secondary)' }}>Caching Plugin Tips</h4>
            <p>
              The widget loads client-side via JavaScript, so server-side caching generally doesn't affect it.
              However, if your caching plugin minifies or combines JavaScript, exclude the widget script:
            </p>
            <ul>
              <li><strong>Autoptimize</strong>: Add <code>a11y-widget</code> to "Exclude scripts"</li>
              <li><strong>WP Rocket</strong>: Add <code>cdn.jsdelivr.net</code> to "Excluded External JavaScript"</li>
              <li><strong>LiteSpeed Cache</strong>: Add <code>a11y-widget</code> to "JS Excludes"</li>
            </ul>
          </div>
        </div>

        {/* What You Get */}
        <h2>What Your Visitors Get</h2>
        <div className="card-grid" style={{ marginBottom: '3rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔤</div>
            <h4 style={{ marginTop: 0 }}>Text Controls</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
              Adjust text size (100%–160%), readable fonts, and text spacing
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
            <h4 style={{ marginTop: 0 }}>Contrast Modes</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
              High contrast, dark theme, and light theme options
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⌨️</div>
            <h4 style={{ marginTop: 0 }}>Keyboard Access</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
              Full keyboard navigation and Alt+A shortcut
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗣️</div>
            <h4 style={{ marginTop: 0 }}>Screen Readers</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
              ARIA live regions, proper roles, and state announcements
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
            <h4 style={{ marginTop: 0 }}>Smart Presets</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
              One-click profiles for low vision, dyslexia, reduced motion, and more
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💾</div>
            <h4 style={{ marginTop: 0 }}>Persistent Settings</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
              Preferences saved automatically and restored on return visits
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="download-box">
          <h3>Need Help?</h3>
          <p>Check the full documentation or explore other installation methods.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link to="/getting-started" className="btn btn-primary">General Installation Guide</Link>
            <Link to="/features" className="btn btn-secondary">View All Features</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
