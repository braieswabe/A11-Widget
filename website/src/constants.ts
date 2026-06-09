// Current GitHub release tag (jsDelivr) — update when you ship a new tag
export const WIDGET_VERSION = 'v1.6.7'

// Filenames on the CDN for this release (keep in sync with repo root assets)
export const WIDGET_LOADER_FILENAME = 'a11y-widget-loader-v1.6.7.js'
export const WIDGET_RUNTIME_FILENAME = 'a11y-widget-v1.6.7.js'

// CDN base URL for the widget
export const WIDGET_CDN_BASE = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@${WIDGET_VERSION}`

// Loader script URL - use versioned filename to bypass CDN cache
export const WIDGET_LOADER_URL = `${WIDGET_CDN_BASE}/${WIDGET_LOADER_FILENAME}`

// Widget script URL (direct, updated tabbed widget UI)
export const WIDGET_SCRIPT_URL = `${WIDGET_CDN_BASE}/${WIDGET_RUNTIME_FILENAME}`
// Fallback to same version if needed
export const WIDGET_SCRIPT_URL_FALLBACK = `${WIDGET_CDN_BASE}/${WIDGET_RUNTIME_FILENAME}`

// Widget CSS URL
export const WIDGET_CSS_URL = `${WIDGET_CDN_BASE}/a11y-widget.css`
