/*! a11y-widget-loader.js — Zero-Config Loader v1.3
    Just include this single script tag and the widget loads automatically from GitHub!
    
    Usage:
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget-loader.js" defer></script>
    
    Or use the full widget file:
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/a11y-widget.js" defer></script>
*/
// Immediate console log to verify script is loading
// This runs BEFORE the IIFE, so it executes even if there's an error later
// CRITICAL: If you don't see this message, the loader script is cached/old
try {
  console.log('[A11Y Loader] ✅ Script file loaded - v1.4 -', new Date().toISOString());
  var scriptSrc = 'unknown';
  try {
    if (document.currentScript && document.currentScript.src) {
      scriptSrc = document.currentScript.src;
    } else {
      var scripts = document.querySelectorAll('script[src*="a11y-widget-loader.js"]');
      if (scripts.length > 0) scriptSrc = scripts[scripts.length - 1].src;
    }
  } catch(e) {}
  console.log('[A11Y Loader] Script source:', scriptSrc);
  console.log('[A11Y Loader] If you see this, the loader script v1.4 is executing');
} catch(e) {
  console.log('[A11Y Loader] Script file parsed but error logging:', e);
}

(function() {
  "use strict";
  
  var GITHUB_REPO = "braieswabe/A11-Widget";
  var GITHUB_BRANCH = "main";
  var CDN_BASE = "https://cdn.jsdelivr.net/gh/" + GITHUB_REPO + "@" + GITHUB_BRANCH + "/";
  var GITHUB_RAW_BASE = "https://raw.githubusercontent.com/" + GITHUB_REPO + "/" + GITHUB_BRANCH + "/";
  var LOADER_VERSION = "1.3"; // Increment this when loader logic changes
  var LOADER_VERSION_KEY = "__a11y_loader_version";
  var WIDGET_VERSION_KEY = "__a11y_widget_version";
  var LAST_UPDATE_CHECK_KEY = "__a11y_widget_last_check";
  
  // Debug logging helper (works in production) - defined early so it's available everywhere
  function debugLog(location, message, data, hypothesisId) {
    try {
      var logs = JSON.parse(localStorage.getItem('__a11y_debug_logs') || '[]');
      logs.push({location: location, message: message, data: data, timestamp: Date.now(), hypothesisId: hypothesisId});
      // Keep only last 100 logs
      if (logs.length > 100) logs = logs.slice(-100);
      localStorage.setItem('__a11y_debug_logs', JSON.stringify(logs));
      console.log('[A11Y Debug]', location, message, data);
    } catch(e) {
      // Fallback to console only if localStorage fails
      console.log('[A11Y Debug]', location, message, data, '(localStorage failed:', e.message + ')');
    }
  }
  
  // Log immediately that loader script is executing
  try {
    debugLog('a11y-widget-loader.js:start', 'Loader script file loaded and executing', {LOADER_VERSION: LOADER_VERSION, timestamp: Date.now()}, 'C');
  } catch(e) {
    console.log('[A11Y] Loader script executing, version:', LOADER_VERSION);
  }
  
  // IMMEDIATE: Check if this loader script is outdated and force reload
  // This runs BEFORE any other code to catch cached loader scripts
  var shouldExit = false;
  (function checkLoaderVersion() {
    try {
      var storedVersion = localStorage.getItem(LOADER_VERSION_KEY);
      // Find the script tag that loaded this file
      var scripts = document.querySelectorAll('script[src*="a11y-widget-loader.js"]');
      var currentScript = null;
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src && (scripts[i].src.indexOf('a11y-widget-loader.js') !== -1)) {
          currentScript = scripts[i];
          break;
        }
      }
      var scriptVersion = currentScript ? currentScript.getAttribute("data-version") : null;
      
      // #region agent log
      console.log('[A11Y Debug] Loader version check:', {storedVersion: storedVersion, LOADER_VERSION: LOADER_VERSION, scriptVersion: scriptVersion, scriptSrc: currentScript ? currentScript.src : 'not found'});
      // #endregion
      
      // ALWAYS check: If stored version doesn't match, or script version doesn't match, reload
      // Also reload if storedVersion is null (first time or old loader without version tracking)
      if (storedVersion !== LOADER_VERSION || (scriptVersion && scriptVersion !== LOADER_VERSION) || storedVersion === null) {
        console.log('[A11Y] Loader version check:', {storedVersion: storedVersion, LOADER_VERSION: LOADER_VERSION, scriptVersion: scriptVersion, action: 'reloading'});
        
        // Only reload if this is actually an old version (not first load of new version)
        if (storedVersion !== null && storedVersion !== LOADER_VERSION) {
          localStorage.setItem(LOADER_VERSION_KEY, LOADER_VERSION);
          
          // Remove old script
          if (currentScript && currentScript.parentNode) {
            currentScript.parentNode.removeChild(currentScript);
          }
          
          // Load fresh loader script using versioned filename with jsDelivr (bypasses CDN cache)
          // Use jsDelivr first because GitHub raw serves files as text/plain, which browsers won't execute
          var newLoader = document.createElement("script");
          newLoader.src = CDN_BASE + "a11y-widget-loader-v" + LOADER_VERSION + ".js";
          newLoader.setAttribute("data-version", LOADER_VERSION);
          newLoader.defer = true;
          
          // Fallback to raw GitHub if jsDelivr fails (though it may not execute due to content-type)
          newLoader.onerror = function() {
            console.warn('[A11Y] jsDelivr failed, trying raw GitHub (may not execute due to content-type)');
            var fallbackLoader = document.createElement("script");
            fallbackLoader.src = GITHUB_RAW_BASE + "a11y-widget-loader-v" + LOADER_VERSION + ".js";
            fallbackLoader.setAttribute("data-version", LOADER_VERSION);
            fallbackLoader.defer = true;
            document.head.appendChild(fallbackLoader);
          };
          
          document.head.appendChild(newLoader);
          shouldExit = true; // Mark to exit outer function
          return;
        }
      }
      
      // Mark this version as loaded (even if it was null before)
      localStorage.setItem(LOADER_VERSION_KEY, LOADER_VERSION);
      console.log('[A11Y] Loader version confirmed:', LOADER_VERSION);
    } catch(e) {
      console.error('[A11Y] Error checking loader version:', e);
    }
  })();
  
  // Exit if loader needs to be reloaded
  if (shouldExit) {
    return;
  }
  
  // Check for widget version updates by fetching version from GitHub
  // This ensures we always get the latest widget even if loader is cached
  function checkForUpdates() {
    // #region agent log
    debugLog('a11y-widget-loader.js:checkForUpdates', 'checkForUpdates called', {timestamp: Date.now()}, 'A,B,D');
    // #endregion
    var lastCheck = localStorage.getItem(LAST_UPDATE_CHECK_KEY);
    var now = Date.now();
    // Check every 1 minute for updates (reduced from 5 minutes for faster updates)
    if (lastCheck && (now - parseInt(lastCheck, 10)) < 60000) {
      // #region agent log
      debugLog('a11y-widget-loader.js:checkForUpdates', 'Skipping check - too soon', {lastCheck: lastCheck, now: now, diff: now - parseInt(lastCheck, 10)}, 'B');
      // #endregion
      return; // Skip check if checked recently
    }
    
    localStorage.setItem(LAST_UPDATE_CHECK_KEY, String(now));
    
    // #region agent log
    var currentVersion = localStorage.getItem(WIDGET_VERSION_KEY);
    debugLog('a11y-widget-loader.js:checkForUpdates', 'Before HTTP request', {currentVersion: currentVersion, checkUrl: GITHUB_RAW_BASE + "a11y-widget.js?nocache=" + now}, 'A,B,D');
    // #endregion
    
    // Fetch widget JS to check its version/update time
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', GITHUB_RAW_BASE + "a11y-widget.js?nocache=" + now, true);
    xhr.onload = function() {
      var lastModified = xhr.getResponseHeader('Last-Modified') || xhr.getResponseHeader('Date');
      var currentVersion = localStorage.getItem(WIDGET_VERSION_KEY);
      var allHeaders = {};
      try {
        var headerStr = xhr.getAllResponseHeaders();
        if (headerStr) {
          headerStr.split('\r\n').forEach(function(line) {
            var parts = line.split(': ');
            if (parts.length === 2) allHeaders[parts[0]] = parts[1];
          });
        }
      } catch(e) {}
      
      // #region agent log
      debugLog('a11y-widget-loader.js:xhr.onload', 'HEAD request success', {lastModified: lastModified, currentVersion: currentVersion, status: xhr.status, allHeaders: allHeaders}, 'A,B,D');
      // #endregion
      
      if (lastModified && lastModified !== currentVersion) {
        // #region agent log
        debugLog('a11y-widget-loader.js:xhr.onload', 'Update detected - calling forceReloadWidget', {lastModified: lastModified, currentVersion: currentVersion}, 'D');
        // #endregion
        // Widget has been updated, force reload
        localStorage.setItem(WIDGET_VERSION_KEY, lastModified);
        forceReloadWidget();
      } else {
        // #region agent log
        debugLog('a11y-widget-loader.js:xhr.onload', 'No update detected', {lastModified: lastModified, currentVersion: currentVersion, areEqual: lastModified === currentVersion}, 'B,D');
        // #endregion
      }
    };
    xhr.onerror = function() {
      // #region agent log
      debugLog('a11y-widget-loader.js:xhr.onerror', 'HEAD request failed - trying GET fallback', {status: xhr.status, readyState: xhr.readyState}, 'A');
      // #endregion
      // If HEAD fails, try GET with small range
      var xhr2 = new XMLHttpRequest();
      xhr2.open('GET', GITHUB_RAW_BASE + "a11y-widget.js?nocache=" + now, true);
      xhr2.setRequestHeader('Range', 'bytes=0-100');
      xhr2.onload = function() {
        var lastModified = xhr2.getResponseHeader('Last-Modified') || xhr2.getResponseHeader('Date');
        var currentVersion = localStorage.getItem(WIDGET_VERSION_KEY);
        
        // #region agent log
        debugLog('a11y-widget-loader.js:xhr2.onload', 'GET fallback success', {lastModified: lastModified, currentVersion: currentVersion, status: xhr2.status}, 'A,B,D');
        // #endregion
        
        if (lastModified && lastModified !== currentVersion) {
          // #region agent log
          debugLog('a11y-widget-loader.js:xhr2.onload', 'Update detected in fallback - calling forceReloadWidget', {lastModified: lastModified, currentVersion: currentVersion}, 'D');
          // #endregion
          localStorage.setItem(WIDGET_VERSION_KEY, lastModified);
          forceReloadWidget();
        }
      };
      xhr2.onerror = function() {
        // #region agent log
        debugLog('a11y-widget-loader.js:xhr2.onerror', 'GET fallback also failed', {status: xhr2.status, readyState: xhr2.readyState}, 'A');
        // #endregion
      };
      xhr2.send();
    };
    xhr.send();
  }
  
  function forceReloadWidget() {
    // #region agent log
    debugLog('a11y-widget-loader.js:forceReloadWidget', 'forceReloadWidget called', {hasWidget: !!window.__a11yWidget}, 'D');
    // #endregion
    // Remove existing widget completely
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
    
    // Remove widget DOM elements
    var widgetRoot = document.getElementById("a11y-widget-root");
    if (widgetRoot) {
      widgetRoot.remove();
    }
    var widgetToggle = document.getElementById("a11y-widget-toggle");
    if (widgetToggle) {
      widgetToggle.remove();
    }
    
    // Reset widget state
    if (window.__a11yWidget) {
      window.__a11yWidget.__loaded = false;
      delete window.__a11yWidget;
    }
    
    // Reload widget
    loadWidget();
  }
  
  function loadWidget() {
    // #region agent log
    debugLog('a11y-widget-loader.js:loadWidget', 'loadWidget called', {timestamp: Date.now()}, 'E');
    // #endregion
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
  
    // Always load fresh CSS from jsDelivr CDN (serves with correct content-type)
    // Use milliseconds timestamp + multiple random values for maximum cache-busting effectiveness
    // jsDelivr may cache aggressively, so we use multiple cache-busting parameters
    var timestamp = Date.now(); // Use milliseconds for better cache busting
    var random1 = Math.random().toString(36).substring(7);
    var random2 = Math.random().toString(36).substring(7);
    var random3 = Math.random().toString(36).substring(7);
    var cssLink = document.createElement("link");
    cssLink.id = "a11y-widget-stylesheet";
    cssLink.rel = "stylesheet";
    // Use jsDelivr CDN first (serves CSS with correct text/css content-type)
    // GitHub raw serves files as text/plain, which browsers reject
    // Use widget files version in URL path to bypass jsDelivr cache (creates new URL)
    var cssUrl = CDN_BASE + "a11y-widget.css?v=" + WIDGET_FILES_VERSION + "&_=" + timestamp + "&nocache=" + timestamp;
    cssLink.href = cssUrl;
    cssLink.crossOrigin = "anonymous";
    
    // #region agent log
    debugLog('a11y-widget-loader.js:loadWidget', 'Loading CSS', {cssUrl: cssUrl, timestamp: timestamp}, 'E');
    // #endregion
    
    // Track CSS load success
    cssLink.onload = function() {
      // #region agent log
      debugLog('a11y-widget-loader.js:cssLink.onload', 'CSS loaded successfully', {cssUrl: cssLink.href}, 'E');
      // #endregion
      console.log('[A11Y] CSS loaded from:', cssLink.href);
    };
    
    // Fallback to raw GitHub if jsDelivr fails (though it may not work due to content-type)
    cssLink.onerror = function() {
      // #region agent log
      debugLog('a11y-widget-loader.js:cssLink.onerror', 'CSS jsDelivr failed - trying raw GitHub (may fail)', {fallbackUrl: GITHUB_RAW_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp}, 'A,E');
      // #endregion
      cssLink.href = GITHUB_RAW_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp;
    };
    
    document.head.appendChild(cssLink);
    
    // Always load fresh widget script from jsDelivr CDN (serves with correct content-type)
    var script = document.createElement("script");
    script.id = "a11y-widget-script";
    // Use jsDelivr CDN first (serves JavaScript with correct application/javascript content-type)
    // GitHub raw serves files as text/plain, which browsers reject
    // Use widget files version in URL path to bypass jsDelivr cache (creates new URL)
    var scriptUrl = CDN_BASE + "a11y-widget.js?v=" + WIDGET_FILES_VERSION + "&_=" + timestamp + "&nocache=" + timestamp;
    script.src = scriptUrl;
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    // #region agent log
    debugLog('a11y-widget-loader.js:loadWidget', 'Loading JS', {scriptUrl: scriptUrl, timestamp: timestamp}, 'E');
    // #endregion
    
    // Track JS load success
    script.onload = function() {
      // #region agent log
      debugLog('a11y-widget-loader.js:script.onload', 'JS loaded successfully', {scriptUrl: script.src}, 'E');
      // #endregion
      console.log('[A11Y] JS loaded from:', script.src);
      // Check if widget initialized
      setTimeout(function() {
        if (window.__a11yWidget && window.__a11yWidget.__loaded) {
          console.log('[A11Y] Widget initialized successfully');
          debugLog('a11y-widget-loader.js:script.onload', 'Widget initialized', {widgetLoaded: true}, 'E');
        } else {
          console.warn('[A11Y] Widget JS loaded but widget not initialized yet');
          debugLog('a11y-widget-loader.js:script.onload', 'Widget not initialized', {widgetLoaded: false, hasWidget: !!window.__a11yWidget}, 'E');
        }
      }, 1000);
    };
    
    // Fallback to raw GitHub if jsDelivr fails (though it may not work due to content-type)
    script.onerror = function() {
      // #region agent log
      debugLog('a11y-widget-loader.js:script.onerror', 'JS jsDelivr failed - trying raw GitHub (may fail)', {fallbackUrl: GITHUB_RAW_BASE + "a11y-widget.js?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp}, 'A,E');
      // #endregion
      script.src = GITHUB_RAW_BASE + "a11y-widget.js?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp;
    };
    
    // Insert before first script or append to head
    var firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
  
  // Check if we need to reload the loader script itself (if cached version is old)
  var currentLoaderVersion = document.currentScript ? document.currentScript.getAttribute("data-version") : null;
  var storedLoaderVersion = localStorage.getItem('__a11y_loader_version');
  
  // #region agent log
  debugLog('a11y-widget-loader.js:init', 'Loader script initialized', {currentLoaderVersion: currentLoaderVersion, storedLoaderVersion: storedLoaderVersion, LOADER_VERSION: LOADER_VERSION, scriptSrc: document.currentScript ? document.currentScript.src : 'unknown'}, 'C');
  // #endregion
  
  // Force reload if stored version doesn't match (handles cached loader scripts)
  if (storedLoaderVersion !== LOADER_VERSION) {
    // #region agent log
    debugLog('a11y-widget-loader.js:init', 'Loader version mismatch - reloading loader', {storedLoaderVersion: storedLoaderVersion, LOADER_VERSION: LOADER_VERSION}, 'C');
    // #endregion
    localStorage.setItem('__a11y_loader_version', LOADER_VERSION);
    
    // If current script version also doesn't match, reload it using versioned filename with jsDelivr
    // Use jsDelivr because GitHub raw serves files as text/plain, which browsers won't execute
    if (currentLoaderVersion && currentLoaderVersion !== LOADER_VERSION) {
      var newLoader = document.createElement("script");
      newLoader.src = CDN_BASE + "a11y-widget-loader-v" + LOADER_VERSION + ".js";
      newLoader.setAttribute("data-version", LOADER_VERSION);
      newLoader.defer = true;
      document.head.appendChild(newLoader);
      return; // Exit, let new loader handle the rest
    }
  }
  
  // Always load widget (don't check if already loaded - force fresh load)
  loadWidget();
  
  // Check for updates immediately and periodically
  // Reduce check interval to 1 minute for faster updates
  checkForUpdates();
  setInterval(checkForUpdates, 60000); // Check every minute instead of 5
  
  // Also check on page visibility change (when user returns to tab)
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
      checkForUpdates();
    }
  });
})();

