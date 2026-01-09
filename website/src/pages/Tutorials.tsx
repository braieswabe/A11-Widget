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
    time: '2 min',
    difficulty: 'Easy',
    description: 'Installation guide for static HTML sites and custom-built websites. Perfect for simple sites or when you have direct HTML access.',
    steps: [
      {
        title: 'Add Widget Loader Script',
        content: 'Add this single line before </head> or before </body>:',
        code: `<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>`
      },
      {
        title: 'That\'s It!',
        content: 'The widget loads automatically from GitHub. No configuration needed! The widget will appear in the top-right corner.'
      },
      {
        title: 'Optional: Custom Button Control',
        content: 'To hide the default button and control it with your own header button, see the Custom Button Control guide.',
        code: `/* Add to your CSS */
.a11y-widget-hidden #a11y-widget-root {
  display: none !important;
}

/* Add to your HTML on page load */
document.documentElement.classList.add('a11y-widget-hidden');

/* Toggle in your button click handler */
document.documentElement.classList.toggle('a11y-widget-hidden');`
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
    time: '5 min',
    difficulty: 'Easy',
    description: 'Installation for Next.js App Router and Pages Router. Includes SSR considerations and TypeScript types.',
    steps: [
      {
        title: 'App Router (layout.tsx)',
        content: 'Add to your root layout:',
        code: `import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Just one line - widget loads automatically! */}
        <Script 
          src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" 
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}`
      }
    ]
  },
  {
    title: 'React SPA',
    time: '5 min',
    difficulty: 'Easy',
    description: 'Installation for React Single Page Applications (Create React App, Vite, etc.). Includes custom button control option.',
    steps: [
      {
        title: 'Add Loader Script',
        content: 'Add to public/index.html (simplest method):',
        code: `<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>`
      },
      {
        title: 'Optional: Custom Button Control',
        content: 'Hide default button and control with your own header button:',
        code: `/* In src/index.css */
.a11y-widget-hidden #a11y-widget-root {
  display: none !important;
}

/* In src/index.js or src/main.jsx */
document.documentElement.classList.add('a11y-widget-hidden');

/* In your Header component */
const toggleWidget = () => {
  document.documentElement.classList.toggle('a11y-widget-hidden');
};`
      }
    ]
  },
  {
    title: 'Shopify',
    time: '5 min',
    difficulty: 'Easy',
    description: 'Installation via theme.liquid. Includes z-index considerations for cart drawers and theme update strategies.',
    steps: [
      {
        title: 'Edit theme.liquid',
        content: 'Add before </head> in theme.liquid:',
        code: `<!-- Just one line - widget loads automatically! -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>`
      },
      {
        title: 'Optional: Customize Settings',
        content: 'If needed, add configuration before the loader script:',
        code: `<script>
  window.__A11Y_WIDGET__ = {
    position: "right",
    surfaces: ["body", "main"]
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>`
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
