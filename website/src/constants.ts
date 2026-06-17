// Current widget release label (display/docs) and live GitHub CDN ref
export const WIDGET_VERSION = 'v1.7.2'
export const WIDGET_CDN_REF = 'v1.7.2'

// Filenames on the CDN for this release (keep in sync with repo root assets)
export const WIDGET_LOADER_FILENAME = 'a11y-widget-loader-v1.7.2.js'
export const WIDGET_RUNTIME_FILENAME = 'a11y-widget-v1.7.2.js'

// CDN base URL for the widget
export const WIDGET_CDN_BASE = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@${WIDGET_CDN_REF}`

// Loader script URL - recommended install path for external sites
export const WIDGET_LOADER_URL = `${WIDGET_CDN_BASE}/${WIDGET_LOADER_FILENAME}`

// Direct runtime URL when loading JS/CSS without the loader
export const WIDGET_SCRIPT_URL = `${WIDGET_CDN_BASE}/${WIDGET_RUNTIME_FILENAME}`
// Raw GitHub fallback if jsDelivr CDN is unavailable
export const WIDGET_SCRIPT_URL_FALLBACK = `https://raw.githubusercontent.com/braieswabe/A11-Widget/main/${WIDGET_RUNTIME_FILENAME}`

// Widget CSS URL
export const WIDGET_CSS_URL = `${WIDGET_CDN_BASE}/a11y-widget.css`
