// Current widget release label and GitHub CDN ref
export const WIDGET_VERSION = 'v1.6.8'
export const WIDGET_CDN_REF = WIDGET_VERSION

// Filenames on the CDN for this release (keep in sync with repo root assets)
export const WIDGET_LOADER_FILENAME = 'a11y-widget-loader-v1.6.8.js'
// Versioned runtime used for local builds and raw GitHub fallback
export const WIDGET_RUNTIME_FILENAME = 'a11y-widget-v1.6.8.js'
// jsDelivr reliably serves the canonical runtime filename at the release tag
export const WIDGET_RUNTIME_CDN_FILENAME = 'a11y-widget.js'

// CDN base URL for the widget
export const WIDGET_CDN_BASE = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@${WIDGET_CDN_REF}`

// Loader script URL - recommended install path for external sites
export const WIDGET_LOADER_URL = `${WIDGET_CDN_BASE}/${WIDGET_LOADER_FILENAME}`

// Direct runtime URL for CDN consumers (use canonical filename on jsDelivr)
export const WIDGET_SCRIPT_URL = `${WIDGET_CDN_BASE}/${WIDGET_RUNTIME_CDN_FILENAME}`
// Raw GitHub fallback if jsDelivr CDN is unavailable
export const WIDGET_SCRIPT_URL_FALLBACK = `https://raw.githubusercontent.com/braieswabe/A11-Widget/${WIDGET_VERSION}/${WIDGET_RUNTIME_FILENAME}`

// Widget CSS URL
export const WIDGET_CSS_URL = `${WIDGET_CDN_BASE}/a11y-widget.css`
