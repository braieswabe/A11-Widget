/*! a11y-widget-loader-v1.6.7.js — Zero-Config Loader v1.6.7
    Usage:
    <script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.7/a11y-widget-loader-v1.6.7.js" defer></script>
*/
(function () {
  "use strict";

  var GITHUB_REPO = "braieswabe/A11-Widget";
  var DEFAULT_VERSION_TAG = "v1.6.7";
  var LOADER_VERSION = "1.6.7";
  var CSS_FILE = "a11y-widget.css";
  var JS_FILE = "a11y-widget-v1.6.7.js";

  function detectVersionTag() {
    try {
      var src = "";
      if (document.currentScript && document.currentScript.src) {
        src = document.currentScript.src;
      } else {
        var scripts = document.querySelectorAll('script[src*="a11y-widget-loader"]');
        if (scripts.length) {
          src = scripts[scripts.length - 1].src || "";
        }
      }
      var match = src.match(/@([^/]+)\//);
      if (match && match[1]) return match[1];
    } catch (e) {}
    return DEFAULT_VERSION_TAG;
  }

  var VERSION_TAG = detectVersionTag();

  var ASSET_BASE = window.__A11Y_ASSET_BASE__ || null;
  if (ASSET_BASE && !ASSET_BASE.endsWith("/")) {
    ASSET_BASE = ASSET_BASE + "/";
  }

  var CDN_BASE = ASSET_BASE || ("https://cdn.jsdelivr.net/gh/" + GITHUB_REPO + "@" + VERSION_TAG + "/");
  var RAW_BASE = ASSET_BASE || ("https://raw.githubusercontent.com/" + GITHUB_REPO + "/main/");

  function withCache(url) {
    var sep = url.indexOf("?") === -1 ? "?" : "&";
    return url + sep + "v=" + encodeURIComponent(VERSION_TAG + "-" + Date.now());
  }

  function ensureStylesheet() {
    var existing = document.getElementById("a11y-widget-stylesheet") ||
      document.querySelector('link[href*="a11y-widget.css"]');
    if (existing) return;

    var link = document.createElement("link");
    link.id = "a11y-widget-stylesheet";
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.href = withCache(CDN_BASE + CSS_FILE);
    link.onerror = function () {
      link.href = withCache(RAW_BASE + CSS_FILE);
    };
    document.head.appendChild(link);
  }

  function initWidgetIfReady() {
    if (typeof window.__a11yWidgetInit === "function" && !window.__a11yWidgetLoaderBooted) {
      window.__a11yWidgetLoaderBooted = true;
      window.__a11yWidgetInit(window.__A11Y_WIDGET__);
    }
  }

  function waitForWidgetReady(timeoutMs) {
    timeoutMs = timeoutMs || 5000;
    return new Promise(function(resolve, reject) {
      var started = Date.now();
      function check() {
        if (window.__a11yWidget && window.__a11yWidget.__loaded) {
          resolve(window.__a11yWidget);
          return;
        }
        if (typeof window.__a11yWidgetInit === "function") {
          initWidgetIfReady();
        }
        if (Date.now() - started >= timeoutMs) {
          reject(new Error("Accessibility widget failed to initialize before timeout"));
          return;
        }
        setTimeout(check, 50);
      }
      check();
    });
  }

  window.__initA11yWidget = window.__initA11yWidget || function(config) {
    if (config && typeof config === "object") {
      window.__A11Y_WIDGET__ = Object.assign(window.__A11Y_WIDGET__ || {}, config);
    }
    ensureStylesheet();
    ensureWidgetScript();
    return waitForWidgetReady(5000);
  };

  function ensureWidgetScript() {
    if (window.__a11yWidget && window.__a11yWidget.__loaded) {
      return;
    }

    var existing = document.getElementById("a11y-widget-script") ||
      document.querySelector('script[src*="a11y-widget-v1.6.7.js"],script[src*="a11y-widget.js"]');
    if (existing) {
      if (existing.dataset && existing.dataset.loaded === "true") {
        initWidgetIfReady();
      } else {
        existing.addEventListener("load", initWidgetIfReady, { once: true });
      }
      return;
    }

    var script = document.createElement("script");
    script.id = "a11y-widget-script";
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = withCache(CDN_BASE + JS_FILE);
    script.onload = function () {
      script.dataset.loaded = "true";
      initWidgetIfReady();
    };
    script.onerror = function () {
      script.src = withCache(RAW_BASE + JS_FILE);
    };
    document.head.appendChild(script);
  }

  function boot() {
    ensureStylesheet();
    ensureWidgetScript();
    window.__a11yWidgetLoaderVersion = LOADER_VERSION;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
