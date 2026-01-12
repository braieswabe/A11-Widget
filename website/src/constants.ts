// Current widget version - update this when releasing a new version
export const WIDGET_VERSION = 'v1.8.0'

// CDN base URL for the widget
export const WIDGET_CDN_BASE = `https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@${WIDGET_VERSION}`

// Loader script URL - use versioned filename to bypass CDN cache
export const WIDGET_LOADER_URL = `${WIDGET_CDN_BASE}/a11y-widget-loader-v1.8.0.js`

// Widget script URL (direct) - using new versioned file
export const WIDGET_SCRIPT_URL = `${WIDGET_CDN_BASE}/a11y-widget-v1.8.0.js`
// Fallback to previous version if new version doesn't exist
export const WIDGET_SCRIPT_URL_FALLBACK = `${WIDGET_CDN_BASE}/a11y-widget-v1.7.0.js`

// Widget CSS URL
export const WIDGET_CSS_URL = `${WIDGET_CDN_BASE}/a11y-widget.css`

