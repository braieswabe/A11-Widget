// Current widget release label (display/docs)
export const WIDGET_VERSION = 'v1.7.6'
export const WIDGET_CDN_REF = 'v1.7.6'

// Filenames for this release (keep in sync with repo root assets)
export const WIDGET_LOADER_FILENAME = 'a11y-widget-loader-v1.7.6.js'
export const WIDGET_RUNTIME_FILENAME = 'a11y-widget-v1.7.6.js'

/** Public widget host (Vercel). Override with VITE_WIDGET_PUBLIC_ORIGIN for custom domains. */
export const WIDGET_HOSTED_ORIGIN = (
  import.meta.env.VITE_WIDGET_PUBLIC_ORIGIN ?? 'https://a11-widget.vercel.app'
).replace(/\/$/, '')

// GitHub/jsDelivr — requires a public repo; optional when gh @tag is indexed
export const WIDGET_GITHUB_CDN_BASE = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@${WIDGET_CDN_REF}`

// Canonical install path (hosted; same assets as this docs site deploy)
export const WIDGET_LOADER_URL = `${WIDGET_HOSTED_ORIGIN}/${WIDGET_LOADER_FILENAME}`
export const WIDGET_SCRIPT_URL = `${WIDGET_HOSTED_ORIGIN}/${WIDGET_RUNTIME_FILENAME}`
export const WIDGET_CSS_URL = `${WIDGET_HOSTED_ORIGIN}/a11y-widget.css`

export const WIDGET_GITHUB_LOADER_URL = `${WIDGET_GITHUB_CDN_BASE}/${WIDGET_LOADER_FILENAME}`
export const WIDGET_SCRIPT_URL_FALLBACK = `${WIDGET_GITHUB_CDN_BASE}/${WIDGET_RUNTIME_FILENAME}`
export const WIDGET_CSS_URL_FALLBACK = `${WIDGET_GITHUB_CDN_BASE}/a11y-widget.css`
