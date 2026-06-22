import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { WIDGET_RUNTIME_FILENAME } from '../../constants'
import '../Pages.css'

interface WidgetSite {
  id: string
  siteId: string
  domain: string
  title?: string | null
  faviconUrl?: string | null
  lastSeenAt: string
  lastUrl: string | null
  widgetVersion: string | null
  status: string
  unresolvedErrorCount?: number
  openSupportCaseCount?: number
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
  const [isSweeping, setIsSweeping] = useState(false)
  const [resolvingErrors, setResolvingErrors] = useState<Set<string>>(new Set())
  const [updatingCases, setUpdatingCases] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('')

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
    setError('')
    setActionStatus('')
    const resolvedItem = errors.find((item) => item.id === id)
    setResolvingErrors((current) => new Set(current).add(id))
    try {
      const response = await authedFetch('/api/admin/widget-errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isResolved: true })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to mark error resolved')
      }

      setErrors((current) => current.filter((item) => item.id !== id))
      if (resolvedItem) {
        setSites((current) => current.map((site) => site.siteId === resolvedItem.siteId ? {
          ...site,
          unresolvedErrorCount: site.unresolvedErrorCount ? Math.max(0, site.unresolvedErrorCount - 1) : 0
        } : site))
      }
      setActionStatus('Error marked resolved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark error resolved')
    } finally {
      setResolvingErrors((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  async function updateCase(id: string, status: string) {
    setError('')
    setActionStatus('')
    setUpdatingCases((current) => new Set(current).add(id))
    try {
      const response = await authedFetch('/api/admin/support-cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, assignToMe: true })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update support case')
      }

      setCases((current) => current.map((item) => item.id === id ? { ...item, status } : item))
      setActionStatus(status === 'resolved' ? 'Support case resolved.' : 'Support case moved to in progress.')
      loadMonitoring()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update support case')
    } finally {
      setUpdatingCases((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  async function runSweep() {
    setError('')
    setActionStatus('')
    setIsSweeping(true)
    try {
      const response = await authedFetch('/api/admin/health-sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to run health sweep')
      }

      const data = await response.json()
      setActionStatus(`Health sweep complete. ${data.staleCount || 0} stale and ${data.downCount || 0} down site${data.downCount === 1 ? '' : 's'} updated.`)
      loadMonitoring()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run health sweep')
    } finally {
      setIsSweeping(false)
    }
  }

  const statusCounts = sites.reduce<Record<string, number>>((acc, site) => {
    acc[site.status] = (acc[site.status] || 0) + 1
    return acc
  }, {})

  function formatUrl(domain: string) {
    if (!domain) return ''
    return domain.startsWith('http://') || domain.startsWith('https://') ? domain : `https://${domain}`
  }

  function statusChip(status: string) {
    const colors: Record<string, { bg: string; color: string }> = {
      active: { bg: '#dcfce7', color: '#166534' },
      stale: { bg: '#fef3c7', color: '#92400e' },
      down: { bg: '#fee2e2', color: '#991b1b' }
    }
    const style = colors[status] || { bg: '#e5e7eb', color: '#374151' }
    return (
      <span style={{ display: 'inline-flex', borderRadius: '999px', background: style.bg, color: style.color, padding: '0.2rem 0.55rem', fontSize: '0.8rem', fontWeight: 700 }}>
        {status}
      </span>
    )
  }

  function supportStatusChip(status: string) {
    const colors: Record<string, { bg: string; color: string; label: string }> = {
      open: { bg: '#fee2e2', color: '#991b1b', label: 'Open' },
      in_progress: { bg: '#fef3c7', color: '#92400e', label: 'In progress' },
      resolved: { bg: '#dcfce7', color: '#166534', label: 'Resolved' },
      closed: { bg: '#e5e7eb', color: '#374151', label: 'Closed' }
    }
    const style = colors[status] || { bg: '#e5e7eb', color: '#374151', label: status }
    return (
      <span style={{ display: 'inline-flex', borderRadius: '999px', background: style.bg, color: style.color, padding: '0.2rem 0.55rem', fontSize: '0.8rem', fontWeight: 700 }}>
        {style.label}
      </span>
    )
  }

  function widgetVersionCell(version: string | null) {
    if (!version) return '-'
    const isCurrent = version === WIDGET_RUNTIME_FILENAME
    return (
      <div>
        <div>{version}</div>
        <div style={{ fontSize: '0.75rem', color: isCurrent ? '#166534' : '#92400e', fontWeight: 700 }}>
          {isCurrent ? 'Current' : `Outdated · expected ${WIDGET_RUNTIME_FILENAME}`}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <div>
          <h1>Widget Monitoring</h1>
          <p>Track installed widgets, runtime errors, stale sites, and visitor support cases.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" type="button" onClick={loadMonitoring}>Refresh</button>
          <button className="btn btn-primary" type="button" onClick={runSweep} disabled={isSweeping}>
            {isSweeping ? 'Running...' : 'Run Health Sweep'}
          </button>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {actionStatus && <div className="card" style={{ borderColor: '#16a34a', color: '#166534' }}>{actionStatus}</div>}
        {error && <div className="card" style={{ borderColor: '#dc3545', color: '#721c24' }}>{error}</div>}
      </div>
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
              <p>Visitor-submitted cases from the widget Support button.</p>
            </div>
          </div>

          <section className="card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
            <h2>Installed Sites</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <caption style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: 600 }}>
                Installed widget sites and current health status
              </caption>
              <thead>
                <tr>
                  <th scope="col">Site</th>
                  <th scope="col">Status</th>
                  <th scope="col">Errors</th>
                  <th scope="col">Cases</th>
                  <th scope="col">Version</th>
                  <th scope="col">Last seen</th>
                  <th scope="col">Latest URL</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', minWidth: '220px' }}>
                        {site.faviconUrl ? (
                          <img src={site.faviconUrl} alt="" width="24" height="24" style={{ borderRadius: '6px', flex: '0 0 auto' }} />
                        ) : (
                          <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#e5e7eb', display: 'inline-block', flex: '0 0 auto' }} />
                        )}
                        <div>
                          <strong>{site.title || site.siteId}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <a href={formatUrl(site.domain)} target="_blank" rel="noreferrer">{site.domain}</a>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{site.siteId}</div>
                        </div>
                      </div>
                    </td>
                    <td>{statusChip(site.status)}</td>
                    <td>{site.unresolvedErrorCount || 0}</td>
                    <td>{site.openSupportCaseCount || 0}</td>
                    <td>{widgetVersionCell(site.widgetVersion)}</td>
                    <td>{new Date(site.lastSeenAt).toLocaleString()}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {site.lastUrl ? <a href={site.lastUrl} target="_blank" rel="noreferrer">{site.lastUrl}</a> : '-'}
                    </td>
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
                <div>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => resolveError(item.id)}
                    disabled={resolvingErrors.has(item.id)}
                  >
                    {resolvingErrors.has(item.id) ? 'Marking...' : 'Mark resolved'}
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="card" style={{ marginTop: '2rem' }}>
            <h2>Support Cases</h2>
            {cases.length === 0 ? <p>No support cases.</p> : cases.slice(0, 20).map((item) => (
              <div key={item.id} style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 0' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>{item.issueType} · {item.siteId}</strong>
                  {supportStatusChip(item.status)}
                </div>
                <p>{item.message}</p>
                <small>{item.contactEmail || 'No contact email'} · {new Date(item.createdAt).toLocaleString()}</small>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {item.status === 'open' && (
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => updateCase(item.id, 'in_progress')}
                      disabled={updatingCases.has(item.id)}
                    >
                      {updatingCases.has(item.id) ? 'Updating...' : 'Start progress'}
                    </button>
                  )}
                  {item.status === 'in_progress' && (
                    <button className="btn btn-secondary" type="button" disabled>In progress</button>
                  )}
                  {item.status !== 'resolved' && item.status !== 'closed' && (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => updateCase(item.id, 'resolved')}
                      disabled={updatingCases.has(item.id)}
                    >
                      {updatingCases.has(item.id) ? 'Updating...' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
