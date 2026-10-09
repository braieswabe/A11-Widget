import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSiteAccess } from '../contexts/SiteAccessContext'
import { teardownA11yWidget } from '../utils/teardownA11yWidget'
import A11yLogo from '../components/A11yLogo'
import './Pages.css'

export default function SitePasswordGate() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { hasSiteAccess, isChecking, unlock } = useSiteAccess()
  const navigate = useNavigate()

  useEffect(() => {
    teardownA11yWidget()
    return () => {
      teardownA11yWidget()
    }
  }, [])

  useEffect(() => {
    if (!isChecking && hasSiteAccess) {
      navigate('/welcome', { replace: true })
    }
  }, [hasSiteAccess, isChecking, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (unlock(password)) {
      navigate('/welcome', { replace: true })
    } else {
      setError('Incorrect access password. Please try again.')
      setPassword('')
    }
  }

  if (isChecking) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '420px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <A11yLogo size={48} />
          <h1 style={{ margin: '16px 0 8px', textAlign: 'center', fontSize: '1.35rem' }}>
            Accessibility Widget
          </h1>
          <p style={{ margin: 0, textAlign: 'center', color: '#555', fontSize: '0.95rem' }}>
            Enter the site access password to open the demo and documentation area.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '6px',
                color: '#c33',
                fontSize: '0.9rem'
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="site-access-password" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Site access password
            </label>
            <input
              id="site-access-password"
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Continue to site
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
          Employee admin sign-in is available after you enter the site access password.
        </p>
      </div>
    </div>
  )
}
