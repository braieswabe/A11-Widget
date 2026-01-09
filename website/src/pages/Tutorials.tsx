import { Link } from 'react-router-dom'
import './Pages.css'

interface Tutorial {
  title: string
  time: string
  difficulty: string
  link: string
}

const tutorials: Tutorial[] = [
  {
    title: 'Static HTML',
    time: '5 min',
    difficulty: 'Easy',
    link: '../docs/INSTALL_STATIC.md'
  },
  {
    title: 'WordPress',
    time: '10 min',
    difficulty: 'Easy',
    link: '../docs/INSTALL_WORDPRESS.md'
  },
  {
    title: 'Next.js',
    time: '10 min',
    difficulty: 'Medium',
    link: '../docs/INSTALL_NEXTJS.md'
  },
  {
    title: 'React SPA',
    time: '10 min',
    difficulty: 'Medium',
    link: '../docs/INSTALL_REACT.md'
  },
  {
    title: 'Shopify',
    time: '15 min',
    difficulty: 'Easy',
    link: '../docs/INSTALL_SHOPIFY.md'
  },
  {
    title: 'Google Tag Manager',
    time: '10 min',
    difficulty: 'Easy',
    link: '../docs/INSTALL_GTM.md'
  },
  {
    title: 'Django / Rails / .NET',
    time: '10 min',
    difficulty: 'Medium',
    link: '../docs/INSTALL_DJANGO.md'
  }
]

export default function Tutorials() {
  const getDifficultyStars = (difficulty: string) => {
    if (difficulty === 'Easy') return '⭐'
    if (difficulty === 'Medium') return '⭐⭐'
    return '⭐⭐⭐'
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Platform-Specific Tutorials</h1>
        <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
          Step-by-step installation guides for popular platforms and frameworks.
        </p>

        <div className="card-grid">
          {tutorials.map((tutorial) => (
            <div key={tutorial.title} className="tutorial-card">
              <h3>{tutorial.title}</h3>
              <div className="tutorial-meta">
                <span>⏱️ {tutorial.time}</span>
                <span>{getDifficultyStars(tutorial.difficulty)} {tutorial.difficulty}</span>
              </div>
              <p>
                {tutorial.title === 'Static HTML' && 'Installation guide for static HTML sites and custom-built websites. Perfect for simple sites or when you have direct HTML access.'}
                {tutorial.title === 'WordPress' && 'Multiple installation methods for WordPress: plugins, theme files, or custom plugins. Includes caching considerations.'}
                {tutorial.title === 'Next.js' && 'Installation for Next.js App Router and Pages Router. Includes SSR considerations and TypeScript types.'}
                {tutorial.title === 'React SPA' && 'Installation for React Single Page Applications (Create React App, Vite, etc.). Includes hooks and dynamic loading.'}
                {tutorial.title === 'Shopify' && 'Installation via theme.liquid. Includes z-index considerations for cart drawers and theme update strategies.'}
                {tutorial.title === 'Google Tag Manager' && 'Installation via GTM Custom HTML tag. Perfect when direct code access isn\'t available. Includes CSP considerations.'}
                {tutorial.title === 'Django / Rails / .NET' && 'Installation for server-side rendered applications. Includes template examples for Django, Rails, and ASP.NET Core.'}
              </p>
              <a href={tutorial.link} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">View Guide</a>
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

