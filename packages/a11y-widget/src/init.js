/**
 * Initialize the accessibility widget
 * @param {Object} config - Widget configuration (siteId, position, etc.)
 */
export function initA11yWidget(config = {}) {
  // SSR guard - return silently if not in browser
  if (typeof window === "undefined") return;
  
  // Ensure core is loaded (check both window and global for SSR compatibility)
  var initFn = window.__a11yWidgetInit || (typeof global !== "undefined" ? global.__a11yWidgetInit : null);
  if (!initFn) {
    throw new Error("A11y widget core not loaded. Make sure to import the package entry point first.");
  }
  
  // Prevent double initialization
  if (window.__a11yWidget?.__loaded) {
    return;
  }
  
  // Call the core init function with config
  initFn(config);
}
