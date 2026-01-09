/*! a11y-widget-loader.js — Zero-Config Loader
    Just include this single script tag and the widget loads automatically from GitHub!
    
    Usage:
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
    
    Or use the full widget file:
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget.js" defer></script>
*/
(function() {
  "use strict";
  
  var GITHUB_REPO = "braieswabe/A11-Widget";
  var GITHUB_BRANCH = "main";
  var CDN_BASE = "https://cdn.jsdelivr.net/gh/" + GITHUB_REPO + "@" + GITHUB_BRANCH + "/";
  var GITHUB_RAW_BASE = "https://raw.githubusercontent.com/" + GITHUB_REPO + "/" + GITHUB_BRANCH + "/";
  
  // Check if widget is already loaded
  if (window.__a11yWidget && window.__a11yWidget.__loaded) {
    return;
  }
  
  // Force CSS reload: Remove existing CSS link if it exists (to ensure updates propagate)
  var existingCSS = document.getElementById("a11y-widget-stylesheet") || 
                    document.querySelector('link[href*="a11y-widget.css"]');
  if (existingCSS && existingCSS.parentNode) {
    existingCSS.parentNode.removeChild(existingCSS);
  }
  
  // Always load fresh CSS from GitHub with cache-busting to ensure updates propagate
  // This ensures all existing integrations get updates automatically on every page load
  var cssLink = document.createElement("link");
  cssLink.id = "a11y-widget-stylesheet";
  cssLink.rel = "stylesheet";
  // Use raw GitHub URL for immediate updates (no CDN caching delay)
  // Add cache-busting with timestamp to ensure fresh loads
  var timestamp = Math.floor(Date.now() / 1000); // Use seconds for better cache busting
  var cssUrl = GITHUB_RAW_BASE + "a11y-widget.css?v=" + timestamp;
  cssLink.href = cssUrl;
  cssLink.crossOrigin = "anonymous";
  
  // Fallback to jsDelivr if raw GitHub fails
  cssLink.onerror = function() {
    cssLink.href = CDN_BASE + "a11y-widget.css?v=" + timestamp;
  };
  
  document.head.appendChild(cssLink);
  
  // Load widget script from GitHub
  // Check if script is already loaded to avoid duplicates
  var scriptLoaded = document.getElementById("a11y-widget-script") ||
                     document.querySelector('script[src*="a11y-widget.js"]');
  
  if (!scriptLoaded) {
    var script = document.createElement("script");
    script.id = "a11y-widget-script";
    // Use raw GitHub URL for immediate updates (no CDN caching delay)
    // Add cache-busting to ensure fresh loads
    // This ensures all existing integrations get updates automatically
    var timestamp = Math.floor(Date.now() / 1000); // Use seconds for better cache busting
    var scriptUrl = GITHUB_RAW_BASE + "a11y-widget.js?v=" + timestamp;
    script.src = scriptUrl;
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    // Fallback to jsDelivr if raw GitHub fails
    script.onerror = function() {
      script.src = CDN_BASE + "a11y-widget.js?v=" + timestamp;
    };
    
    // Insert before first script or append to head
    var firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
})();

