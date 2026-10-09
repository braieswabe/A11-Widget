import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { SITE_ACCESS_SESSION_KEY, SITE_ACCESS_PASSWORD } from '../constants/siteAccess'

interface SiteAccessContextType {
  hasSiteAccess: boolean
  isChecking: boolean
  unlock: (password: string) => boolean
  lock: () => void
}

const SiteAccessContext = createContext<SiteAccessContextType | undefined>(undefined)

export function SiteAccessProvider({ children }: { children: ReactNode }) {
  const [hasSiteAccess, setHasSiteAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    try {
      setHasSiteAccess(sessionStorage.getItem(SITE_ACCESS_SESSION_KEY) === '1')
    } finally {
      setIsChecking(false)
    }
  }, [])

  const unlock = useCallback((password: string) => {
    if (password !== SITE_ACCESS_PASSWORD) {
      return false
    }
    sessionStorage.setItem(SITE_ACCESS_SESSION_KEY, '1')
    setHasSiteAccess(true)
    return true
  }, [])

  const lock = useCallback(() => {
    sessionStorage.removeItem(SITE_ACCESS_SESSION_KEY)
    setHasSiteAccess(false)
  }, [])

  return (
    <SiteAccessContext.Provider value={{ hasSiteAccess, isChecking, unlock, lock }}>
      {children}
    </SiteAccessContext.Provider>
  )
}

export function useSiteAccess() {
  const ctx = useContext(SiteAccessContext)
  if (!ctx) {
    throw new Error('useSiteAccess must be used within SiteAccessProvider')
  }
  return ctx
}
