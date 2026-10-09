/** Session flag after visitor passes the site gate (separate from admin auth). */
export const SITE_ACCESS_SESSION_KEY = '__a11y_site_unlocked__'

/** Override in deployment with VITE_SITE_ACCESS_PASSWORD when needed. */
export const SITE_ACCESS_PASSWORD =
  import.meta.env.VITE_SITE_ACCESS_PASSWORD ?? 'CareerDriverWidget2026!'
