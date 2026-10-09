import { Navigate } from 'react-router-dom'
import { useSiteAccess } from '../contexts/SiteAccessContext'

interface SiteAccessRouteProps {
  children: React.ReactNode
}

export default function SiteAccessRoute({ children }: SiteAccessRouteProps) {
  const { hasSiteAccess, isChecking } = useSiteAccess()

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

  if (!hasSiteAccess) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
