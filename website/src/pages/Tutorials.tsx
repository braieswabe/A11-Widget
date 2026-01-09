import { useState } from 'react'
import { Link } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import './Pages.css'

interface Tutorial {
  title: string
  time: string
  difficulty: string
  description: string
  steps: Array<{ title: string; content: string; code?: string }>
}

const tutorials: Tutorial[] = [
  {
    title: 'Static HTML',
    time: '5 min',
    difficulty: 'Easy',
    description: 'Installation guide for static HTML sites and custom-built websites. Perfect for simple sites or when you have direct HTML access.',
    steps: [
      {
        title: 'Add Widget Code',
        content: 'Add the widget code before </head> or before </body>:',
        code: `<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "YOUR_SITE_ID",
    position: "right",
    surfaces: ["body"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>`
      },
      {
        title: 'Configure Surfaces',
        content: 'Specify which elements should receive accessibility transforms:',
        code: `surfaces: ["body", "main", ".content"]`
      }
    ]
  },
  {
    title: 'WordPress',
    time: '10 min',
    difficulty: 'Easy',
    description: 'Multiple installation methods for WordPress: plugins, theme files, or custom plugins. Includes caching considerations.',
    steps: [
      {
        title: 'Method 1: Theme Functions',
        content: 'Add to your theme\'s functions.php:',
        code: `function add_a11y_widget() {
  ?>
  <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
  <script>
    window.__A11Y_WIDGET__ = {
      siteId: "YOUR_SITE_ID",
      surfaces: ["body"]
    };
  </script>
  <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
  <?php
}
add_action('wp_head', 'add_a11y_widget');`
      },
      {
        title: 'Method 2: Plugin',
        content: 'Create a simple plugin or use a code snippet plugin like Code Snippets.'
      }
    ]
  },
  {
    title: 'Next.js',
    time: '10 min',
    difficulty: 'Medium',
    description: 'Installation for Next.js App Router and Pages Router. Includes SSR considerations and TypeScript types.',
    steps: [
      {
        title: 'App Router (_app.tsx or layout.tsx)',
        content: 'Add to your root layout:',
        code: `import Script from 'next/script'
import Head from 'next/head'

export default function RootLayout({ children }) {
  return (
    <html>
      <Head>
        <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
      </Head>
      <body>
        {children}
        <Script id="a11y-widget-config" strategy="beforeInteractive">
          {window.__A11Y_WIDGET__ = {
            siteId: "YOUR_SITE_ID",
            surfaces: ["body"]
          }}
        </Script>
        <Script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}`
      }
    ]
  },
  {
    title: 'React SPA',
    time: '10 min',
    difficulty: 'Medium',
    description: 'Installation for React Single Page Applications (Create React App, Vite, etc.). Includes hooks and dynamic loading.',
    steps: [
      {
        title: 'Add to index.html or useEffect',
        content: 'Add widget script in public/index.html or load dynamically:',
        code: `useEffect(() => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css'
  document.head.appendChild(link)
  
  window.__A11Y_WIDGET__ = {
    siteId: "YOUR_SITE_ID",
    surfaces: ["body"]
  }
  
  const script = document.createElement('script')
  script.src = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js'
  script.defer = true
  document.body.appendChild(script)
}, [])`
      }
    ]
  },
  {
    title: 'Shopify',
    time: '15 min',
    difficulty: 'Easy',
    description: 'Installation via theme.liquid. Includes z-index considerations for cart drawers and theme update strategies.',
    steps: [
      {
        title: 'Edit theme.liquid',
        content: 'Add before </head> in theme.liquid:',
        code: `<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{ shop.permanent_domain }}",
    position: "right",
    zIndex: 999999,
    surfaces: ["body", "main"]
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>`
      },
      {
        title: 'Z-Index Note',
        content: 'Ensure z-index is higher than cart drawers (typically 999999 or higher).'
      }
    ]
  },
  {
    title: 'Google Tag Manager',
    time: '10 min',
    difficulty: 'Easy',
    description: 'Installation via GTM Custom HTML tag. Perfect when direct code access isn\'t available. Includes CSP considerations.',
    steps: [
      {
        title: 'Create Custom HTML Tag',
        content: 'Add a Custom HTML tag that fires on All Pages:',
        code: `<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "YOUR_SITE_ID",
    surfaces: ["body"]
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>`
      },
      {
        title: 'Trigger Configuration',
        content: 'Set trigger to fire on All Pages or specific pages where you want the widget.'
      }
    ]
  },
  {
    title: 'Django / Rails / .NET',
    time: '10 min',
    difficulty: 'Medium',
    description: 'Installation for server-side rendered applications. Includes template examples for Django, Rails, and ASP.NET Core.',
    steps: [
      {
        title: 'Django Template',
        content: 'Add to base.html template:',
        code: `{% load static %}
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{ request.get_host }}",
    surfaces: ["body"]
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>`
      },
      {
        title: 'Rails Template',
        content: 'Add to application.html.erb:',
        code: `<%= stylesheet_link_tag "https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" %>
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "<%= request.host %>",
    surfaces: ["body"]
  };
</script>
<%= javascript_include_tag "https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js", defer: true %>`
      }
    ]
  }
]

export default function Tutorials() {
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null)

  const getDifficultyStars = (difficulty: string) => {
    if (difficulty === 'Easy') return '⭐'
    if (difficulty === 'Medium') return '⭐⭐'
    return '⭐⭐⭐'
  }

  const toggleTutorial = (title: string) => {
    setExpandedTutorial(expandedTutorial === title ? null : title)
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Platform-Specific Tutorials</h1>
        <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
          Step-by-step installation guides for popular platforms and frameworks.
        </p>

        <div className="tutorials-list">
          {tutorials.map((tutorial) => (
            <div key={tutorial.title} className="tutorial-card-expanded">
              <div 
                className="tutorial-header"
                onClick={() => toggleTutorial(tutorial.title)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h3>{tutorial.title}</h3>
                  <div className="tutorial-meta">
                    <span>⏱️ {tutorial.time}</span>
                    <span>{getDifficultyStars(tutorial.difficulty)} {tutorial.difficulty}</span>
                  </div>
                  <p style={{ marginTop: '0.5rem', color: 'var(--color-text-light)' }}>
                    {tutorial.description}
                  </p>
                </div>
                <button 
                  className="tutorial-toggle"
                  aria-expanded={expandedTutorial === tutorial.title}
                >
                  {expandedTutorial === tutorial.title ? '−' : '+'}
                </button>
              </div>
              
              {expandedTutorial === tutorial.title && (
                <div className="tutorial-content">
                  {tutorial.steps.map((step, idx) => (
                    <div key={idx} style={{ marginBottom: '2rem' }}>
                      <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-secondary)' }}>
                        {idx + 1}. {step.title}
                      </h4>
                      <p style={{ marginBottom: '1rem' }}>{step.content}</p>
                      {step.code && <CodeBlock code={step.code} language={step.code.includes('<?php') ? 'php' : step.code.includes('{%') ? 'django' : step.code.includes('<%=') ? 'erb' : 'html'} />}
                    </div>
                  ))}
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <p>
                      <strong>Need more help?</strong> Check the{' '}
                      <Link to="/getting-started">Getting Started</Link> guide or{' '}
                      <Link to="/docs">Documentation</Link>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '3rem', textAlign: 'center' }}>
          <h3>Need Help?</h3>
          <p>If your platform isn't listed, check the <Link to="/getting-started">Getting Started</Link> guide for general installation instructions.</p>
          <p>For troubleshooting, see the <Link to="/docs">Documentation</Link> section.</p>
        </div>
      </div>
    </section>
  )
}
