import './Pages.css'

interface FeatureItem {
  name: string
  icon: string
  description: string
  options?: string[]
  wcag?: string
  note?: string
}

export default function Features() {
  const features: Array<{
    category: string
    icon: string
    items: FeatureItem[]
  }> = [
    {
      category: "Basic Settings",
      icon: "⚙️",
      items: [
        {
          name: "Contrast Mode",
          icon: "🎨",
          description: "Choose from Default, High Contrast, Dark Theme, or Light Theme for better visibility",
          wcag: "WCAG 2.1 SC 1.4.3 (Contrast Minimum)"
        },
        {
          name: "Text Size",
          icon: "🔠",
          description: "Adjust text size from 100% to 160% for easier reading",
          wcag: "WCAG 2.1 SC 1.4.4 (Resize Text)"
        },
        {
          name: "Text Spacing",
          icon: "↔️",
          description: "Control line height, letter spacing, word spacing, and paragraph spacing",
          wcag: "WCAG 2.1 SC 1.4.12 (Text Spacing)"
        },
        {
          name: "Readable Font",
          icon: "🔤",
          description: "Switch to a system-friendly sans-serif font that's easier to read",
          wcag: "WCAG 2.1 SC 1.4.12"
        },
        {
          name: "Reduce Motion",
          icon: "⏸️",
          description: "Disable animations and transitions for users sensitive to motion",
          wcag: "WCAG 2.1 SC 2.3.3 (Animation from Interactions)"
        }
      ]
    },
    {
      category: "Global Mode",
      icon: "🌐",
      items: [
        {
          name: "Global Mode",
          icon: "🌐",
          description: "Apply transformations to entire website (fonts, colors, sizes). Overhauls website UI completely.",
          options: [
            "Font Family Selection (8 font options)",
            "Background Color Picker",
            "Applies to all elements on the page"
          ]
        }
      ]
    },
    {
      category: "Reading & Focus Aids",
      icon: "📖",
      items: [
        {
          name: "Text-to-Speech",
          icon: "🔊",
          description: "Read website text aloud with customizable voice settings. Automatically selects Siri-like voices.",
          options: [
            "Read Selected Text",
            "Read Full Page",
            "Customizable voice, rate, pitch, and volume",
            "PDF text extraction support"
          ]
        },
        {
          name: "Reading Ruler",
          icon: "📏",
          description: "Horizontal line that follows your cursor to focus on one line of text at a time"
        },
        {
          name: "Screen Mask",
          icon: "🎭",
          description: "Dim distractions around the focused area to improve concentration. Adjustable opacity and radius."
        },
        {
          name: "Text-Only Mode",
          icon: "📄",
          description: "Strip away images and layout, showing only text content for easier reading"
        },
        {
          name: "Adjustable Margins",
          icon: "📐",
          description: "Add adjustable margins (0-200px) for better readability and focus"
        }
      ]
    },
    {
      category: "Tools",
      icon: "🛠️",
      items: [
        {
          name: "Large Cursor",
          icon: "🖱️",
          description: "Increase cursor size to Large (32px) or Extra Large (48px) for better visibility"
        },
        {
          name: "Page Magnifier",
          icon: "🔍",
          description: "Zoom parts of the page on hover for closer inspection. Uses html2canvas for actual content zoom.",
          options: [
            "Adjustable zoom level (1.5x - 5.0x)",
            "Shows actual page content magnified",
            "Follows mouse cursor"
          ]
        },
        {
          name: "Dictionary Lookup",
          icon: "📚",
          description: "Double-click any word to see its definition and part of speech"
        },
        {
          name: "Translation",
          icon: "🌍",
          description: "Automatically translate page content into multiple languages",
          options: [
            "12+ languages supported",
            "Translates all text on declared surfaces",
            "Preserves original text for easy toggle",
            "Automatic re-translation on language change"
          ]
        }
      ]
    },
    {
      category: "Quick Presets",
      icon: "⚡",
      items: [
        {
          name: "Low Vision",
          icon: "🔍",
          description: "High contrast + 150% text + comfortable spacing + readable font",
          wcag: "WCAG 2.1 SC 1.4.3, 1.4.4, 1.4.12"
        },
        {
          name: "Dyslexia-Friendly",
          icon: "📖",
          description: "Readable font + maximum spacing + 120% text + reduced motion",
          note: "Uses default contrast (high contrast can worsen dyslexia)"
        },
        {
          name: "Reduced Motion",
          icon: "⏸️",
          description: "Disable all animations and transitions",
          wcag: "WCAG 2.1 SC 2.3.3"
        },
        {
          name: "High Contrast",
          icon: "🎨",
          description: "Enhanced color contrast for better visibility",
          wcag: "WCAG 2.1 SC 1.4.3"
        },
        {
          name: "Large Text",
          icon: "🔤",
          description: "150% text size with comfortable spacing",
          wcag: "WCAG 2.1 SC 1.4.4"
        },
        {
          name: "Dark Theme",
          icon: "🌙",
          description: "Dark background with light text for reduced eye strain"
        }
      ]
    },
    {
      category: "Navigation & Interaction",
      icon: "⌨️",
      items: [
        {
          name: "Keyboard Navigation",
          icon: "⌨️",
          description: "Fully keyboard navigable with Tab/Shift+Tab, Enter/Space activation",
          wcag: "WCAG 2.1 SC 2.1.1 (Keyboard)"
        },
        {
          name: "Global Keyboard Shortcut",
          icon: "⌨️",
          description: "Press Alt+A (Option+A on Mac) from anywhere to open/close widget",
          note: "Configurable or can be disabled"
        },
        {
          name: "Visible Focus Indicators",
          icon: "👁️",
          description: "Strong, visible focus rings on all interactive elements",
          wcag: "WCAG 2.1 SC 2.4.7 (Focus Visible)"
        },
        {
          name: "Skip to Content Link",
          icon: "⏭️",
          description: "Skip link to jump directly to main content",
          wcag: "WCAG 2.1 SC 2.4.1 (Bypass Blocks)"
        },
        {
          name: "Screen Reader Support",
          icon: "🔊",
          description: "Full ARIA labels, roles, and descriptions for screen reader compatibility",
          wcag: "WCAG 2.1 SC 4.1.2 (Name, Role, Value)"
        }
      ]
    },
    {
      category: "Additional Features",
      icon: "✨",
      items: [
        {
          name: "Preference Persistence",
          icon: "💾",
          description: "All settings are saved automatically and persist across page reloads",
          note: "Uses localStorage with cookie fallback"
        },
        {
          name: "Reset Button",
          icon: "🔄",
          description: "Quickly reset all preferences to default values"
        },
        {
          name: "Check for Updates",
          icon: "🔄",
          description: "Manually check and update widget design to latest version"
        },
        {
          name: "Surface Scoping",
          icon: "🎯",
          description: "Apply transformations only to declared content surfaces, or use Global Mode for entire website"
        }
      ]
    }
  ]

  return (
    <section className="section">
      <div className="container container-narrow">
        <h1 className="section-title">Widget Features</h1>
        <p className="text-center" style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
          Comprehensive accessibility features aligned with WCAG 2.1 Level AA standards
        </p>

        {features.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: '3rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid var(--color-border)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                {category.category}
              </h2>
            </div>

            <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {category.items.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className="feature-item"
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-bg)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                      {feature.name}
                    </h3>
                  </div>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: 'var(--color-text-light)', lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                  {'options' in feature && feature.options && feature.options.length > 0 && (
                    <ul style={{ 
                      margin: '0.75rem 0', 
                      paddingLeft: '1.25rem',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-light)'
                    }}>
                      {feature.options.map((option: string, optIndex: number) => (
                        <li key={optIndex} style={{ marginBottom: '0.25rem' }}>{option}</li>
                      ))}
                    </ul>
                  )}
                  {'wcag' in feature && feature.wcag && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-secondary-light)',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: 'var(--color-secondary)',
                      fontWeight: 500
                    }}>
                      {feature.wcag}
                    </div>
                  )}
                  {'note' in feature && feature.note && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-bg-alt)',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-light)',
                      fontStyle: 'italic'
                    }}>
                      Note: {feature.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="card" style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Ready to Get Started?</h3>
          <p>Install the widget on your website with a single line of code.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <a href="/getting-started" className="btn btn-primary">Installation Guide</a>
            <a href="/download" className="btn btn-secondary">Download Example</a>
          </div>
        </div>
      </div>
    </section>
  )
}

