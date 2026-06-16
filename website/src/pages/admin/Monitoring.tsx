import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import '../Pages.css'

interface WidgetSite {
  id: string
  siteId: string
  domain: string
  lastSeenAt: string
  lastUrl: string | null
  widgetVersion: string | null
  status: string
}

interface WidgetError {
  id: string
  siteId: string
  severity: string
  source: string
  message: string
  url: string | null
  createdAt: string
  isResolved: boolean
}

interface SupportCase {
  id: string
  siteId: string
  issueType: string
  message: string
  contactEmail: string | null
  status: string
  createdAt: string
}

export default function Monitoring() {
  const { token } = useAuth()
  const [sites, setSites] = useState<WidgetSite[]>([])
  const [errors, setErrors] = useState<WidgetError[]>([])
  const [cases, setCases] = useState<SupportCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMonitoring()
  }, [])

  async function authedFetch(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)

    return fetch(path, {
      ...options,
      headers
    })
  }

  async function loadMonitoring() {
    try {
      setIsLoading(true)
      setError('')
      const [sitesRes, errorsRes, casesRes] = await Promise.all([
        authedFetch('/api/admin/widget-sites'),
        authedFetch('/api/admin/widget-errors?resolved=false'),
        authedFetch('/api/admin/support-cases')
      ])

      if (!sitesRes.ok || !errorsRes.ok || !casesRes.ok) {
        throw new Error('Failed to load monitoring data')
      }

      const [sitesData, errorsData, casesData] = await Promise.all([
        sitesRes.json(),
        errorsRes.json(),
        casesRes.json()
      ])

      setSites(sitesData.sites || [])
      setErrors(errorsData.errors || [])
      setCases(casesData.cases || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monitoring data')
    } finally {
      setIsLoading(false)
    }
  }

  async function resolveError(id: string) {
    await authedFetch('/api/admin/widget-errors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isResolved: true })
    })
    loadMonitoring()
  }

  async function updateCase(id: string, status: string) {
    await authedFetch('/api/admin/support-cases', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, assignToMe: true })
    })
    loadMonitoring()
  }

  async function runSweep() {
    await authedFetch('/api/admin/health-sweep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    loadMonitoring()
  }

  const statusCounts = sites.reduce<Record<string, number>>((acc, site) => {
    acc[site.status] = (acc[site.status] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <div>
          <h1>Widget Monitoring</h1>
          <p>Track installed widgets, runtime errors, stale sites, and visitor support cases.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" type="button" onClick={loadMonitoring}>Refresh</button>
          <button className="btn btn-primary" type="button" onClick={runSweep}>Run Health Sweep</button>
        </div>
      </div>

      {error && <div className="card" style={{ borderColor: '#dc3545', color: '#721c24' }}>{error}</div>}
      {isLoading ? <p>Loading monitoring data...</p> : (
        <>
          <div className="features-grid" style={{ marginTop: '1.5rem' }}>
            <div className="feature-item">
              <h3>Installations</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{sites.length}</p>
              <p>Active: {statusCounts.active || 0} | Stale: {statusCounts.stale || 0} | Down: {statusCounts.down || 0}</p>
            </div>
            <div className="feature-item">
              <h3>Open Errors</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{errors.length}</p>
              <p>Unresolved widget errors reported by installed sites.</p>
            </div>
            <div className="feature-item">
              <h3>Support Cases</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{cases.filter((item) => item.status !== 'closed' && item.status !== 'resolved').length}</p>
              <p>Visitor-submitted cases from the widget Support tab.</p>
            </div>
          </div>

          <section className="card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
            <h2>Installed Sites</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th>Site</th><th>Domain</th><th>Status</th><th>Version</th><th>Last seen</th></tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>{site.siteId}</td>
                    <td>{site.domain}</td>
                    <td>{site.status}</td>
                    <td>{site.widgetVersion || '-'}</td>
                    <td>{new Date(site.lastSeenAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card" style={{ marginTop: '2rem' }}>
            <h2>Recent Errors</h2>
            {errors.length === 0 ? <p>No unresolved errors.</p> : errors.slice(0, 20).map((item) => (
              <div key={item.id} style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 0' }}>
                <strong>{item.severity.toUpperCase()} · {item.siteId} · {item.source}</strong>
                <p>{item.message}</p>
                <small>{item.url || 'No URL'} · {new Date(item.createdAt).toLocaleString()}</small>
                <div><button className="btn btn-secondary" type="button" onClick={() => resolveError(item.id)}>Mark resolved</button></div>
              </div>
            ))}
          </section>

          <section className="card" style={{ marginTop: '2rem' }}>
            <h2>Support Cases</h2>
            {cases.length === 0 ? <p>No support cases.</p> : cases.slice(0, 20).map((item) => (
              <div key={item.id} style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 0' }}>
                <strong>{item.issueType} · {item.siteId} · {item.status}</strong>
                <p>{item.message}</p>
                <small>{item.contactEmail || 'No contact email'} · {new Date(item.createdAt).toLocaleString()}</small>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary" type="button" onClick={() => updateCase(item.id, 'in_progress')}>In progress</button>
                  <button className="btn btn-primary" type="button" onClick={() => updateCase(item.id, 'resolved')}>Resolve</button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
