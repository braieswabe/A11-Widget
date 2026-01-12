/*! a11y-widget-loader-v1.8.0.js — Zero-Config Loader v1.8.0
    Just include this single script tag and the widget loads automatically from GitHub!
    
    Usage:
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.8.0/a11y-widget-loader-v1.8.0.js" defer></script>
    
    Or use the full widget file:
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.8.0/a11y-widget-v1.8.0.js" defer></script>
    
    Version 1.8.0 Changes:
    - Loads widget v1.8.0 with enhanced toolbar (default mode), dropdown menus, and automatic text color adjustment
    - Skip authentication on trusted domains (Vercel demo site, careerdriverhq.com, localhost)
    - Authentication still required for other external websites
    
    Version 1.7.0 Changes:
    - Skip authentication on trusted domains (Vercel demo site, careerdriverhq.com, localhost)
    - Authentication still required for other external websites
    - Loads widget v1.7.0 with toolbar mode and cute logo
*/
// Immediate console log to verify script is loading
// This runs BEFORE the IIFE, so it executes even if there's an error later
// CRITICAL: If you don't see this message, the loader script is cached/old
try {
  console.log('[A11Y Loader] ✅ Script file loaded - v1.8.0 -', new Date().toISOString());
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
  console.log('[A11Y Loader] If you see this, the loader script v1.8.0 is executing');
} catch(e) {
  console.log('[A11Y Loader] Script file parsed but error logging:', e);
}

