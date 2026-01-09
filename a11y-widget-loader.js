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
  
  // Check if CSS is already loaded
  var cssLoaded = document.getElementById("a11y-widget-stylesheet") || 
                  document.querySelector('link[href*="a11y-widget.css"]');
  
  // Load CSS from GitHub
  if (!cssLoaded) {
    var cssLink = document.createElement("link");
    cssLink.id = "a11y-widget-stylesheet";
    cssLink.rel = "stylesheet";
    cssLink.href = CDN_BASE + "a11y-widget.css";
    cssLink.crossOrigin = "anonymous";
    
    // Fallback to GitHub raw if jsDelivr fails
    cssLink.onerror = function() {
      cssLink.href = GITHUB_RAW_BASE + "a11y-widget.css";
    };
    
    document.head.appendChild(cssLink);
  }
  
  // Load widget script from GitHub
  var scriptLoaded = document.getElementById("a11y-widget-script") ||
                     document.querySelector('script[src*="a11y-widget.js"]');
  
  if (!scriptLoaded) {
    var script = document.createElement("script");
    script.id = "a11y-widget-script";
    script.src = CDN_BASE + "a11y-widget.js";
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    // Fallback to GitHub raw if jsDelivr fails
    script.onerror = function() {
      script.src = GITHUB_RAW_BASE + "a11y-widget.js";
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

