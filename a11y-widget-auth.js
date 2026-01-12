/*! a11y-widget-auth.js — Authentication Module for Accessibility Widget
    Handles user authentication before widget can be used
*/
(function() {
  "use strict";

  var AUTH_STORAGE_KEY = "__a11y_auth_token__";
  var AUTH_API_BASE = window.__A11Y_AUTH_API_BASE__ || "/api/auth";
  var LOGIN_MODAL_ID = "a11y-auth-login-modal";
  var LOGIN_FORM_ID = "a11y-auth-login-form";

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

  // Logout function
  function logout() {
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
  }

  // Create login modal HTML
  function createLoginModal() {
    var modal = document.createElement("div");
    modal.id = LOGIN_MODAL_ID;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "a11y-auth-login-title");
    modal.setAttribute("aria-modal", "true");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      ">
        <h2 id="a11y-auth-login-title" style="
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
        ">Accessibility Widget Login</h2>
        
        <form id="${LOGIN_FORM_ID}" style="margin: 0;">
          <div style="margin-bottom: 16px;">
            <label for="a11y-auth-email" style="
              display: block;
              margin-bottom: 8px;
              font-weight: 500;
              color: #333;
            ">Email</label>
            <input 
              type="email" 
              id="a11y-auth-email" 
              name="email"
              required
              autocomplete="email"
              style="
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                box-sizing: border-box;
              "
            />
          </div>
          
          <div style="margin-bottom: 16px;">
            <label for="a11y-auth-password" style="
              display: block;
              margin-bottom: 8px;
              font-weight: 500;
              color: #333;
            ">Password</label>
            <input 
              type="password" 
              id="a11y-auth-password" 
              name="password"
              required
              autocomplete="current-password"
              style="
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                box-sizing: border-box;
              "
            />
          </div>
          
          <div style="margin-bottom: 16px; padding-top: 8px; border-top: 1px solid #eee;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">Or use API Key:</p>
            <input 
              type="text" 
              id="a11y-auth-api-key" 
              name="apiKey"
              placeholder="Enter API key"
              autocomplete="off"
              style="
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                box-sizing: border-box;
              "
            />
          </div>
          
          <div id="a11y-auth-error" style="
            display: none;
            padding: 12px;
            margin-bottom: 16px;
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 4px;
            color: #c33;
            font-size: 14px;
          "></div>
          
          <div style="display: flex; gap: 12px;">
            <button 
              type="submit"
              id="a11y-auth-submit"
              style="
                flex: 1;
                padding: 12px 24px;
                background: #0066cc;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
              "
            >Login</button>
          </div>
        </form>
      </div>
    `;

    return modal;
  }

  // Show login modal
  function showLoginModal() {
    var existingModal = document.getElementById(LOGIN_MODAL_ID);
    if (existingModal) {
      existingModal.style.display = "flex";
      return;
    }

    var modal = createLoginModal();
    document.body.appendChild(modal);

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

      // Hide error
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
          // Hide modal
          modal.style.display = "none";
          // Trigger auth success event
          window.dispatchEvent(new CustomEvent("a11y-auth-success", { detail: result.client }));
          // Reload widget
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

    // Focus first input
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

  // Check authentication status
  function checkAuth() {
    var token = getStoredToken();
    
    if (!token) {
      return Promise.resolve({ authenticated: false });
    }

    return validateToken(token).then(function(result) {
      if (result && result.valid) {
        return { authenticated: true, client: result.client };
      }
      // Token invalid, remove it
      removeToken();
      return { authenticated: false };
    });
  }

  // Public API
  window.__a11yAuth = {
    checkAuth: checkAuth,
    login: login,
    logout: logout,
    showLoginModal: showLoginModal,
    hideLoginModal: hideLoginModal,
    getToken: getStoredToken,
    isAuthenticated: function() {
      return !!getStoredToken();
    }
  };

  // Auto-check auth on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      checkAuth().then(function(result) {
        if (!result.authenticated) {
          showLoginModal();
        }
      });
    });
  } else {
    checkAuth().then(function(result) {
      if (!result.authenticated) {
        showLoginModal();
      }
    });
  }
})();