(function() {
  "use strict";
  
  var GITHUB_REPO = "braieswabe/A11-Widget";
  var GITHUB_BRANCH = "main";
  // Use version tag for CDN to avoid cache issues (jsDelivr caches @main aggressively)
  var WIDGET_VERSION_TAG = "v1.8.0";
  var CDN_BASE = "https://cdn.jsdelivr.net/gh/" + GITHUB_REPO + "@" + WIDGET_VERSION_TAG + "/";
  var GITHUB_RAW_BASE = "https://raw.githubusercontent.com/" + GITHUB_REPO + "/" + GITHUB_BRANCH + "/";
  var LOADER_VERSION = "1.8"; // Increment this when loader logic changes
  var WIDGET_FILES_VERSION = "20260113"; // Increment this when widget CSS/JS files change (format: YYYYMMDD)
  
  // Debug telemetry removed - was causing connection errors
  var LOADER_VERSION_KEY = "__a11y_loader_version";
  var WIDGET_VERSION_KEY = "__a11y_widget_version";
  var LAST_UPDATE_CHECK_KEY = "__a11y_widget_last_check";
  
  // Authentication constants
  var AUTH_STORAGE_KEY = "__a11y_auth_token__";
  var AUTH_API_BASE = window.__A11Y_AUTH_API_BASE__ || "/api/auth";
  var LOGIN_MODAL_ID = "a11y-auth-login-modal";
  var LOGIN_FORM_ID = "a11y-auth-login-form";
  
  // Log that loader script is executing
  console.log('[A11Y] Loader script executing, version:', LOADER_VERSION);
  
  // --- Authentication Functions ------------------------------------------------
  
  // Get stored token
  function getStoredToken() {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  // Store token
  function storeToken(token) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Remove token
  function removeToken() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Validate token with server
  function validateToken(token) {
    return fetch(AUTH_API_BASE + "/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      return null;
    })
    .catch(function(error) {
      console.error("[A11Y Auth] Token validation error:", error);
      return null;
    });
  }

  // Login function
  function login(credentials) {
    return fetch(AUTH_API_BASE + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    })
    .then(function(response) {
      return response.json().then(function(data) {
        if (response.ok && data.success && data.token) {
          storeToken(data.token);
          return { success: true, client: data.client };
        }
        return { success: false, error: data.error || "Login failed" };
      });
    })
    .catch(function(error) {
      console.error("[A11Y Auth] Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    });
  }

  // Create login modal HTML
  function createLoginModal() {
    var modal = document.createElement("div");
    modal.id = LOGIN_MODAL_ID;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "a11y-auth-login-title");
    modal.setAttribute("aria-modal", "true");
    modal.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;";

    modal.innerHTML = '<div style="background: white; border-radius: 8px; padding: 32px; max-width: 400px; width: 90%; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);"><h2 id="a11y-auth-login-title" style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Accessibility Widget Login</h2><form id="' + LOGIN_FORM_ID + '" style="margin: 0;"><div style="margin-bottom: 16px;"><label for="a11y-auth-email" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Email</label><input type="email" id="a11y-auth-email" name="email" required autocomplete="email" style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;" /></div><div style="margin-bottom: 16px;"><label for="a11y-auth-password" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Password</label><input type="password" id="a11y-auth-password" name="password" required autocomplete="current-password" style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;" /></div><div style="margin-bottom: 16px; padding-top: 8px; border-top: 1px solid #eee;"><p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">Or use API Key:</p><input type="text" id="a11y-auth-api-key" name="apiKey" placeholder="Enter API key" autocomplete="off" style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box;" /></div><div id="a11y-auth-error" style="display: none; padding: 12px; margin-bottom: 16px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c33; font-size: 14px;"></div><div style="display: flex; gap: 12px;"><button type="submit" id="a11y-auth-submit" style="flex: 1; padding: 12px 24px; background: #0066cc; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: 500; cursor: pointer;">Login</button></div></form></div>';

    return modal;
  }

  // Show login modal
  function showLoginModal() {
    try {
      var existingModal = document.getElementById(LOGIN_MODAL_ID);
      if (existingModal) {
        existingModal.style.display = "flex";
        existingModal.style.zIndex = "2147483647"; // Ensure it's on top
        return;
      }

      var modal = createLoginModal();
      if (modal && document.body) {
        document.body.appendChild(modal);
        // Ensure modal is visible and on top
        modal.style.display = "flex";
        modal.style.zIndex = "2147483647";
      } else {
        console.error("[A11Y Auth] Failed to create or append login modal");
      }
    } catch (error) {
      console.error("[A11Y Auth] Error showing login modal:", error);
      // Fallback: try to create modal again
      try {
        var modal = createLoginModal();
        if (modal && document.body) {
          document.body.appendChild(modal);
        }
      } catch (e) {
        console.error("[A11Y Auth] Failed to create login modal:", e);
        // Last resort: alert user
        alert("Please log in to access the accessibility widget. If you don't have an account, please contact your administrator.");
      }
    }

    var form = document.getElementById(LOGIN_FORM_ID);
    var errorDiv = document.getElementById("a11y-auth-error");
    var submitBtn = document.getElementById("a11y-auth-submit");
    var emailInput = document.getElementById("a11y-auth-email");
    var passwordInput = document.getElementById("a11y-auth-password");
    var apiKeyInput = document.getElementById("a11y-auth-api-key");

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      var email = emailInput.value.trim();
      var password = passwordInput.value;
      var apiKey = apiKeyInput.value.trim();

      errorDiv.style.display = "none";
      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in...";

      var credentials = {};
      if (apiKey) {
        credentials.apiKey = apiKey;
      } else {
        if (!email || !password) {
          errorDiv.textContent = "Please enter email and password, or API key";
          errorDiv.style.display = "block";
          submitBtn.disabled = false;
          submitBtn.textContent = "Login";
          return;
        }
        credentials.email = email;
        credentials.password = password;
      }

      // Add siteId if available from widget config
      if (window.__A11Y_WIDGET__ && window.__A11Y_WIDGET__.siteId) {
        credentials.siteId = window.__A11Y_WIDGET__.siteId;
      } else if (window.location && window.location.hostname) {
        credentials.siteId = window.location.hostname.replace(/^www\./, "");
      }

      login(credentials).then(function(result) {
        if (result.success) {
          modal.style.display = "none";
          window.dispatchEvent(new CustomEvent("a11y-auth-success", { detail: result.client }));
          // Reload widget if needed
          if (window.__a11yWidget && window.__a11yWidget.reload) {
            window.__a11yWidget.reload();
          } else {
            location.reload();
          }
        } else {
          errorDiv.textContent = result.error || "Login failed. Please try again.";
          errorDiv.style.display = "block";
          submitBtn.disabled = false;
          submitBtn.textContent = "Login";
        }
      });
    });

    if (apiKeyInput.value) {
      apiKeyInput.focus();
    } else {
      emailInput.focus();
    }
  }

  // Hide login modal
  function hideLoginModal() {
    var modal = document.getElementById(LOGIN_MODAL_ID);
    if (modal) {
      modal.style.display = "none";
    }
  }

  // Check if we're on a trusted site that doesn't require authentication
  function isVercelDemoSite() {
    var hostname = window.location.hostname;
    // Skip authentication on trusted domains (demo sites, localhost, and client domains)
    return hostname === 'a11-widget.vercel.app' || 
           hostname.endsWith('.vercel.app') ||
           hostname === 'careerdriverhq.com' ||
           hostname === 'www.careerdriverhq.com' ||
           hostname === 'localhost' ||
           hostname === '127.0.0.1';
  }

  // Check authentication status
  function checkAuth() {
    // Skip authentication check on trusted domains
    if (isVercelDemoSite()) {
      return Promise.resolve({ authenticated: true, client: { demo: true } });
    }
    
    var token = getStoredToken();
    
    if (!token) {
      return Promise.resolve({ authenticated: false });
    }

    return validateToken(token).then(function(result) {
      if (result && result.valid) {
        return { authenticated: true, client: result.client };
      }
      // Token invalid or expired, remove it
      removeToken();
      return { authenticated: false };
    }).catch(function(error) {
      // On any error (including 401), treat as not authenticated and prompt for login
      console.log("[A11Y Auth] Auth check failed, will prompt for login:", error);
      removeToken();
      return { authenticated: false };
    });
  }

  // Expose auth API to window for widget to use
  window.__a11yAuth = {
    checkAuth: checkAuth,
    login: login,
    logout: function() {
      var token = getStoredToken();
      if (token) {
        fetch(AUTH_API_BASE + "/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        }).catch(function(error) {
          console.error("[A11Y Auth] Logout error:", error);
        });
      }
      removeToken();
    },
    showLoginModal: showLoginModal,
    hideLoginModal: hideLoginModal,
    getToken: getStoredToken,
    isAuthenticated: function() {
      return !!getStoredToken();
    }
  };
  
  // Listen for auth required event (from widget button click)
  window.addEventListener("a11y-auth-required", function() {
    showLoginModal();
  });

  // Listen for successful auth
  window.addEventListener("a11y-auth-success", function() {
    // Widget will reload automatically via loader script
  });
  
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
    var lastCheck = localStorage.getItem(LAST_UPDATE_CHECK_KEY);
    var now = Date.now();
    // Check every 1 minute for updates (reduced from 5 minutes for faster updates)
    if (lastCheck && (now - parseInt(lastCheck, 10)) < 60000) {
      return; // Skip check if checked recently
    }
    
    localStorage.setItem(LAST_UPDATE_CHECK_KEY, String(now));
    
    // Fetch widget JS to check its version/update time
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', GITHUB_RAW_BASE + "a11y-widget-v1.8.0.js?nocache=" + now, true);
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
      
      if (lastModified && lastModified !== currentVersion) {
        // Widget has been updated, force reload
        localStorage.setItem(WIDGET_VERSION_KEY, lastModified);
        forceReloadWidget();
      }
    };
    xhr.onerror = function() {
      // If HEAD fails, try GET with small range
      var xhr2 = new XMLHttpRequest();
      xhr2.open('GET', GITHUB_RAW_BASE + "a11y-widget-v1.8.0.js?nocache=" + now, true);
      xhr2.setRequestHeader('Range', 'bytes=0-100');
      xhr2.onload = function() {
        var lastModified = xhr2.getResponseHeader('Last-Modified') || xhr2.getResponseHeader('Date');
        var currentVersion = localStorage.getItem(WIDGET_VERSION_KEY);
        
        if (lastModified && lastModified !== currentVersion) {
          localStorage.setItem(WIDGET_VERSION_KEY, lastModified);
          forceReloadWidget();
        }
      };
      xhr2.onerror = function() {
        // Silent fail - update check is optional
      };
      xhr2.send();
    };
    xhr.send();
  }
  
  function forceReloadWidget() {
    // Remove existing widget completely
    var existingCSS = document.getElementById("a11y-widget-stylesheet") || 
                      document.querySelector('link[href*="a11y-widget.css"]');
    if (existingCSS && existingCSS.parentNode) {
      existingCSS.parentNode.removeChild(existingCSS);
    }
    
    var existingScript = document.getElementById("a11y-widget-script") ||
                         document.querySelector('script[src*="a11y-widget"]');
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
    // Force reload: Always reload CSS and JS to ensure latest version
    // Remove existing CSS and JS to force fresh loads
    var existingCSS = document.getElementById("a11y-widget-stylesheet") || 
                      document.querySelector('link[href*="a11y-widget.css"]');
    if (existingCSS && existingCSS.parentNode) {
      existingCSS.parentNode.removeChild(existingCSS);
    }
    
    var existingScript = document.getElementById("a11y-widget-script") ||
                         document.querySelector('script[src*="a11y-widget"]');
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
    
    // Track CSS load success
    cssLink.onload = function() {
      console.log('[A11Y] CSS loaded from:', cssLink.href);
    };
    
    // Fallback to raw GitHub if jsDelivr fails (though it may not work due to content-type)
    cssLink.onerror = function() {
      cssLink.href = GITHUB_RAW_BASE + "a11y-widget.css?v=" + timestamp + "&_=" + random1 + "&nocache=" + timestamp;
    };
    
    document.head.appendChild(cssLink);
    
    // Always load fresh widget script from jsDelivr CDN (serves with correct content-type)
    var script = document.createElement("script");
    script.id = "a11y-widget-script";
    // Use jsDelivr CDN first (serves JavaScript with correct application/javascript content-type)
    // GitHub raw serves files as text/plain, which browsers reject
    // Use widget files version in URL path to bypass jsDelivr cache (creates new URL)
    // Load v1.8.0 widget file with enhanced toolbar, dropdown menus, and automatic text color adjustment
    var scriptUrl = CDN_BASE + "a11y-widget-v1.8.0.js?v=" + WIDGET_FILES_VERSION + "&_=" + timestamp + "&nocache=" + timestamp;
    script.src = scriptUrl;
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    // Track JS load success
    script.onload = function() {
      console.log('[A11Y] JS loaded from:', script.src);
      // Check if widget initialized
      setTimeout(function() {
        if (window.__a11yWidget && window.__a11yWidget.__loaded) {
          console.log('[A11Y] Widget initialized successfully');
        } else {
          console.warn('[A11Y] Widget JS loaded but widget not initialized yet');
        }
      }, 1000);
    };
    
    // Fallback to raw GitHub if jsDelivr fails (though it may not work due to content-type)
    script.onerror = function() {
      script.src = GITHUB_RAW_BASE + "a11y-widget-v1.8.0.js?v=" + timestamp + "&_=" + random1 + "&nocache=" + timestamp;
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
  
  // Force reload if stored version doesn't match (handles cached loader scripts)
  if (storedLoaderVersion !== LOADER_VERSION) {
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
  
  // Load widget button (authentication will be checked when button is clicked)
  // For non-trusted domains, we still load the widget but authentication is required to use it
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
  
  // Intercept widget button clicks to check authentication
  // This will run after widget loads
  function setupAuthInterceptor() {
    // Skip auth interceptor on Vercel demo site (no authentication required)
    if (isVercelDemoSite()) {
      console.log('[A11Y] Demo site detected - authentication disabled');
      return;
    }
    
    // Wait for widget to load, then intercept button clicks
    var checkInterval = setInterval(function() {
      var toggleButton = document.getElementById("a11y-widget-toggle");
      if (toggleButton && !toggleButton.hasAttribute("data-auth-intercepted")) {
        clearInterval(checkInterval);
        
        // Mark as intercepted to avoid duplicate handlers
        toggleButton.setAttribute("data-auth-intercepted", "true");
        
        // Use event capture phase to intercept clicks BEFORE widget's handler
        var clickHandler = function(e) {
          // Only check auth when opening (not closing)
          var expanded = toggleButton.getAttribute("aria-expanded") === "true";
          if (!expanded) {
            // Stop event immediately to prevent widget from opening
            e.stopImmediatePropagation();
            e.preventDefault();
            
            // Check authentication before opening panel
            checkAuth().then(function(result) {
              if (!result.authenticated) {
                // Not authenticated, show login modal immediately
                showLoginModal();
              } else {
                // Authenticated, allow widget to open by programmatically clicking
                // Remove our handler temporarily and trigger click
                toggleButton.removeEventListener("click", clickHandler, true);
                var syntheticEvent = new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                toggleButton.dispatchEvent(syntheticEvent);
                // Re-add handler after a short delay
                setTimeout(function() {
                  toggleButton.addEventListener("click", clickHandler, true);
                }, 100);
              }
            }).catch(function(error) {
              // On any error (including 401), show login modal instead of error
              // Silently handle errors - don't log to avoid confusion with other scripts' errors
              showLoginModal();
            });
          }
          // If closing (expanded=true), always allow it
        };
        
        toggleButton.addEventListener("click", clickHandler, true); // Use capture phase to run before widget's handler
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(function() {
      clearInterval(checkInterval);
    }, 10000);
  }
  
  // Setup auth interceptor after DOM is ready and widget loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      setTimeout(setupAuthInterceptor, 1000); // Wait for widget to initialize
    });
  } else {
    setTimeout(setupAuthInterceptor, 1000);
  }
  
  // Also listen for widget initialization
  var widgetCheckInterval = setInterval(function() {
    if (window.__a11yWidget && window.__a11yWidget.__loaded) {
      clearInterval(widgetCheckInterval);
      setupAuthInterceptor();
    }
  }, 200);
  
  setTimeout(function() {
    clearInterval(widgetCheckInterval);
  }, 10000);
})();

