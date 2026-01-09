/*! a11y-widget-loader.js — Zero-Config Loader v1.2
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
  var LOADER_VERSION = "1.2"; // Increment this when loader logic changes
  var WIDGET_VERSION_KEY = "__a11y_widget_version";
  var LAST_UPDATE_CHECK_KEY = "__a11y_widget_last_check";
  
  // Check for widget version updates by fetching version from GitHub
  // This ensures we always get the latest widget even if loader is cached
  function checkForUpdates() {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:checkForUpdates',message:'checkForUpdates called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
    // #endregion
    var lastCheck = localStorage.getItem(LAST_UPDATE_CHECK_KEY);
    var now = Date.now();
    // Check every 5 minutes for updates
    if (lastCheck && (now - parseInt(lastCheck, 10)) < 300000) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:checkForUpdates',message:'Skipping check - too soon',data:{lastCheck:lastCheck,now:now,diff:now-parseInt(lastCheck,10)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return; // Skip check if checked recently
    }
    
    localStorage.setItem(LAST_UPDATE_CHECK_KEY, String(now));
    
    // #region agent log
    var currentVersion = localStorage.getItem(WIDGET_VERSION_KEY);
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:checkForUpdates',message:'Before HTTP request',data:{currentVersion:currentVersion,checkUrl:GITHUB_RAW_BASE + "a11y-widget.js?nocache=" + now},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
    // #endregion
    
    // Fetch widget JS to check its version/update time
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', GITHUB_RAW_BASE + "a11y-widget.js?nocache=" + now, true);
    xhr.onload = function() {
      var lastModified = xhr.getResponseHeader('Last-Modified') || xhr.getResponseHeader('Date');
      var currentVersion = localStorage.getItem(WIDGET_VERSION_KEY);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:xhr.onload',message:'HEAD request success',data:{lastModified:lastModified,currentVersion:currentVersion,status:xhr.status,allHeaders:Object.keys(xhr.getAllResponseHeaders ? xhr.getAllResponseHeaders().split('\r\n').reduce((acc,line)=>{var parts=line.split(': ');if(parts.length===2)acc[parts[0]]=parts[1];return acc;},{}) : {})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
      // #endregion
      
      if (lastModified && lastModified !== currentVersion) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:xhr.onload',message:'Update detected - calling forceReloadWidget',data:{lastModified:lastModified,currentVersion:currentVersion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        // Widget has been updated, force reload
        localStorage.setItem(WIDGET_VERSION_KEY, lastModified);
        forceReloadWidget();
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:xhr.onload',message:'No update detected',data:{lastModified:lastModified,currentVersion:currentVersion,areEqual:lastModified===currentVersion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
        // #endregion
      }
    };
    xhr.onerror = function() {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:xhr.onerror',message:'HEAD request failed - trying GET fallback',data:{status:xhr.status,readyState:xhr.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // If HEAD fails, try GET with small range
      var xhr2 = new XMLHttpRequest();
      xhr2.open('GET', GITHUB_RAW_BASE + "a11y-widget.js?nocache=" + now, true);
      xhr2.setRequestHeader('Range', 'bytes=0-100');
      xhr2.onload = function() {
        var lastModified = xhr2.getResponseHeader('Last-Modified') || xhr2.getResponseHeader('Date');
        var currentVersion = localStorage.getItem(WIDGET_VERSION_KEY);
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:xhr2.onload',message:'GET fallback success',data:{lastModified:lastModified,currentVersion:currentVersion,status:xhr2.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
        // #endregion
        
        if (lastModified && lastModified !== currentVersion) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:xhr2.onload',message:'Update detected in fallback - calling forceReloadWidget',data:{lastModified:lastModified,currentVersion:currentVersion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          localStorage.setItem(WIDGET_VERSION_KEY, lastModified);
          forceReloadWidget();
        }
      };
      xhr2.onerror = function() {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:xhr2.onerror',message:'GET fallback also failed',data:{status:xhr2.status,readyState:xhr2.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      };
      xhr2.send();
    };
    xhr.send();
  }
  
  function forceReloadWidget() {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:forceReloadWidget',message:'forceReloadWidget called',data:{hasWidget:!!window.__a11yWidget},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:loadWidget',message:'loadWidget called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
  
    // Always load fresh CSS from GitHub with aggressive cache-busting
    // Use milliseconds timestamp for maximum cache-busting effectiveness
    var timestamp = Date.now(); // Use milliseconds for better cache busting
    var random = Math.random().toString(36).substring(7);
    var cssLink = document.createElement("link");
    cssLink.id = "a11y-widget-stylesheet";
    cssLink.rel = "stylesheet";
    // Use raw GitHub URL for immediate updates (bypasses CDN caching)
    var cssUrl = GITHUB_RAW_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp;
    cssLink.href = cssUrl;
    cssLink.crossOrigin = "anonymous";
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:loadWidget',message:'Loading CSS',data:{cssUrl:cssUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Fallback to jsDelivr if raw GitHub fails
    cssLink.onerror = function() {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:cssLink.onerror',message:'CSS raw GitHub failed - using jsDelivr',data:{fallbackUrl:CDN_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
      // #endregion
      cssLink.href = CDN_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp;
    };
    
    document.head.appendChild(cssLink);
    
    // Always load fresh widget script from GitHub
    var script = document.createElement("script");
    script.id = "a11y-widget-script";
    // Use raw GitHub URL for immediate updates (bypasses CDN caching)
    // Aggressive cache-busting with timestamp + random to ensure fresh loads
    var scriptUrl = GITHUB_RAW_BASE + "a11y-widget.js?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp;
    script.src = scriptUrl;
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:loadWidget',message:'Loading JS',data:{scriptUrl:scriptUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Fallback to jsDelivr if raw GitHub fails
    script.onerror = function() {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:script.onerror',message:'JS raw GitHub failed - using jsDelivr',data:{fallbackUrl:CDN_BASE + "a11y-widget.js?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
      // #endregion
      script.src = CDN_BASE + "a11y-widget.js?v=" + timestamp + "&_=" + random + "&nocache=" + timestamp;
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:init',message:'Loader script initialized',data:{currentLoaderVersion:currentLoaderVersion,LOADER_VERSION:LOADER_VERSION,scriptSrc:document.currentScript ? document.currentScript.src : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (currentLoaderVersion && currentLoaderVersion !== LOADER_VERSION) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'a11y-widget-loader.js:init',message:'Loader version mismatch - reloading loader',data:{currentLoaderVersion:currentLoaderVersion,LOADER_VERSION:LOADER_VERSION},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Loader script is outdated, reload it
    var newLoader = document.createElement("script");
    newLoader.src = GITHUB_RAW_BASE + "a11y-widget-loader.js?v=" + Date.now() + "&_=" + Math.random();
    newLoader.setAttribute("data-version", LOADER_VERSION);
    document.head.appendChild(newLoader);
    return; // Exit, let new loader handle the rest
  }
  
  // Always load widget (don't check if already loaded - force fresh load)
  loadWidget();
  
  // Check for updates periodically
  checkForUpdates();
  
  // Also check on page visibility change (when user returns to tab)
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
      checkForUpdates();
    }
  });
})();

