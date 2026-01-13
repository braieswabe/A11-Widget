// Import core widget (side-effect: registers window.__a11yWidgetInit)
// Widget core uses IIFE pattern - bundlers will execute it as a side effect
// Marked as side effect in package.json
// SSR-safe: core has guards to prevent execution in non-browser environments
import "../vendor/a11y-widget.core.js";

// Export init function
export { initA11yWidget } from "./init.js";
