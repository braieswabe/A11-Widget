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
  var LOADER_VERSION = "1.1"; // Increment this when loader logic changes
  
  // Check if we need to reload the loader script itself (if cached version is old)
  var currentLoaderVersion = document.currentScript ? document.currentScript.getAttribute("data-version") : null;
  if (currentLoaderVersion && currentLoaderVersion !== LOADER_VERSION) {
    // Loader script is outdated, reload it
    var newLoader = document.createElement("script");
    newLoader.src = GITHUB_RAW_BASE + "a11y-widget-loader.js?v=" + Date.now();
    newLoader.setAttribute("data-version", LOADER_VERSION);
    document.head.appendChild(newLoader);
    return; // Exit, let new loader handle the rest
  }
  
  // Force reload: Always reload CSS and JS to ensure latest version
  // Remove existing CSS and JS to force fresh loads
  var existingCSS = document.getElementById("a11y-widget-stylesheet") || 
                    document.querySelector('link[href*="a11y-widget.css"]');
  if (existingCSS && existingCSS.parentNode) {
    existingCSS.parentNode.removeChild(existingCSS);
  }
  
  var existingScript = document.getElementById("a11y-widget-script") ||
                       document.querySelector('script[src*="a11y-widget.js"]');
  if (existingScript && existingScript.parentNode) {
    existingScript.parentNode.removeChild(existingScript);
  }
  
  // Reset widget state to allow reload
  if (window.__a11yWidget) {
    window.__a11yWidget.__loaded = false;
  }
  
  // Always load fresh CSS from GitHub with aggressive cache-busting
  // Use milliseconds timestamp for maximum cache-busting effectiveness
  var timestamp = Date.now(); // Use milliseconds for better cache busting
  var cssLink = document.createElement("link");
  cssLink.id = "a11y-widget-stylesheet";
  cssLink.rel = "stylesheet";
  // Use raw GitHub URL for immediate updates (bypasses CDN caching)
  var cssUrl = GITHUB_RAW_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + Math.random();
  cssLink.href = cssUrl;
  cssLink.crossOrigin = "anonymous";
  
  // Fallback to jsDelivr if raw GitHub fails
  cssLink.onerror = function() {
    cssLink.href = CDN_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + Math.random();
  };
  
  document.head.appendChild(cssLink);
  
  // Always load fresh widget script from GitHub
  var script = document.createElement("script");
  script.id = "a11y-widget-script";
  // Use raw GitHub URL for immediate updates (bypasses CDN caching)
  // Aggressive cache-busting with timestamp + random to ensure fresh loads
  var scriptUrl = GITHUB_RAW_BASE + "a11y-widget.js?v=" + timestamp + "&_=" + Math.random();
  script.src = scriptUrl;
  script.defer = true;
  script.crossOrigin = "anonymous";
  
  // Fallback to jsDelivr if raw GitHub fails
  script.onerror = function() {
    script.src = CDN_BASE + "a11y-widget.js?v=" + timestamp + "&_=" + Math.random();
  };
  
  // Insert before first script or append to head
  var firstScript = document.getElementsByTagName("script")[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
})();

