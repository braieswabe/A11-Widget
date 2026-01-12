/*! a11y-widget.js — Accessibility Widget v1 (IIFE, no deps)
    Scope: widget UI + configured surfaces only.
    No claims of full-site ADA compliance.
    
    GitHub Repository: https://github.com/braieswabe/A11-Widget
    CDN: https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/
    
    Note: For version 1.7.0 with toolbar mode and keyboard instructions, use a11y-widget-v1.7.0.js
*/
(function () {
  "use strict";

  // GitHub repository configuration
  var GITHUB_REPO = "braieswabe/A11-Widget";
  var GITHUB_BRANCH = "main";
  var CDN_BASE = "https://cdn.jsdelivr.net/gh/" + GITHUB_REPO + "@" + GITHUB_BRANCH + "/";

  var DEFAULTS = {
    siteId: null,                    // Auto-detected from window.location.hostname if not provided
    position: "right",               // left|right
    locale: "en",
    zIndex: 2147483000,
    initialOpen: false,
    enableTelemetry: false,
    telemetryEndpoint: null,         // Optional: backend endpoint for telemetry
    keyboardShortcut: "Alt+A",       // Global keyboard shortcut to open/close widget (Alt+A, Ctrl+Alt+A, or null to disable)
    globalMode: false,               // If true, apply transformations to entire website (not just declared surfaces)
    surfaces: ["body"],              // CSS selectors to mark as data-a11y-surface="true" (ignored if globalMode is true)
    features: {
      contrast: true,
      fontScale: true,
      spacing: true,
      reduceMotion: true,
      readableFont: true,
      presets: true,
      reset: true,
      skipLink: true,
      // Advanced features
      textToSpeech: true,        // Text-to-speech reading
      translation: true,         // Language translation
      readingRuler: true,        // Reading ruler line
      screenMask: true,          // Screen mask/dim distractions
      textOnlyMode: true,        // Text-only mode
      margins: true,             // Adjustable margins
      cursorOptions: true,       // Custom cursor
      dictionary: true,          // Dictionary lookup
      magnifier: true            // Page magnifier
    },
    branding: { show: true },
    storageKey: "__a11yWidgetPrefs__"
  };

  // --- Helpers --------------------------------------------------------------
  function assign(target, src) {
    if (!src) return target;
    for (var k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
      if (src[k] && typeof src[k] === "object" && !Array.isArray(src[k])) {
        target[k] = assign(target[k] || {}, src[k]);
      } else {
        target[k] = src[k];
      }
    }
    return target;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function normalizeHexColor(value, fallback) {
    if (typeof value !== "string") return fallback;
    var v = value.trim();
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : fallback;
  }

  function safeJSONParse(v) {
    try { return JSON.parse(v); } catch (e) { return null; }
  }

  function nowISO() {
    try { return new Date().toISOString(); } catch (e) { return ""; }
  }

  // --- Storage (localStorage with cookie fallback) --------------------------
  var Store = {
    get: function (key) {
      try {
        var v = window.localStorage.getItem(key);
        if (v) return safeJSONParse(v);
      } catch (e) {}
      // cookie fallback (very small)
      var m = document.cookie.match(new RegExp("(?:^|; )" + key.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)"));
      if (m) return safeJSONParse(decodeURIComponent(m[1]));
      return null;
    },
    set: function (key, obj) {
      var v = JSON.stringify(obj);
      try {
        window.localStorage.setItem(key, v);
        return;
      } catch (e) {}
      // cookie fallback (7 days)
      var exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = key + "=" + encodeURIComponent(v) + "; expires=" + exp + "; path=/; SameSite=Lax";
    },
    clear: function (key) {
      try { window.localStorage.removeItem(key); } catch (e) {}
      document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
    }
  };

  // --- Preferences ----------------------------------------------------------
  var PREF_DEFAULTS = {
    contrast: "default",             // default|high|dark|light
    fontScale: 1.0,                  // 1.0–1.6
    spacing: "normal",               // normal|comfortable|max
    readableFont: false,
    reduceMotion: false,
    globalMode: false,               // Apply transformations to entire website (not just surfaces)
    globalModeFont: "system",        // Font family: system|arial|times|courier|comic|verdana|georgia|trebuchet
    globalModeBgColor: "#ffffff",    // Background color (hex)
    // Advanced features preferences
    textToSpeechEnabled: false,
    textToSpeechVoice: null,         // Voice name or null for default
    textToSpeechRate: 1.0,           // 0.1–10
    textToSpeechPitch: 1.0,          // 0–2
    textToSpeechVolume: 1.0,         // 0–1
    translationEnabled: false,
    translationLanguage: "en",       // Target language code
    readingRulerEnabled: false,
    readingRulerHeight: 3,           // Ruler height in pixels
    readingRulerColor: "#0066cc",    // Ruler color
    screenMaskEnabled: false,
    screenMaskOpacity: 0.5,          // 0–1
    screenMaskRadius: 200,           // Focus radius in pixels
    textOnlyMode: false,
    marginsEnabled: false,
    marginsSize: 0,                  // Margin size in pixels (0–200)
    cursorEnabled: false,
    cursorSize: "medium",            // small|medium|large|extra-large
    cursorColor: "#ffffff",          // Cursor color (hex)
    dictionaryEnabled: false,
    magnifierEnabled: false,
    magnifierZoom: 2.0,              // Zoom level (1.5–5.0)
    toolbarMode: false               // Toolbar mode (floating bottom toolbar)
  };

  function normalizePrefs(p) {
    p = p || {};
    var cursorSize = (p.cursorSize === "small" || p.cursorSize === "medium" || p.cursorSize === "large" || p.cursorSize === "extra-large")
      ? p.cursorSize
      : "medium";
    if (!!p.cursorEnabled && !cursorSize) {
      cursorSize = "medium";
    }
    var out = {
      contrast: (p.contrast === "high" || p.contrast === "dark" || p.contrast === "light") ? p.contrast : "default",
      fontScale: clamp(Number(p.fontScale || 1.0), 1.0, 1.6),
      spacing: (p.spacing === "comfortable" || p.spacing === "max") ? p.spacing : "normal",
      readableFont: !!p.readableFont,
      reduceMotion: !!p.reduceMotion,
      globalMode: !!p.globalMode,
      globalModeFont: p.globalModeFont || "system",
      globalModeBgColor: p.globalModeBgColor || "#ffffff",
      // Advanced features
      textToSpeechEnabled: !!p.textToSpeechEnabled,
      textToSpeechVoice: p.textToSpeechVoice || null,
      textToSpeechRate: clamp(Number(p.textToSpeechRate || 1.0), 0.1, 10),
      textToSpeechPitch: clamp(Number(p.textToSpeechPitch || 1.0), 0, 2),
      textToSpeechVolume: clamp(Number(p.textToSpeechVolume || 1.0), 0, 1),
      translationEnabled: !!p.translationEnabled,
      translationLanguage: p.translationLanguage || "en",
      readingRulerEnabled: !!p.readingRulerEnabled,
      readingRulerHeight: clamp(Number(p.readingRulerHeight || 3), 1, 10),
      readingRulerColor: p.readingRulerColor || "#0066cc",
      screenMaskEnabled: !!p.screenMaskEnabled,
      screenMaskOpacity: clamp(Number(p.screenMaskOpacity || 0.5), 0, 1),
      screenMaskRadius: clamp(Number(p.screenMaskRadius || 200), 50, 500),
      textOnlyMode: !!p.textOnlyMode,
      marginsEnabled: !!p.marginsEnabled,
      marginsSize: clamp(Number(p.marginsSize || 0), 0, 200),
      cursorEnabled: !!p.cursorEnabled,
      cursorSize: cursorSize,
      cursorColor: normalizeHexColor(p.cursorColor, PREF_DEFAULTS.cursorColor),
      dictionaryEnabled: !!p.dictionaryEnabled,
      magnifierEnabled: !!p.magnifierEnabled,
      magnifierZoom: clamp(Number(p.magnifierZoom || 2.0), 1.5, 5.0),
      toolbarMode: !!p.toolbarMode,
      globalMode: !!p.globalMode
    };
    return out;
  }

  // --- Apply to DOM ---------------------------------------------------------
  function applyPrefs(prefs) {
    var html = document.documentElement;
    html.setAttribute("data-a11y", "true");
    html.setAttribute("data-a11y-global-mode", prefs.globalMode ? "1" : "0");
    html.setAttribute("data-a11y-global-font", prefs.globalModeFont || "system"); // Set global font attribute
    html.setAttribute("data-a11y-contrast", prefs.contrast);
    html.setAttribute("data-a11y-spacing", prefs.spacing);
    html.setAttribute("data-a11y-readable-font", prefs.readableFont ? "1" : "0");
    html.setAttribute("data-a11y-reduce-motion", prefs.reduceMotion ? "1" : "0");
    // Advanced features
    html.setAttribute("data-a11y-reading-ruler", prefs.readingRulerEnabled ? "1" : "0");
    html.setAttribute("data-a11y-screen-mask", prefs.screenMaskEnabled ? "1" : "0");
    html.setAttribute("data-a11y-text-only", prefs.textOnlyMode ? "1" : "0");
    html.setAttribute("data-a11y-margins", prefs.marginsEnabled ? "1" : "0");
    html.setAttribute("data-a11y-cursor", prefs.cursorEnabled ? prefs.cursorSize : "0");
    html.setAttribute("data-a11y-magnifier", prefs.magnifierEnabled ? "1" : "0");
    html.setAttribute("data-a11y-dictionary", prefs.dictionaryEnabled ? "1" : "0");
    html.setAttribute("data-a11y-translation", prefs.translationEnabled ? prefs.translationLanguage : "0");
    // CSS variables
    html.style.setProperty("--a11y-font-scale", String(prefs.fontScale));
    html.style.setProperty("--a11y-global-bg-color", prefs.globalModeBgColor || "#ffffff");
    html.style.setProperty("--a11y-reading-ruler-height", String(prefs.readingRulerHeight) + "px");
    html.style.setProperty("--a11y-reading-ruler-color", prefs.readingRulerColor);
    html.style.setProperty("--a11y-screen-mask-opacity", String(prefs.screenMaskOpacity));
    html.style.setProperty("--a11y-screen-mask-radius", String(prefs.screenMaskRadius) + "px");
    html.style.setProperty("--a11y-margins-size", String(prefs.marginsSize) + "px");
    html.style.setProperty("--a11y-magnifier-zoom", String(prefs.magnifierZoom));
    html.style.setProperty("--a11y-cursor-color", prefs.cursorColor || PREF_DEFAULTS.cursorColor);
    
    // Initialize/remove reading aids dynamically
    if (prefs.readingRulerEnabled) {
      createReadingRuler(prefs);
    } else {
      removeReadingRuler();
    }
    
    if (prefs.screenMaskEnabled) {
      createScreenMask(prefs);
    } else {
      removeScreenMask();
    }
    
    if (prefs.magnifierEnabled) {
      createMagnifier(prefs);
    } else {
      removeMagnifier();
    }
    
    // Initialize/remove custom cursor
    if (prefs.cursorEnabled && prefs.cursorSize) {
      createCustomCursor(prefs);
    } else {
      removeCustomCursor();
    }
    
    // Stop speech if disabled
    if (!prefs.textToSpeechEnabled) {
      stopSpeech();
    }
    
    // Apply or remove translation
    if (prefs.translationEnabled && prefs.translationLanguage && prefs.translationLanguage !== "en") {
      applyTranslation(prefs);
    } else {
      removeTranslation();
    }
  }

  function markSurfaces(selectors, globalMode) {
    // If global mode is enabled, mark all elements
    if (globalMode) {
      try {
        var allElements = document.querySelectorAll("*");
        for (var k = 0; k < allElements.length; k++) {
          // Skip widget elements
          if (allElements[k].id && allElements[k].id.indexOf("a11y-widget") === 0) continue;
          allElements[k].setAttribute("data-a11y-surface", "true");
        }
      } catch (e) {
        // Fallback: mark body and all descendants
        try {
          var body = document.body;
          if (body) {
            body.setAttribute("data-a11y-surface", "true");
            var descendants = body.querySelectorAll("*");
            for (var d = 0; d < descendants.length; d++) {
              if (descendants[d].id && descendants[d].id.indexOf("a11y-widget") === 0) continue;
              descendants[d].setAttribute("data-a11y-surface", "true");
            }
          }
        } catch (e2) {
          // Ignore errors
        }
      }
      return;
    }
    
    // Otherwise, use selectors as before
    selectors = selectors && selectors.length ? selectors : ["body"];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var nodes = document.querySelectorAll(selectors[i]);
        for (var j = 0; j < nodes.length; j++) {
          nodes[j].setAttribute("data-a11y-surface", "true");
        }
      } catch (e) {
        // ignore invalid selectors
      }
    }
  }

  // --- Telemetry ------------------------------------------------------------
  function emit(cfg, evt, payload) {
    if (!cfg.enableTelemetry) return;
    try {
      var detail = assign({ event: evt, siteId: cfg.siteId, ts: nowISO() }, payload || {});
      window.dispatchEvent(new CustomEvent("a11yWidget:event", { detail: detail }));
      
      // Optional: POST to backend if telemetryEndpoint is configured
      if (cfg.telemetryEndpoint && typeof fetch !== "undefined") {
        fetch(cfg.telemetryEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId: cfg.siteId,
            event: evt,
            payload: payload || {},
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        }).catch(function() {
          // Silently fail - don't break widget if backend is unavailable
        });
      }
    } catch (e) {}
  }

  // --- Text-to-Speech Handler -----------------------------------------------
  var speechSynthesis = window.speechSynthesis || null;
  var currentUtterance = null;

  function getAvailableVoices() {
    if (!speechSynthesis) return [];
    var voices = speechSynthesis.getVoices();
    return voices.length > 0 ? voices : [];
  }

  function speakText(text, prefs) {
    if (!speechSynthesis || !text) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = prefs.textToSpeechRate || 1.0;
    utterance.pitch = prefs.textToSpeechPitch || 1.0;
    utterance.volume = prefs.textToSpeechVolume || 1.0;
    
    var voices = getAvailableVoices();
    var selectedVoice = null;
    
    if (prefs.textToSpeechVoice) {
      selectedVoice = voices.find(function(v) { return v.name === prefs.textToSpeechVoice; });
    }
    
    // If no voice selected or Siri-like voice requested, find best Siri-like voice
    if (!selectedVoice) {
      // Look for Siri-like voices (enhanced, premium voices on macOS/iOS)
      // Common Siri voice names: Samantha, Alex, Victoria, Daniel, Karen, etc.
      var siriLikeNames = ["Samantha", "Alex", "Victoria", "Daniel", "Karen", "Moira", "Tessa", "Veena", "Fiona", "Siri"];
      for (var i = 0; i < siriLikeNames.length; i++) {
        selectedVoice = voices.find(function(v) { 
          return v.name.indexOf(siriLikeNames[i]) !== -1 || 
                 (v.name.toLowerCase().indexOf("enhanced") !== -1 && v.lang.indexOf("en") === 0);
        });
        if (selectedVoice) break;
      }
      
      // If still no voice found, prefer enhanced/premium voices
      if (!selectedVoice) {
        selectedVoice = voices.find(function(v) { 
          return v.name.toLowerCase().indexOf("enhanced") !== -1 || 
                 v.name.toLowerCase().indexOf("premium") !== -1;
        });
      }
      
      // Fallback: use default system voice (usually best quality)
      if (!selectedVoice && voices.length > 0) {
        // Prefer voices with "en" language
        selectedVoice = voices.find(function(v) { return v.lang.indexOf("en") === 0; }) || voices[0];
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
    
    return utterance;
  }

  function stopSpeech() {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      currentUtterance = null;
    }
  }

  function getPageText() {
    var surfaces = document.querySelectorAll("[data-a11y-surface='true']");
    var text = "";
    for (var i = 0; i < surfaces.length; i++) {
      text += surfaces[i].innerText || surfaces[i].textContent || "";
      text += " ";
    }
    
    // Try to extract text from PDFs if available (synchronous cache check only)
    var pdfText = extractPDFTextFromPageSync();
    if (pdfText) {
      text += " " + pdfText;
    }
    
    return text.trim();
  }

  // PDF text extraction support
  var pdfTextCache = {};
  
  function extractPDFTextFromPageSync() {
    var pdfText = "";
    
    // Find PDF elements on the page
    var pdfElements = document.querySelectorAll('iframe[src*=".pdf"], embed[src*=".pdf"], object[data*=".pdf"]');
    
    for (var i = 0; i < pdfElements.length; i++) {
      var element = pdfElements[i];
      var pdfUrl = element.src || element.data;
      
      if (pdfUrl && pdfUrl.indexOf(".pdf") !== -1) {
        // Check cache first (synchronous)
        if (pdfTextCache[pdfUrl]) {
          pdfText += " " + pdfTextCache[pdfUrl];
        } else {
          // Try to extract text asynchronously and cache for next time
          // Note: This won't be available immediately, but will be cached for future calls
          extractPDFText(pdfUrl).then(function(result) {
            if (result && result.text) {
              pdfTextCache[result.url] = result.text;
            }
          }).catch(function() {
            // Ignore errors - PDF extraction may fail due to CORS
          });
        }
      }
    }
    
    return pdfText.trim();
  }

  function extractPDFText(pdfUrl) {
    return new Promise(function(resolve, reject) {
      // Check if PDF.js is available
      if (typeof window.pdfjsLib === "undefined") {
        // Try to load PDF.js dynamically
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = function() {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          performPDFExtraction(pdfUrl, resolve, reject);
        };
        script.onerror = function() {
          reject(new Error("PDF.js failed to load"));
        };
        document.head.appendChild(script);
      } else {
        performPDFExtraction(pdfUrl, resolve, reject);
      }
    });
  }

  function performPDFExtraction(pdfUrl, resolve, reject) {
    try {
      window.pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
        var textPromises = [];
        
        // Extract text from all pages
        for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          textPromises.push(
            pdf.getPage(pageNum).then(function(page) {
              return page.getTextContent().then(function(textContent) {
                var pageText = "";
                for (var i = 0; i < textContent.items.length; i++) {
                  pageText += textContent.items[i].str + " ";
                }
                return pageText;
              });
            })
          );
        }
        
        Promise.all(textPromises).then(function(pages) {
          var fullText = pages.join(" ");
          resolve({ url: pdfUrl, text: fullText });
        }).catch(reject);
      }).catch(function(error) {
        // CORS or other error - silently fail
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  }

  function getSelectedText() {
    if (window.getSelection) {
      return window.getSelection().toString();
    } else if (document.selection && document.selection.type !== "Control") {
      return document.selection.createRange().text;
    }
    return "";
  }

  // --- Reading Ruler Handler -------------------------------------------------
  var readingRulerElement = null;
  var readingRulerHandler = null;

  function createReadingRuler(prefs) {
    if (readingRulerElement) {
      readingRulerElement.remove();
    }
    if (readingRulerHandler) {
      document.removeEventListener("mousemove", readingRulerHandler);
    }
    
    readingRulerElement = document.createElement("div");
    readingRulerElement.id = "a11y-reading-ruler";
    readingRulerElement.style.cssText = 
      "position: fixed; " +
      "pointer-events: none; " +
      "z-index: 2147482999; " +
      "height: " + (prefs.readingRulerHeight || 3) + "px; " +
      "background: " + (prefs.readingRulerColor || "#0066cc") + "; " +
      "opacity: 0.6; " +
      "display: none; " +
      "transition: top 0.1s ease-out;";
    document.body.appendChild(readingRulerElement);
    
    readingRulerHandler = function(e) {
      var html = document.documentElement;
      var enabled = html.getAttribute("data-a11y-reading-ruler") === "1";
      if (enabled && readingRulerElement) {
        var height = parseInt(html.style.getPropertyValue("--a11y-reading-ruler-height") || "3px", 10);
        readingRulerElement.style.display = "block";
        readingRulerElement.style.top = (e.clientY - height / 2) + "px";
        readingRulerElement.style.left = "0";
        readingRulerElement.style.width = "100%";
      } else if (readingRulerElement) {
        readingRulerElement.style.display = "none";
      }
    };
    
    document.addEventListener("mousemove", readingRulerHandler);
  }

  function removeReadingRuler() {
    if (readingRulerElement) {
      readingRulerElement.remove();
      readingRulerElement = null;
    }
    if (readingRulerHandler) {
      document.removeEventListener("mousemove", readingRulerHandler);
      readingRulerHandler = null;
    }
  }

  // --- Screen Mask Handler ----------------------------------------------------
  var screenMaskElement = null;
  var screenMaskHandler = null;

  function createScreenMask(prefs) {
    if (screenMaskElement) {
      screenMaskElement.remove();
    }
    if (screenMaskHandler) {
      document.removeEventListener("mousemove", screenMaskHandler);
    }
    
    screenMaskElement = document.createElement("div");
    screenMaskElement.id = "a11y-screen-mask";
    screenMaskElement.style.cssText = 
      "position: fixed; " +
      "pointer-events: none; " +
      "z-index: 2147482998; " +
      "top: 0; " +
      "left: 0; " +
      "width: 100%; " +
      "height: 100%; " +
      "background: rgba(0, 0, 0, " + (prefs.screenMaskOpacity || 0.5) + "); " +
      "display: none; " +
      "clip-path: circle(" + (prefs.screenMaskRadius || 200) + "px at 50% 50%);";
    document.body.appendChild(screenMaskElement);
    
    screenMaskHandler = function(e) {
      var html = document.documentElement;
      var enabled = html.getAttribute("data-a11y-screen-mask") === "1";
      if (enabled && screenMaskElement) {
        var radius = parseInt(html.style.getPropertyValue("--a11y-screen-mask-radius") || "200px", 10);
        screenMaskElement.style.display = "block";
        screenMaskElement.style.clipPath = "circle(" + radius + "px at " + e.clientX + "px " + e.clientY + "px)";
      } else if (screenMaskElement) {
        screenMaskElement.style.display = "none";
      }
    };
    
    document.addEventListener("mousemove", screenMaskHandler);
  }

  function removeScreenMask() {
    if (screenMaskElement) {
      screenMaskElement.remove();
      screenMaskElement = null;
    }
    if (screenMaskHandler) {
      document.removeEventListener("mousemove", screenMaskHandler);
      screenMaskHandler = null;
    }
  }

  // --- Magnifier Handler ------------------------------------------------------
  // Uses CSS transforms for real-time magnification of actual page content
  var magnifierElement = null;
  var magnifierContent = null;
  var magnifierHandler = null;
  var magnifierClone = null;
  var magnifierRAF = null;

  function createMagnifier(prefs) {
    removeMagnifier(); // Clean up any existing magnifier
    
    var size = 220; // Magnifier lens size
    var zoom = parseFloat(prefs.magnifierZoom || 2.0);
    
    // Create magnifier container (the lens)
    magnifierElement = document.createElement("div");
    magnifierElement.id = "a11y-magnifier";
    magnifierElement.setAttribute("aria-hidden", "true");
    magnifierElement.style.cssText = 
      "position: fixed; " +
      "pointer-events: none; " +
      "z-index: 2147483000; " +
      "width: " + size + "px; " +
      "height: " + size + "px; " +
      "border: 4px solid #0066cc; " +
      "border-radius: 50%; " +
      "overflow: hidden; " +
      "box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,102,204,0.3), inset 0 0 30px rgba(0,0,0,0.1); " +
      "display: none; " +
      "background: #fff;";
    
    // Create content container that holds the cloned/transformed content
    magnifierContent = document.createElement("div");
    magnifierContent.style.cssText = 
      "width: " + size + "px; " +
      "height: " + size + "px; " +
      "position: absolute; " +
      "top: 50%; " +
      "left: 50%; " +
      "transform: translate(-50%, -50%); " +
      "transform-origin: center center; " +
      "pointer-events: none; " +
      "background: #fff;";
    
    magnifierElement.appendChild(magnifierContent);
    document.body.appendChild(magnifierElement);
    
    // Create zoom level indicator
    var zoomIndicator = document.createElement("div");
    zoomIndicator.id = "a11y-magnifier-zoom-indicator";
    zoomIndicator.style.cssText = 
      "position: absolute; " +
      "bottom: 8px; " +
      "left: 50%; " +
      "transform: translateX(-50%); " +
      "background: rgba(0,102,204,0.9); " +
      "color: #fff; " +
      "padding: 2px 8px; " +
      "border-radius: 10px; " +
      "font-size: 11px; " +
      "font-weight: bold; " +
      "font-family: system-ui, sans-serif;";
    zoomIndicator.textContent = zoom.toFixed(1) + "x";
    magnifierElement.appendChild(zoomIndicator);
    
    // Throttle for performance
    var lastUpdate = 0;
    var throttleMs = 16; // ~60fps
    
    magnifierHandler = function(e) {
      var html = document.documentElement;
      var enabled = html.getAttribute("data-a11y-magnifier") === "1";
      
      if (!enabled || !magnifierElement) {
        if (magnifierElement) magnifierElement.style.display = "none";
        return;
      }
      
      // Throttle updates
      var now = Date.now();
      if (now - lastUpdate < throttleMs) {
        if (magnifierRAF) cancelAnimationFrame(magnifierRAF);
        magnifierRAF = requestAnimationFrame(function() {
          updateMagnifier(e);
        });
        return;
      }
      lastUpdate = now;
      
      updateMagnifier(e);
    };
    
    function updateMagnifier(e) {
      var html = document.documentElement;
      var currentZoom = parseFloat(html.style.getPropertyValue("--a11y-magnifier-zoom") || zoom);
      
      // Show magnifier
      magnifierElement.style.display = "block";
      
      // Position magnifier near cursor (offset to not block view)
      var offsetX = 30;
      var offsetY = -30;
      var magX = e.clientX + offsetX + size/2;
      var magY = e.clientY + offsetY - size/2;
      
      // Keep within viewport bounds
      if (magX + size/2 > window.innerWidth) {
        magX = e.clientX - offsetX - size/2;
      }
      if (magY - size/2 < 0) {
        magY = e.clientY - offsetY + size/2;
      }
      if (magX - size/2 < 0) {
        magX = size/2 + 10;
      }
      if (magY + size/2 > window.innerHeight) {
        magY = window.innerHeight - size/2 - 10;
      }
      
      magnifierElement.style.left = magX + "px";
      magnifierElement.style.top = magY + "px";
      
      // Update zoom indicator
      var indicator = magnifierElement.querySelector("#a11y-magnifier-zoom-indicator");
      if (indicator) indicator.textContent = currentZoom.toFixed(1) + "x";
      
      // Calculate what area to show (centered on mouse position)
      var viewWidth = size / currentZoom;
      var viewHeight = size / currentZoom;
      
      // Get the element under the cursor
      magnifierElement.style.display = "none"; // Hide temporarily to get element under
      var elementUnder = document.elementFromPoint(e.clientX, e.clientY);
      magnifierElement.style.display = "block";
      
      if (elementUnder && !elementUnder.closest("#a11y-magnifier") && !elementUnder.closest("#a11y-widget-root")) {
        // Clone and render content in magnifier
        renderMagnifiedArea(e.clientX, e.clientY, currentZoom, size);
      }
    }
    
    document.addEventListener("mousemove", magnifierHandler, { passive: true });
    
    // Hide on mouse leave
    document.addEventListener("mouseleave", function() {
      if (magnifierElement) magnifierElement.style.display = "none";
    }, { passive: true });
  }
  
  function renderMagnifiedArea(mouseX, mouseY, zoomLevel, size) {
    if (!magnifierContent) return;
    
    // Calculate scroll offset
    var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // The area we want to magnify (centered on mouse)
    var areaWidth = size / zoomLevel;
    var areaHeight = size / zoomLevel;
    
    // Use a simple CSS approach: clone body and transform
    // Clear previous content
    magnifierContent.innerHTML = "";
    
    // Create a viewport for the magnified content
    var viewport = document.createElement("div");
    var targetX = mouseX + scrollX;
    var targetY = mouseY + scrollY;
    viewport.style.cssText = 
      "position: absolute; " +
      "width: " + document.documentElement.scrollWidth + "px; " +
      "height: " + document.documentElement.scrollHeight + "px; " +
      "transform-origin: 0 0; " +
      "transform: translate(" + (size / 2 - targetX * zoomLevel) + "px, " + (size / 2 - targetY * zoomLevel) + "px) scale(" + zoomLevel + "); " +
      "left: 0; " +
      "top: 0; " +
      "pointer-events: none; " +
      "background: #fff;";
    
    // Clone visible elements near the mouse cursor
    var elementsInArea = getElementsInArea(mouseX + scrollX, mouseY + scrollY, areaWidth, areaHeight);
    
    elementsInArea.forEach(function(el) {
      try {
        // Skip the magnifier and widget
        if (el.id === "a11y-magnifier" || el.id === "a11y-widget-root" || 
            el.closest("#a11y-magnifier") || el.closest("#a11y-widget-root")) {
          return;
        }
        
        var clone = el.cloneNode(true);
        var rect = el.getBoundingClientRect();
        
        // Position clone at its original location
        clone.style.cssText = 
          "position: absolute !important; " +
          "left: " + (rect.left + scrollX) + "px !important; " +
          "top: " + (rect.top + scrollY) + "px !important; " +
          "width: " + rect.width + "px !important; " +
          "height: " + rect.height + "px !important; " +
          "margin: 0 !important; " +
          "pointer-events: none !important;";
        
        // Copy computed styles
        var computedStyle = window.getComputedStyle(el);
        clone.style.backgroundColor = computedStyle.backgroundColor;
        clone.style.color = computedStyle.color;
        clone.style.fontSize = computedStyle.fontSize;
        clone.style.fontFamily = computedStyle.fontFamily;
        clone.style.fontWeight = computedStyle.fontWeight;
        clone.style.lineHeight = computedStyle.lineHeight;
        clone.style.textAlign = computedStyle.textAlign;
        clone.style.border = computedStyle.border;
        clone.style.borderRadius = computedStyle.borderRadius;
        clone.style.boxShadow = computedStyle.boxShadow;
        clone.style.padding = computedStyle.padding;
        
        viewport.appendChild(clone);
      } catch(err) {
        // Skip elements that can't be cloned
      }
    });
    
    magnifierContent.appendChild(viewport);
  }
  
  function getElementsInArea(centerX, centerY, areaWidth, areaHeight) {
    var elements = [];
    var allElements = document.body.querySelectorAll("*");
    var leftBound = centerX - areaWidth / 2;
    var rightBound = centerX + areaWidth / 2;
    var topBound = centerY - areaHeight / 2;
    var bottomBound = centerY + areaHeight / 2;
    
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      
      // Skip hidden, script, style elements
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE" || el.tagName === "NOSCRIPT") continue;
      
      var rect = el.getBoundingClientRect();
      var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      var elLeft = rect.left + scrollX;
      var elRight = rect.right + scrollX;
      var elTop = rect.top + scrollY;
      var elBottom = rect.bottom + scrollY;
      
      // Check if element intersects the magnified area
      if (elRight >= leftBound && elLeft <= rightBound && elBottom >= topBound && elTop <= bottomBound) {
        // Only include leaf nodes or elements with direct text
        if (el.children.length === 0 || el.textContent.trim().length < 200) {
          elements.push(el);
        }
      }
    }
    
    // Limit to 50 elements for performance
    return elements.slice(0, 50);
  }

  function removeMagnifier() {
    if (magnifierRAF) {
      cancelAnimationFrame(magnifierRAF);
      magnifierRAF = null;
    }
    if (magnifierElement) {
      magnifierElement.remove();
      magnifierElement = null;
    }
    if (magnifierHandler) {
      document.removeEventListener("mousemove", magnifierHandler);
      magnifierHandler = null;
    }
    magnifierContent = null;
  }

  // --- Custom Cursor Handler -------------------------------------------------
  var customCursorElement = null;
  var customCursorHandler = null;
  var customCursorClickHandler = null;
  var customCursorHoverHandler = null;

  function createCustomCursor(prefs) {
    removeCustomCursor(); // Clean up any existing cursor
    
    var cursorSize = prefs.cursorSize || "medium";
    
    // Create custom cursor element
    customCursorElement = document.createElement("div");
    customCursorElement.id = "a11y-custom-cursor";
    customCursorElement.className = cursorSize;
    customCursorElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(customCursorElement);
    
    // Track mouse movement
    customCursorHandler = function(e) {
      if (!customCursorElement) return;
      
      customCursorElement.style.left = e.clientX + "px";
      customCursorElement.style.top = e.clientY + "px";
      customCursorElement.style.display = "block";
    };
    
    // Handle click feedback
    customCursorClickHandler = function(e) {
      if (!customCursorElement) return;
      customCursorElement.classList.add("clicking");
      setTimeout(function() {
        if (customCursorElement) {
          customCursorElement.classList.remove("clicking");
        }
      }, 150);
    };
    
    // Handle hover states
    customCursorHoverHandler = function(e) {
      if (!customCursorElement) return;
      
      var target = e.target;
      var isInteractive = (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("role") === "button" ||
        target.getAttribute("onclick") ||
        target.style.cursor === "pointer" ||
        window.getComputedStyle(target).cursor === "pointer"
      );
      
      if (isInteractive) {
        customCursorElement.classList.add("hovering");
      } else {
        customCursorElement.classList.remove("hovering");
      }
    };
    
    // Add event listeners
    document.addEventListener("mousemove", customCursorHandler, { passive: true });
    document.addEventListener("mousedown", customCursorClickHandler, { passive: true });
    document.addEventListener("mouseover", customCursorHoverHandler, { passive: true });
    
    // Hide when mouse leaves window
    document.addEventListener("mouseleave", function() {
      if (customCursorElement) {
        customCursorElement.style.display = "none";
      }
    }, { passive: true });
    
    document.addEventListener("mouseenter", function() {
      if (customCursorElement) {
        customCursorElement.style.display = "block";
      }
    }, { passive: true });
  }

  function removeCustomCursor() {
    if (customCursorElement) {
      customCursorElement.remove();
      customCursorElement = null;
    }
    if (customCursorHandler) {
      document.removeEventListener("mousemove", customCursorHandler);
      customCursorHandler = null;
    }
    if (customCursorClickHandler) {
      document.removeEventListener("mousedown", customCursorClickHandler);
      customCursorClickHandler = null;
    }
    if (customCursorHoverHandler) {
      document.removeEventListener("mouseover", customCursorHoverHandler);
      customCursorHoverHandler = null;
    }
  }

  // --- Dictionary Handler ----------------------------------------------------
  var dictionaryHandler = null;
  
  function setupDictionaryHandler() {
    // Remove existing handler if any
    if (dictionaryHandler) {
      document.removeEventListener("dblclick", dictionaryHandler);
    }
    
    // Set up new handler
    dictionaryHandler = function(e) {
      var html = document.documentElement;
      var enabled = html.getAttribute("data-a11y-dictionary") === "1";
      if (!enabled) return;
      
      var word = window.getSelection().toString().trim();
      if (word && word.split(/\s+/).length === 1) {
        lookupWord(word).then(function(result) {
          if (result && result.definitions && result.definitions.length > 0) {
            // Remove any existing popup
            var existingPopup = document.getElementById("a11y-dict-popup");
            if (existingPopup) existingPopup.remove();
            
            var popup = el("div", {
              id: "a11y-dict-popup",
              style: "position: fixed; " +
                     "background: white; " +
                     "border: 2px solid #0066cc; " +
                     "border-radius: 8px; " +
                     "padding: 1rem; " +
                     "max-width: 300px; " +
                     "z-index: 2147483001; " +
                     "box-shadow: 0 4px 12px rgba(0,0,0,0.15); " +
                     "left: " + Math.min(e.clientX, window.innerWidth - 320) + "px; " +
                     "top: " + Math.min(e.clientY, window.innerHeight - 200) + "px;"
            });
            
            var title = el("div", {
              style: "font-weight: bold; margin-bottom: 0.5rem; font-size: 16px;",
              text: result.word
            });
            popup.appendChild(title);
            
            for (var i = 0; i < result.definitions.length; i++) {
              var def = el("div", {
                style: "margin-bottom: 0.5rem; font-size: 14px;",
                html: "<strong>" + result.definitions[i].partOfSpeech + ":</strong> " + result.definitions[i].definition
              });
              popup.appendChild(def);
            }
            
            var closeBtn = el("button", {
              type: "button",
              text: "✕",
              style: "position: absolute; top: 0.5rem; right: 0.5rem; border: none; background: none; font-size: 18px; cursor: pointer;",
              "aria-label": "Close dictionary popup"
            });
            closeBtn.addEventListener("click", function() {
              popup.remove();
            });
            popup.appendChild(closeBtn);
            
            document.body.appendChild(popup);
            
            setTimeout(function() {
              if (popup.parentNode) {
                popup.remove();
              }
            }, 10000);
          }
        });
      }
    };
    
    document.addEventListener("dblclick", dictionaryHandler);
  }
  
  function lookupWord(word) {
    if (!word || word.trim().length === 0) return Promise.resolve(null);
    
    // Use Free Dictionary API (no API key required)
    var apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word.trim());
    
    return fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) throw new Error("Word not found");
        return response.json();
      })
      .then(function(data) {
        if (data && data.length > 0 && data[0].meanings) {
          var meanings = data[0].meanings;
          var definitions = [];
          for (var i = 0; i < Math.min(meanings.length, 3); i++) {
            if (meanings[i].definitions && meanings[i].definitions.length > 0) {
              definitions.push({
                partOfSpeech: meanings[i].partOfSpeech,
                definition: meanings[i].definitions[0].definition
              });
            }
          }
          return {
            word: data[0].word,
            phonetic: data[0].phonetic || "",
            definitions: definitions
          };
        }
        return null;
      })
      .catch(function() {
        return null;
      });
  }

  // --- Translation Handler ----------------------------------------------------
  // Translation state tracking
  var translationCache = {};
  var translationNodes = [];
  var translationInProgress = false;
  var translationStatusEl = null;

  function showTranslationStatus(message, isError, isPersistent) {
    if (!translationStatusEl) {
      translationStatusEl = document.createElement("div");
      translationStatusEl.id = "a11y-translation-status";
      translationStatusEl.style.cssText = 
        "position: fixed; bottom: 80px; right: 20px; " +
        "background: #333; color: #fff; padding: 12px 18px; " +
        "border-radius: 8px; font-size: 14px; z-index: 2147483002; " +
        "box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: system-ui, sans-serif;" +
        "transition: opacity 0.3s ease; display: flex; align-items: center; gap: 8px;";
      document.body.appendChild(translationStatusEl);
    }
    translationStatusEl.innerHTML = message;
    translationStatusEl.style.background = isError ? "#d32f2f" : "#333";
    translationStatusEl.style.opacity = "1";
    
    // Auto-hide after 3 seconds unless persistent
    if (!isPersistent) {
      setTimeout(function() {
        if (translationStatusEl) {
          translationStatusEl.style.opacity = "0";
          setTimeout(function() {
            if (translationStatusEl && translationStatusEl.parentNode) {
              translationStatusEl.remove();
              translationStatusEl = null;
            }
          }, 300);
        }
      }, 3000);
    }
  }

  function hideTranslationStatus() {
    if (translationStatusEl) {
      translationStatusEl.style.opacity = "0";
      setTimeout(function() {
        if (translationStatusEl && translationStatusEl.parentNode) {
          translationStatusEl.remove();
          translationStatusEl = null;
        }
      }, 300);
    }
  }

  function translateText(text, targetLang) {
    if (!text || !targetLang || targetLang === "en") return Promise.resolve(null);
    
    // Use MyMemory API with improved error handling
    var apiUrl = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text.substring(0, 500)) + "&langpair=en|" + targetLang;
    
    return fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) throw new Error("Translation failed");
        return response.json();
      })
      .then(function(data) {
        if (data && data.responseData && data.responseData.translatedText) {
          var translated = data.responseData.translatedText;
          // Check for quota exceeded or error messages
          if (translated.indexOf("MYMEMORY WARNING") === -1 && 
              translated.indexOf("PLEASE SELECT TWO DISTINCT") === -1) {
            return translated;
          }
        }
        return null;
      })
      .catch(function() {
        return null;
      });
  }

  function getLanguageName(code) {
    var names = {
      "en": "English", "es": "Español", "fr": "Français", "de": "Deutsch",
      "it": "Italiano", "pt": "Português", "ru": "Русский", "ja": "日本語",
      "zh": "中文", "ar": "العربية", "hi": "हिन्दी", "ko": "한국어"
    };
    return names[code] || code;
  }

  function applyTranslation(prefs) {
    if (!prefs.translationEnabled || prefs.translationLanguage === "en") {
      removeTranslation();
      return;
    }

    if (translationInProgress) {
      showTranslationStatus("⏳ Translation already in progress...", false);
      return;
    }

    var targetLang = prefs.translationLanguage;
    var surfaces = document.querySelectorAll("[data-a11y-surface='true']");
    
    // Clear previous translation state
    removeTranslation();
    translationNodes = [];
    translationInProgress = true;

    // Collect all text nodes from surfaces
    var totalNodes = 0;
    for (var i = 0; i < surfaces.length; i++) {
      var surface = surfaces[i];
      // Skip widget elements
      if (surface.id && surface.id.indexOf("a11y-widget") === 0) continue;
      if (surface.closest && surface.closest("#a11y-widget-root")) continue;
      
      var walker = document.createTreeWalker(
        surface,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      var node;
      while ((node = walker.nextNode())) {
        var text = node.textContent.trim();
        // Skip very short text, numbers only, or special characters only
        if (text && text.length > 2 && !/^[\d\s\W]+$/.test(text)) {
          // Skip if already has original text stored (already translated)
          if (node.parentElement && node.parentElement.getAttribute("data-a11y-original-text")) {
            continue;
          }
          // Skip script/style/noscript content
          var parent = node.parentElement;
          if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE" || parent.tagName === "NOSCRIPT")) {
            continue;
          }
          translationNodes.push({
            node: node,
            text: text,
            parent: node.parentElement
          });
          totalNodes++;
        }
      }
    }

    if (totalNodes === 0) {
      translationInProgress = false;
      showTranslationStatus("ℹ️ No translatable content found", true);
      return;
    }
    
    showTranslationStatus('<span style="animation: pulse 1s infinite">🌍</span> Translating to ' + getLanguageName(targetLang) + '... (0/' + totalNodes + ')', false, true);

    // Translate in batches to reduce API calls
    translateBatch(translationNodes, targetLang, 0, totalNodes);
  }

  function translateBatch(nodes, targetLang, startIndex, totalNodes) {
    var batchSize = 8; // Translate 8 nodes at a time
    var endIndex = Math.min(startIndex + batchSize, nodes.length);
    var batch = nodes.slice(startIndex, endIndex);
    
    if (batch.length === 0) {
      // All translations complete
      translationInProgress = false;
      showTranslationStatus("✅ Translation complete!", false);
      return;
    }

    var promises = [];
    for (var i = 0; i < batch.length; i++) {
      (function(item, itemIndex) {
        var text = item.text;
        
        // Check cache first
        var cacheKey = text.substring(0, 100) + "|" + targetLang;
        if (translationCache[cacheKey]) {
          applyTranslationToNode(item, translationCache[cacheKey]);
          return;
        }

        // Translate text
        var promise = translateText(text, targetLang).then(function(result) {
          if (result && result !== text) {
            translationCache[cacheKey] = result;
            return { item: item, translated: result };
          }
          return null;
        });
        promises.push(promise);
      })(batch[i], i);
    }

    // Wait for all promises in batch
    Promise.all(promises).then(function(results) {
      for (var j = 0; j < results.length; j++) {
        if (results[j]) {
          applyTranslationToNode(results[j].item, results[j].translated);
        }
      }
      
      // Update progress
      var progress = Math.min(endIndex, totalNodes);
      showTranslationStatus('🌍 Translating to ' + getLanguageName(targetLang) + '... (' + progress + '/' + totalNodes + ')', false, true);
      
      // Continue with next batch
      if (endIndex < nodes.length) {
        setTimeout(function() {
          translateBatch(nodes, targetLang, endIndex, totalNodes);
        }, 150); // Small delay to avoid rate limiting
      } else {
        translationInProgress = false;
        showTranslationStatus("✅ Translation complete!", false);
      }
    }).catch(function(err) {
      console.warn('[A11Y] Translation batch error:', err);
      translationInProgress = false;
      showTranslationStatus("❌ Translation failed. Please try again.", true);
    });
  }

  function applyTranslationToNode(item, translatedText) {
    if (!item.node || !item.parent) return;
    
    // Store original text in parent element's data attribute
    if (!item.parent.getAttribute("data-a11y-original-text")) {
      item.parent.setAttribute("data-a11y-original-text", item.text);
    }
    
    // Replace text content with fade effect
    try {
      item.node.textContent = translatedText;
    } catch (e) {
      // Ignore errors
    }
  }

  function removeTranslation() {
    hideTranslationStatus();
    
    // Restore original text from data attributes
    var elements = document.querySelectorAll("[data-a11y-original-text]");
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var originalText = element.getAttribute("data-a11y-original-text");
      if (originalText) {
        // Find text node and restore
        var walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        var node = walker.nextNode();
        if (node) {
          try {
            node.textContent = originalText;
          } catch (e) {
            // Ignore errors
          }
        }
        element.removeAttribute("data-a11y-original-text");
      }
    }
    translationNodes = [];
    translationInProgress = false;
  }

  // --- Keyboard Shortcut Handler -------------------------------------------
  function parseShortcut(shortcut) {
    if (!shortcut || shortcut === false) return null;
    var parts = shortcut.split("+").map(function(s) { return s.trim(); });
    var modifiers = { alt: false, ctrl: false, shift: false, meta: false };
    var key = null;
    
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].toLowerCase();
      if (part === "alt" || part === "option") modifiers.alt = true;
      else if (part === "ctrl" || part === "control") modifiers.ctrl = true;
      else if (part === "shift") modifiers.shift = true;
      else if (part === "meta" || part === "cmd" || part === "command") modifiers.meta = true;
      else key = parts[i].toUpperCase(); // Preserve case for letter keys
    }
    
    return { modifiers: modifiers, key: key };
  }

  function matchesShortcut(e, shortcutConfig) {
    if (!shortcutConfig) return false;
    
    // Check modifiers
    var altMatch = shortcutConfig.modifiers.alt ? (e.altKey || e.getModifierState("Alt")) : !e.altKey;
    var ctrlMatch = shortcutConfig.modifiers.ctrl ? (e.ctrlKey || e.getModifierState("Control")) : !e.ctrlKey;
    var shiftMatch = shortcutConfig.modifiers.shift ? (e.shiftKey || e.getModifierState("Shift")) : !e.shiftKey;
    var metaMatch = shortcutConfig.modifiers.meta ? (e.metaKey || e.getModifierState("Meta")) : !e.metaKey;
    
    // Check key
    var keyMatch = shortcutConfig.key && (e.key === shortcutConfig.key || e.key === shortcutConfig.key.toLowerCase() || e.code === "Key" + shortcutConfig.key);
    
    return altMatch && ctrlMatch && shiftMatch && metaMatch && keyMatch;
  }

  function isInputFocused() {
    var active = document.activeElement;
    if (!active) return false;
    var tagName = active.tagName.toLowerCase();
    var isInput = tagName === "input" && active.type !== "button" && active.type !== "submit" && active.type !== "reset";
    var isTextarea = tagName === "textarea";
    var isContentEditable = active.isContentEditable === true;
    return isInput || isTextarea || isContentEditable;
  }

  function setupKeyboardShortcut(cfg, openPanel, closePanel, toggle) {
    if (!cfg.keyboardShortcut || cfg.keyboardShortcut === false) return;
    
    var shortcutConfig = parseShortcut(cfg.keyboardShortcut);
    if (!shortcutConfig || !shortcutConfig.key) return;
    
    document.addEventListener("keydown", function(e) {
      // Don't activate if user is typing in an input field
      if (isInputFocused()) return;
      
      // Don't activate if only modifier keys are pressed
      if (!shortcutConfig.key) return;
      
      if (matchesShortcut(e, shortcutConfig)) {
        e.preventDefault();
        e.stopPropagation();
        
        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        if (isOpen) {
          closePanel();
        } else {
          openPanel();
        }
      }
    });
  }

  // --- UI -------------------------------------------------------------------
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        if (k === "text") n.textContent = attrs[k];
        else if (k === "html") n.innerHTML = attrs[k];
        else if (k === "class") n.className = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (children && children.length) {
      for (var i = 0; i < children.length; i++) n.appendChild(children[i]);
    }
    return n;
  }

  // --- UI Control Update Helper ---------------------------------------------
  function updateUIControls(controls, prefs) {
    if (!controls) return;
    
    // Update contrast select
    if (controls.contrastSelect) {
      controls.contrastSelect.value = prefs.contrast || "default";
    }
    
    // Update font scale range
    if (controls.fontRange) {
      var scale = clamp(Number(prefs.fontScale || 1.0), 1.0, 1.6);
      controls.fontRange.value = String(scale);
      controls.fontRange.setAttribute("aria-valuenow", String(Math.round(scale * 100)));
      if (controls.fontValue) {
        controls.fontValue.textContent = Math.round(scale * 100) + "%";
      }
    }
    
    // Update spacing select
    if (controls.spacingSelect) {
      controls.spacingSelect.value = prefs.spacing || "normal";
    }
    
    // Update readable font checkbox
    if (controls.readableFontCheckbox !== undefined) {
      controls.readableFontCheckbox.checked = !!prefs.readableFont;
    }
    
    // Update reduce motion checkbox
    if (controls.reduceMotionCheckbox !== undefined) {
      controls.reduceMotionCheckbox.checked = !!prefs.reduceMotion;
    }
    
    // Update advanced features checkboxes
    if (controls.textToSpeechCheckbox !== undefined) {
      controls.textToSpeechCheckbox.checked = !!prefs.textToSpeechEnabled;
    }
    if (controls.readingRulerCheckbox !== undefined) {
      controls.readingRulerCheckbox.checked = !!prefs.readingRulerEnabled;
    }
    if (controls.screenMaskCheckbox !== undefined) {
      controls.screenMaskCheckbox.checked = !!prefs.screenMaskEnabled;
    }
    if (controls.textOnlyModeCheckbox !== undefined) {
      controls.textOnlyModeCheckbox.checked = !!prefs.textOnlyMode;
    }
    if (controls.marginsCheckbox !== undefined) {
      controls.marginsCheckbox.checked = !!prefs.marginsEnabled;
    }
    if (controls.cursorCheckbox !== undefined) {
      controls.cursorCheckbox.checked = !!prefs.cursorEnabled;
    }
    if (controls.cursorSizeSelect) {
      controls.cursorSizeSelect.value = prefs.cursorSize || "medium";
    }
    if (controls.cursorColorInput !== undefined) {
      controls.cursorColorInput.value = prefs.cursorColor || PREF_DEFAULTS.cursorColor;
    }
    if (controls.cursorColorTextInput !== undefined) {
      controls.cursorColorTextInput.value = prefs.cursorColor || PREF_DEFAULTS.cursorColor;
    }
    if (controls.updateCursorSizeControls && controls.cursorCheckbox) {
      controls.updateCursorSizeControls(controls.cursorCheckbox.checked);
    }
    if (controls.magnifierCheckbox !== undefined) {
      controls.magnifierCheckbox.checked = !!prefs.magnifierEnabled;
      if (controls.updateMagnifierControls) {
        controls.updateMagnifierControls(!!prefs.magnifierEnabled);
      }
    }
    if (controls.magnifierZoomSlider !== undefined) {
      controls.magnifierZoomSlider.value = String(prefs.magnifierZoom || 2.0);
      var magnifierLabel = document.querySelector("#a11y-magnifier-controls label");
      if (magnifierLabel) {
        magnifierLabel.textContent = "Zoom Level: " + (prefs.magnifierZoom || 2.0) + "x";
      }
    }
    if (controls.dictionaryCheckbox !== undefined) {
      controls.dictionaryCheckbox.checked = !!prefs.dictionaryEnabled;
    }
    if (controls.translationCheckbox !== undefined) {
      controls.translationCheckbox.checked = !!prefs.translationEnabled;
    }
    if (controls.globalModeCheckbox !== undefined) {
      controls.globalModeCheckbox.checked = !!prefs.globalMode;
      if (controls.updateGlobalModeControls) {
        controls.updateGlobalModeControls(!!prefs.globalMode);
      }
    }
    if (controls.globalModeFontSelect !== undefined) {
      controls.globalModeFontSelect.value = prefs.globalModeFont || "system";
    }
    if (controls.globalModeBgColorInput !== undefined) {
      controls.globalModeBgColorInput.value = prefs.globalModeBgColor || "#ffffff";
    }
    if (controls.globalModeBgColorTextInput !== undefined) {
      controls.globalModeBgColorTextInput.value = prefs.globalModeBgColor || "#ffffff";
    }
    
    // Update dynamic controls visibility
    if (controls.updateTTSControls && controls.textToSpeechCheckbox) {
      controls.updateTTSControls(controls.textToSpeechCheckbox.checked);
    }
    if (controls.updateMarginsControls && controls.marginsCheckbox) {
      controls.updateMarginsControls(controls.marginsCheckbox.checked);
    }
    if (controls.updateTranslationControls && controls.translationCheckbox) {
      controls.updateTranslationControls(controls.translationCheckbox.checked);
    }
  }

  function buildWidget(cfg, prefs, onChange, onReset) {
    var root = el("div", { id: "a11y-widget-root", "data-position": cfg.position });
    root.style.zIndex = String(cfg.zIndex);

    // Store control references for UI updates
    var controls = {
      contrastSelect: null,
      fontRange: null,
      fontValue: null,
      spacingSelect: null,
      readableFontCheckbox: null,
      reduceMotionCheckbox: null,
      // Advanced features
      textToSpeechCheckbox: null,
      readingRulerCheckbox: null,
      screenMaskCheckbox: null,
      textOnlyModeCheckbox: null,
      marginsCheckbox: null,
      cursorCheckbox: null,
      cursorSizeSelect: null,
      cursorSizeControlsContainer: null,
      updateCursorSizeControls: null,
      cursorColorInput: null,
      cursorColorTextInput: null,
      magnifierCheckbox: null,
      magnifierZoomSlider: null,
      magnifierControlsContainer: null,
      dictionaryCheckbox: null,
      translationCheckbox: null,
      globalModeCheckbox: null,
      toolbarModeCheckbox: null,
      toolbar: null
    };

    // Optional skip link: if canonical main exists, target it; else try main/body
    var skip = null;
    if (cfg.features.skipLink) {
      var target = document.querySelector("[data-canonical-surface='true']") ||
                   document.querySelector("main") ||
                   document.body;
      var targetId = target && target.id ? target.id : null;
      if (target && !targetId) {
        targetId = "a11y-skip-target";
        try { target.id = targetId; } catch (e) {}
      }
      if (targetId) {
        skip = el("a", { id: "a11y-skip-link", href: "#" + targetId, text: "Skip to content" });
        root.appendChild(skip);
      }
    }

    // Create logo SVG for button - Accessibility widget logo
    // Cute and friendly logo with gradients, smile, and sparkles
    var logoSVG = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">' +
      '<defs>' +
        '<linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#6B8DD6"/>' +
          '<stop offset="100%" stop-color="#8B6FD8"/>' +
        '</linearGradient>' +
        '<filter id="softShadow">' +
          '<feGaussianBlur in="SourceAlpha" stdDeviation="2"/>' +
          '<feOffset dx="0" dy="2" result="offsetblur"/>' +
          '<feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>' +
          '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
      '</defs>' +
      // Outer circle (badge) - friendly purple-blue gradient
      '<circle cx="50" cy="50" r="45" fill="url(#outerGrad)" stroke="#5A7BC8" stroke-width="1.5" filter="url(#softShadow)"/>' +
      // Inner white circle with soft shadow
      '<circle cx="50" cy="50" r="33" fill="#FFFFFF" opacity="0.95"/>' +
      // Human figure icon with friendly smile
      '<g fill="#6B8DD6" stroke="#6B8DD6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        // Head (circular with friendly face)
        '<circle cx="50" cy="36" r="5.5" fill="#FFFFFF" stroke="#6B8DD6" stroke-width="2"/>' +
        // Friendly smile
        '<path d="M 46 38 Q 50 40, 54 38" stroke="#6B8DD6" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        // Eyes
        '<circle cx="47.5" cy="35" r="1" fill="#6B8DD6"/>' +
        '<circle cx="52.5" cy="35" r="1" fill="#6B8DD6"/>' +
        // Torso (vertical line)
        '<line x1="50" y1="41.5" x2="50" y2="52" stroke-width="2.8"/>' +
        // Arms (welcoming/open pose)
        '<line x1="50" y1="44" x2="40" y2="46" stroke-width="3"/>' +
        '<line x1="50" y1="44" x2="60" y2="46" stroke-width="3"/>' +
        // Legs (slightly apart, friendly stance)
        '<line x1="50" y1="52" x2="44" y2="61" stroke-width="3"/>' +
        '<line x1="50" y1="52" x2="56" y2="61" stroke-width="3"/>' +
      '</g>' +
      // Sparkle/star elements for friendliness
      '<g fill="#FFD700" opacity="0.8">' +
        // Top sparkle
        '<circle cx="30" cy="25" r="1.5"/>' +
        '<path d="M 30 25 L 30 22 M 30 25 L 30 28 M 30 25 L 27 25 M 30 25 L 33 25" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"/>' +
        // Right sparkle
        '<circle cx="75" cy="30" r="1.5"/>' +
        '<path d="M 75 30 L 75 27 M 75 30 L 75 33 M 75 30 L 72 30 M 75 30 L 78 30" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"/>' +
      '</g>' +
      // Curved arc (motion/flow element) - softer and friendlier
      '<path d="M 65 28 Q 70 23, 75 28" stroke="#8B6FD8" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>' +
      // Accessibility symbol - friendly "A" with heart
      '<g fill="#6B8DD6" font-family="Arial, sans-serif" font-weight="bold">' +
        // Small "A"
        '<text x="30" y="28" font-size="9" text-anchor="middle" fill="#6B8DD6">A</text>' +
        // Small heart instead of character
        '<path d="M 30 35 Q 30 32, 32 32 Q 34 32, 34 35 Q 34 32, 36 32 Q 38 32, 38 35 Q 38 38, 34 42 Q 30 38, 30 35" fill="#FF6B9D" opacity="0.8"/>' +
      '</g>' +
    '</svg>';
    
    var shortcutText = cfg.keyboardShortcut ? " (" + cfg.keyboardShortcut + ")" : "";
    var toggle = el("button", {
      id: "a11y-widget-toggle",
      type: "button",
      "aria-controls": "a11y-widget-panel",
      "aria-expanded": "false",
      "aria-label": "Open accessibility settings" + shortcutText,
      "aria-haspopup": "dialog",
      "aria-keyshortcuts": cfg.keyboardShortcut || undefined,
      title: "Accessibility Settings" + shortcutText,
      html: logoSVG
    });

    var panel = el("div", {
      id: "a11y-widget-panel",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "a11y-widget-title",
      "aria-describedby": "a11y-widget-description",
      hidden: ""
    });

    var header = el("div", { id: "a11y-widget-header" }, [
      el("div", { style: "flex: 1;" }, [
        el("h2", { id: "a11y-widget-title", text: "Accessibility Settings" }),
        el("p", { id: "a11y-widget-description", style: "font-size: 12px; margin: 0.25rem 0 0 0; opacity: 0.7;", text: "Customize your viewing experience" })
      ]),
      el("button", { 
        id: "a11y-widget-close", 
        type: "button", 
        "aria-label": "Close accessibility settings dialog",
        "aria-keyshortcuts": "Escape",
        title: "Close (Esc)",
        text: "✕" 
      })
    ]);

    var content = el("div", { id: "a11y-widget-content" });

    panel.appendChild(header);
    panel.appendChild(content);

    // Contrast
    if (cfg.features.contrast) {
      var contrastRow = el("div", { class: "a11y-widget-row" });
      contrastRow.appendChild(el("label", { for: "a11y-contrast", text: "🎨 Contrast Mode" }));
      var select = el("select", { id: "a11y-contrast", name: "contrast", "aria-label": "Select contrast mode" });
      controls.contrastSelect = select;
      var opts = [
        ["default", "Default"],
        ["high", "High contrast"],
        ["dark", "Dark theme"],
        ["light", "Light theme"]
      ];
      for (var i = 0; i < opts.length; i++) {
        var o = el("option", { value: opts[i][0], text: opts[i][1] });
        if (prefs.contrast === opts[i][0]) o.selected = true;
        select.appendChild(o);
      }
      select.addEventListener("change", function () {
        onChange({ contrast: select.value });
      });
      contrastRow.appendChild(select);
      contrastRow.appendChild(el("div", { class: "a11y-widget-help", text: "Adjust color contrast for better visibility. Applies to widget and declared surfaces." }));
      content.appendChild(contrastRow);
    }

    // Text size range 100–160
    if (cfg.features.fontScale) {
      var sizeRow = el("div", { class: "a11y-widget-row" });
      var sizeLabel = el("label", { for: "a11y-font", class: "a11y-widget-label", text: "📏 Text Size" });
      sizeRow.appendChild(sizeLabel);
      var rangeWrapper = el("div", { class: "a11y-widget-range-wrapper" });
      var range = el("input", {
        id: "a11y-font",
        type: "range",
        class: "a11y-widget-range",
        min: "1",
        max: "1.6",
        step: "0.1",
        value: String(prefs.fontScale),
        "aria-valuemin": "100",
        "aria-valuemax": "160",
        "aria-valuenow": String(Math.round(prefs.fontScale * 100)),
        "aria-describedby": "a11y-font-help a11y-font-val"
      });
      controls.fontRange = range;
      var val = el("div", { 
        class: "a11y-widget-font-value", 
        id: "a11y-font-val", 
        text: Math.round(prefs.fontScale * 100) + "%",
        "aria-live": "polite",
        "aria-atomic": "true"
      });
      controls.fontValue = val;
      range.addEventListener("input", function () {
        var v = clamp(Number(range.value), 1.0, 1.6);
        range.setAttribute("aria-valuenow", String(Math.round(v * 100)));
        val.textContent = Math.round(v * 100) + "%";
        onChange({ fontScale: v });
      });
      rangeWrapper.appendChild(range);
      rangeWrapper.appendChild(val);
      sizeRow.appendChild(rangeWrapper);
      sizeRow.appendChild(el("div", { 
        id: "a11y-font-help",
        class: "a11y-widget-help", 
        text: "Scale text from 100% (normal) to 160% (large) for better readability." 
      }));
      content.appendChild(sizeRow);
    }

    // Spacing preset dropdown
    if (cfg.features.spacing) {
      var spacingRow = el("div", { class: "a11y-widget-row" });
      spacingRow.appendChild(el("label", { for: "a11y-spacing", text: "📐 Text Spacing" }));
      var spacingSelect = el("select", { 
        id: "a11y-spacing", 
        name: "spacing", 
        class: "a11y-widget-select",
        "aria-label": "Select text spacing mode"
      });
      controls.spacingSelect = spacingSelect;
      var spacingOpts = [
        ["normal", "Normal"],
        ["comfortable", "Comfortable"],
        ["max", "Max"]
      ];
      for (var s = 0; s < spacingOpts.length; s++) {
        var opt = el("option", { value: spacingOpts[s][0], text: spacingOpts[s][1] });
        if (prefs.spacing === spacingOpts[s][0]) opt.selected = true;
        spacingSelect.appendChild(opt);
      }
      spacingSelect.addEventListener("change", function () {
        onChange({ spacing: spacingSelect.value });
      });
      spacingRow.appendChild(spacingSelect);
      spacingRow.appendChild(el("div", { 
        class: "a11y-widget-help", 
        text: "Adjust line height, letter spacing, word spacing, and paragraph spacing for easier reading." 
      }));
      content.appendChild(spacingRow);
    }

    // Toggles (native checkbox)
    function toggleRow(id, labelText, checked, onToggle, help) {
      var row = el("div", { class: "a11y-widget-row" });
      var wrap = el("div", { class: "a11y-widget-checkbox-wrapper" });
      var cb = el("input", { 
        id: id, 
        type: "checkbox", 
        class: "a11y-widget-checkbox",
        "aria-describedby": help ? id + "-help" : undefined
      });
      cb.checked = checked;
      cb.addEventListener("change", function () { onToggle(cb.checked); });
      var label = el("label", { 
        for: id, 
        class: "a11y-widget-checkbox-label",
        text: labelText 
      });
      wrap.appendChild(cb);
      wrap.appendChild(label);
      row.appendChild(wrap);
      if (help) {
        row.appendChild(el("div", { 
          id: id + "-help",
          class: "a11y-widget-help", 
          text: help 
        }));
      }
      return { row: row, checkbox: cb };
    }

    if (cfg.features.readableFont) {
      var readableRow = toggleRow(
        "a11y-readable-font",
        "🔤 Readable Font",
        prefs.readableFont,
        function (v) { onChange({ readableFont: v }); },
        "Switch to a system-friendly sans-serif font that's easier to read. Applies to declared surfaces."
      );
      controls.readableFontCheckbox = readableRow.checkbox;
      content.appendChild(readableRow.row);
    }

    if (cfg.features.reduceMotion) {
      var motionRow = toggleRow(
        "a11y-reduce-motion",
        "⏸️ Reduce Motion",
        prefs.reduceMotion,
        function (v) { onChange({ reduceMotion: v }); },
        "Disable animations, transitions, and motion effects. Helps users sensitive to motion."
      );
      controls.reduceMotionCheckbox = motionRow.checkbox;
      content.appendChild(motionRow.row);
    }

    // Global Mode Toggle
    content.appendChild(el("div", { class: "a11y-divider" }));
    var globalModeRow = toggleRow(
      "a11y-global-mode",
      "🌐 Global Mode",
      prefs.globalMode || cfg.globalMode || false,
      function (v) { 
        onChange({ globalMode: v });
        // Re-mark surfaces when global mode changes
        var currentPrefs = Store.get(cfg.storageKey) || {};
        var normalizedPrefs = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
        normalizedPrefs.globalMode = v;
        markSurfaces(cfg.surfaces, normalizedPrefs.globalMode || cfg.globalMode || false);
        // Show/hide global mode controls
        updateGlobalModeControls(v);
      },
      "Apply transformations to entire website (fonts, colors, sizes). When disabled, only affects declared surfaces."
    );
    controls.globalModeCheckbox = globalModeRow.checkbox;
    content.appendChild(globalModeRow.row);
    
    // Global Mode Controls Container (shown/hidden based on globalMode)
    var globalModeControlsContainer = el("div", { 
      id: "a11y-global-mode-controls",
      class: "a11y-widget-row",
      style: "margin-top: 0.5rem; padding-left: 1.5rem; display: " + (prefs.globalMode ? "block" : "none") + ";"
    });
    
    // Font Selection
    var fontRow = el("div", { class: "a11y-widget-row", style: "margin-bottom: 0.75rem;" });
    fontRow.appendChild(el("label", { for: "a11y-global-font", text: "🔤 Font Family", style: "font-size: 12px; display: block; margin-bottom: 0.4rem;" }));
    var fontSelect = el("select", {
      id: "a11y-global-font",
      style: "width: 100%; padding: 0.5rem; font-size: 12px; border: 1px solid var(--a11y-color-border); border-radius: 4px;",
      "aria-label": "Select font family for global mode"
    });
    controls.globalModeFontSelect = fontSelect;
    
    var fontOptions = [
      ["system", "System Default"],
      ["arial", "Arial"],
      ["times", "Times New Roman"],
      ["courier", "Courier New"],
      ["comic", "Comic Sans MS"],
      ["verdana", "Verdana"],
      ["georgia", "Georgia"],
      ["trebuchet", "Trebuchet MS"]
    ];
    
    for (var f = 0; f < fontOptions.length; f++) {
      var opt = el("option", { value: fontOptions[f][0], text: fontOptions[f][1] });
      if (fontOptions[f][0] === (prefs.globalModeFont || "system")) opt.selected = true;
      fontSelect.appendChild(opt);
    }
    
    fontSelect.addEventListener("change", function() {
      onChange({ globalModeFont: fontSelect.value });
    });
    fontRow.appendChild(fontSelect);
    globalModeControlsContainer.appendChild(fontRow);
    
    // Background Color
    var bgColorRow = el("div", { class: "a11y-widget-row" });
    bgColorRow.appendChild(el("label", { for: "a11y-global-bg-color", text: "🎨 Background Color", style: "font-size: 12px; display: block; margin-bottom: 0.4rem;" }));
    var colorWrapper = el("div", { style: "display: flex; gap: 0.5rem; align-items: center;" });
    
    var colorInput = el("input", {
      id: "a11y-global-bg-color",
      type: "color",
      value: prefs.globalModeBgColor || "#ffffff",
      style: "width: 60px; height: 40px; border: 1px solid var(--a11y-color-border); border-radius: 4px; cursor: pointer;",
      "aria-label": "Select background color for global mode"
    });
    controls.globalModeBgColorInput = colorInput;
    
    var colorTextInput = el("input", {
      id: "a11y-global-bg-color-text",
      type: "text",
      value: prefs.globalModeBgColor || "#ffffff",
      placeholder: "#ffffff",
      style: "flex: 1; padding: 0.5rem; font-size: 12px; border: 1px solid var(--a11y-color-border); border-radius: 4px; font-family: monospace;",
      "aria-label": "Background color hex code"
    });
    controls.globalModeBgColorTextInput = colorTextInput;
    
    var updateColor = function(color) {
      colorInput.value = color;
      colorTextInput.value = color;
      onChange({ globalModeBgColor: color });
    };
    
    colorInput.addEventListener("input", function() {
      updateColor(colorInput.value);
    });
    
    colorTextInput.addEventListener("input", function() {
      var val = colorTextInput.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        updateColor(val);
      }
    });
    
    colorTextInput.addEventListener("blur", function() {
      var val = colorTextInput.value.trim();
      if (!/^#[0-9A-Fa-f]{6}$/.test(val)) {
        colorTextInput.value = colorInput.value;
      }
    });
    
    colorWrapper.appendChild(colorInput);
    colorWrapper.appendChild(colorTextInput);
    bgColorRow.appendChild(colorWrapper);
    globalModeControlsContainer.appendChild(bgColorRow);
    
    content.appendChild(globalModeControlsContainer);
    controls.globalModeControlsContainer = globalModeControlsContainer;
    
    // Function to show/hide global mode controls
    function updateGlobalModeControls(enabled) {
      if (controls.globalModeControlsContainer) {
        controls.globalModeControlsContainer.style.display = enabled ? "block" : "none";
      }
    }
    controls.updateGlobalModeControls = updateGlobalModeControls;

    // Reading & Focus Aids Section
    content.appendChild(el("div", { class: "a11y-divider" }));
    var readingLabel = el("div", { text: "📖 Reading & Focus Aids", class: "a11y-widget-help" });
    readingLabel.style.fontSize = "12px";
    readingLabel.style.fontWeight = "650";
    readingLabel.style.opacity = "1";
    readingLabel.style.marginBottom = "0.4rem";
    readingLabel.style.color = "#111";
    content.appendChild(readingLabel);

    // Text-to-Speech
    if (cfg.features.textToSpeech) {
      var ttsRow = toggleRow(
        "a11y-text-to-speech",
        "🔊 Text-to-Speech",
        prefs.textToSpeechEnabled,
        function (v) { 
          onChange({ textToSpeechEnabled: v });
          if (!v) stopSpeech();
          // Show/hide TTS controls dynamically
          updateTTSControls(v);
        },
        "Read website text aloud with customizable voice settings."
      );
      controls.textToSpeechCheckbox = ttsRow.checkbox;
      content.appendChild(ttsRow.row);
      
      // TTS Controls container (will be shown/hidden)
      var ttsControlsContainer = el("div", { 
        id: "a11y-tts-controls",
        class: "a11y-widget-row",
        style: "margin-top: 0.5rem; padding-left: 1.5rem; display: " + (prefs.textToSpeechEnabled ? "block" : "none") + ";"
      });
      
      var ttsButtons = el("div", { style: "display: flex; gap: 0.5rem; flex-wrap: wrap;" });
      
      var readSelectedBtn = el("button", {
        type: "button",
        class: "a11y-widget-btn",
        text: "📢 Read Selected",
        style: "flex: 1; min-width: 120px; padding: 0.5rem; font-size: 12px;",
        "aria-label": "Read selected text aloud"
      });
      readSelectedBtn.addEventListener("click", function() {
        var text = getSelectedText();
        if (text) {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalizedPrefs = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          speakText(text, normalizedPrefs);
        } else {
          alert("Please select some text first.");
        }
      });
      
      var readPageBtn = el("button", {
        type: "button",
        class: "a11y-widget-btn",
        text: "📖 Read Page",
        style: "flex: 1; min-width: 120px; padding: 0.5rem; font-size: 12px;",
        "aria-label": "Read full page text aloud"
      });
      readPageBtn.addEventListener("click", function() {
        var text = getPageText();
        if (text) {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalizedPrefs = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          speakText(text, normalizedPrefs);
        }
      });
      
      var stopBtn = el("button", {
        type: "button",
        class: "a11y-widget-btn",
        text: "⏹ Stop",
        style: "flex: 1; min-width: 120px; padding: 0.5rem; font-size: 12px;",
        "aria-label": "Stop text-to-speech"
      });
      stopBtn.addEventListener("click", function() {
        stopSpeech();
      });
      
      ttsButtons.appendChild(readSelectedBtn);
      ttsButtons.appendChild(readPageBtn);
      ttsButtons.appendChild(stopBtn);
      ttsControlsContainer.appendChild(ttsButtons);
      content.appendChild(ttsControlsContainer);
      controls.ttsControlsContainer = ttsControlsContainer;
      
      // Function to show/hide TTS controls
      function updateTTSControls(enabled) {
        if (controls.ttsControlsContainer) {
          controls.ttsControlsContainer.style.display = enabled ? "block" : "none";
        }
      }
      controls.updateTTSControls = updateTTSControls;
    }

    // Reading Ruler
    if (cfg.features.readingRuler) {
      var rulerRow = toggleRow(
        "a11y-reading-ruler",
        "📏 Reading Ruler",
        prefs.readingRulerEnabled,
        function (v) { onChange({ readingRulerEnabled: v }); },
        "Horizontal line that follows your cursor to focus on one line of text."
      );
      controls.readingRulerCheckbox = rulerRow.checkbox;
      content.appendChild(rulerRow.row);
    }

    // Screen Mask
    if (cfg.features.screenMask) {
      var maskRow = toggleRow(
        "a11y-screen-mask",
        "🎭 Screen Mask",
        prefs.screenMaskEnabled,
        function (v) { onChange({ screenMaskEnabled: v }); },
        "Dim distractions around the focused area to improve concentration."
      );
      controls.screenMaskCheckbox = maskRow.checkbox;
      content.appendChild(maskRow.row);
    }

    // Text-Only Mode
    if (cfg.features.textOnlyMode) {
      var textOnlyRow = toggleRow(
        "a11y-text-only-mode",
        "📄 Text-Only Mode",
        prefs.textOnlyMode,
        function (v) { onChange({ textOnlyMode: v }); },
        "Strip away images and layout, showing only text content for easier reading."
      );
      controls.textOnlyModeCheckbox = textOnlyRow.checkbox;
      content.appendChild(textOnlyRow.row);
    }

    // Margins
    if (cfg.features.margins) {
      var marginsRow = toggleRow(
        "a11y-margins",
        "📐 Adjustable Margins",
        prefs.marginsEnabled,
        function (v) { 
          onChange({ marginsEnabled: v });
          // Show/hide margins slider dynamically
          updateMarginsControls(v);
        },
        "Add adjustable margins for better readability."
      );
      controls.marginsCheckbox = marginsRow.checkbox;
      content.appendChild(marginsRow.row);
      
      // Margins slider container (will be shown/hidden)
      var marginsControlsContainer = el("div", { 
        id: "a11y-margins-controls",
        class: "a11y-widget-row",
        style: "margin-top: 0.5rem; padding-left: 1.5rem; display: " + (prefs.marginsEnabled ? "block" : "none") + ";"
      });
      marginsControlsContainer.appendChild(el("label", { for: "a11y-margins-size", text: "Margin Size", style: "font-size: 12px;" }));
      var marginsRange = el("input", {
        id: "a11y-margins-size",
        type: "range",
        min: "0",
        max: "200",
        step: "10",
        value: String(prefs.marginsSize || 0),
        style: "width: 100%; margin-top: 0.5rem;"
      });
      marginsRange.addEventListener("input", function() {
        onChange({ marginsSize: Number(marginsRange.value) });
      });
      marginsControlsContainer.appendChild(marginsRange);
      content.appendChild(marginsControlsContainer);
      controls.marginsControlsContainer = marginsControlsContainer;
      
      // Function to show/hide margins controls
      function updateMarginsControls(enabled) {
        if (controls.marginsControlsContainer) {
          controls.marginsControlsContainer.style.display = enabled ? "block" : "none";
        }
      }
      controls.updateMarginsControls = updateMarginsControls;
    }

    // Tools Section
    content.appendChild(el("div", { class: "a11y-divider" }));
    var toolsLabel = el("div", { text: "🛠️ Tools", class: "a11y-widget-help" });
    toolsLabel.style.fontSize = "12px";
    toolsLabel.style.fontWeight = "650";
    toolsLabel.style.opacity = "1";
    toolsLabel.style.marginBottom = "0.4rem";
    toolsLabel.style.color = "#111";
    content.appendChild(toolsLabel);

    // Cursor Options
    if (cfg.features.cursorOptions) {
      var cursorRow = toggleRow(
        "a11y-cursor",
        "🖱️ Large Cursor",
        prefs.cursorEnabled,
        function (v) {
          onChange({ cursorEnabled: v });
          updateCursorSizeControls(v);
        },
        "Increase cursor size for better visibility."
      );
      controls.cursorCheckbox = cursorRow.checkbox;
      content.appendChild(cursorRow.row);

      var cursorSizeControlsContainer = el("div", { 
        id: "a11y-cursor-size-controls",
        class: "a11y-widget-row",
        style: "margin-top: 0.5rem; padding-left: 1.5rem; display: " + (prefs.cursorEnabled ? "block" : "none") + ";"
      });
      var cursorSizeRow = el("div", { class: "a11y-widget-row", style: "margin-bottom: 0.75rem;" });
      cursorSizeRow.appendChild(el("label", { 
        for: "a11y-cursor-size", 
        text: "Cursor Size", 
        style: "font-size: 12px; display: block; margin-bottom: 0.4rem;" 
      }));
      var cursorSizeSelect = el("select", {
        id: "a11y-cursor-size",
        name: "cursor-size",
        class: "a11y-widget-select",
        style: "width: 100%;",
        "aria-label": "Select cursor size"
      });
      controls.cursorSizeSelect = cursorSizeSelect;
      var cursorSizes = [
        ["small", "Small"],
        ["medium", "Medium"],
        ["large", "Large"],
        ["extra-large", "Extra Large"]
      ];
      for (var c = 0; c < cursorSizes.length; c++) {
        var opt = el("option", { value: cursorSizes[c][0], text: cursorSizes[c][1] });
        if (prefs.cursorSize === cursorSizes[c][0]) opt.selected = true;
        cursorSizeSelect.appendChild(opt);
      }
      cursorSizeSelect.addEventListener("change", function () {
        onChange({ cursorSize: cursorSizeSelect.value, cursorEnabled: true });
      });
      cursorSizeRow.appendChild(cursorSizeSelect);
      cursorSizeControlsContainer.appendChild(cursorSizeRow);

      var cursorColorRow = el("div", { class: "a11y-widget-row", style: "margin-top: 0.5rem;" });
      cursorColorRow.appendChild(el("label", { 
        for: "a11y-cursor-color", 
        text: "🎨 Cursor Color", 
        style: "font-size: 12px; display: block; margin-bottom: 0.4rem;" 
      }));
      var cursorColorWrap = el("div", { style: "display: flex; gap: 0.5rem; align-items: center;" });
      var cursorColorInput = el("input", {
        id: "a11y-cursor-color",
        type: "color",
        value: prefs.cursorColor || PREF_DEFAULTS.cursorColor,
        style: "width: 60px; height: 40px; border: 1px solid var(--a11y-color-border); border-radius: 4px; cursor: pointer;",
        "aria-label": "Select cursor color"
      });
      controls.cursorColorInput = cursorColorInput;
      var cursorColorTextInput = el("input", {
        id: "a11y-cursor-color-text",
        type: "text",
        value: prefs.cursorColor || PREF_DEFAULTS.cursorColor,
        placeholder: "#ffffff",
        style: "flex: 1; padding: 0.5rem; font-size: 12px; border: 1px solid var(--a11y-color-border); border-radius: 4px; font-family: monospace;",
        "aria-label": "Cursor color hex code"
      });
      controls.cursorColorTextInput = cursorColorTextInput;
      var updateCursorColor = function(color) {
        var normalized = normalizeHexColor(color, PREF_DEFAULTS.cursorColor);
        cursorColorInput.value = normalized;
        cursorColorTextInput.value = normalized;
        onChange({ cursorColor: normalized, cursorEnabled: true });
      };
      cursorColorInput.addEventListener("input", function() {
        updateCursorColor(cursorColorInput.value);
      });
      cursorColorTextInput.addEventListener("change", function() {
        updateCursorColor(cursorColorTextInput.value);
      });
      cursorColorWrap.appendChild(cursorColorInput);
      cursorColorWrap.appendChild(cursorColorTextInput);
      cursorColorRow.appendChild(cursorColorWrap);
      cursorColorRow.appendChild(el("div", { 
        class: "a11y-widget-help", 
        text: "Set a high-contrast cursor color for visibility." 
      }));
      cursorSizeControlsContainer.appendChild(cursorColorRow);

      cursorSizeControlsContainer.appendChild(el("div", { 
        class: "a11y-widget-help", 
        text: "Pick a cursor size that is easy to track." 
      }));
      content.appendChild(cursorSizeControlsContainer);
      controls.cursorSizeControlsContainer = cursorSizeControlsContainer;

      function updateCursorSizeControls(enabled) {
        if (controls.cursorSizeControlsContainer) {
          controls.cursorSizeControlsContainer.style.display = enabled ? "block" : "none";
        }
      }
      controls.updateCursorSizeControls = updateCursorSizeControls;
    }

    // Magnifier
    if (cfg.features.magnifier) {
      var magnifierRow = toggleRow(
        "a11y-magnifier",
        "🔍 Page Magnifier",
        prefs.magnifierEnabled,
        function (v) { 
          onChange({ magnifierEnabled: v });
          // Show/hide magnifier zoom slider dynamically
          updateMagnifierControls(v);
        },
        "Zoom parts of the page on hover for closer inspection."
      );
      controls.magnifierCheckbox = magnifierRow.checkbox;
      content.appendChild(magnifierRow.row);
      
      // Magnifier zoom slider container (will be shown/hidden)
      var magnifierControlsContainer = el("div", { 
        id: "a11y-magnifier-controls",
        class: "a11y-widget-row",
        style: "margin-top: 0.5rem; padding-left: 1.5rem; display: " + (prefs.magnifierEnabled ? "block" : "none") + ";"
      });
      
      magnifierControlsContainer.appendChild(el("label", { 
        for: "a11y-magnifier-zoom", 
        text: "Zoom Level: " + (prefs.magnifierZoom || 2.0) + "x", 
        style: "font-size: 12px; display: block; margin-bottom: 0.5rem;" 
      }));
      
      var magnifierZoomSlider = el("input", {
        id: "a11y-magnifier-zoom",
        type: "range",
        min: "1.5",
        max: "5.0",
        step: "0.5",
        value: String(prefs.magnifierZoom || 2.0),
        style: "width: 100%; margin-top: 0.5rem;"
      });
      controls.magnifierZoomSlider = magnifierZoomSlider;
      
      magnifierZoomSlider.addEventListener("input", function() {
        var zoomValue = parseFloat(magnifierZoomSlider.value);
        var label = magnifierControlsContainer.querySelector("label");
        if (label) {
          label.textContent = "Zoom Level: " + zoomValue + "x";
        }
        onChange({ magnifierZoom: zoomValue });
      });
      
      magnifierControlsContainer.appendChild(magnifierZoomSlider);
      content.appendChild(magnifierControlsContainer);
      controls.magnifierControlsContainer = magnifierControlsContainer;
      
      // Function to show/hide magnifier controls
      function updateMagnifierControls(enabled) {
        if (controls.magnifierControlsContainer) {
          controls.magnifierControlsContainer.style.display = enabled ? "block" : "none";
        }
      }
      controls.updateMagnifierControls = updateMagnifierControls;
    }

    // Dictionary
    if (cfg.features.dictionary) {
      var dictRow = toggleRow(
        "a11y-dictionary",
        "📚 Dictionary Lookup",
        prefs.dictionaryEnabled,
        function (v) { onChange({ dictionaryEnabled: v }); },
        "Double-click a word to see its definition."
      );
      controls.dictionaryCheckbox = dictRow.checkbox;
      content.appendChild(dictRow.row);
    }

    // Translation
    if (cfg.features.translation) {
      var transRow = toggleRow(
        "a11y-translation",
        "🌍 Translation",
        prefs.translationEnabled,
        function (v) { 
          onChange({ translationEnabled: v });
          // Show/hide translation language selector dynamically
          updateTranslationControls(v);
        },
        "Translate page content into different languages."
      );
      controls.translationCheckbox = transRow.checkbox;
      content.appendChild(transRow.row);
      
      // Translation language selector container (will be shown/hidden)
      var translationControlsContainer = el("div", { 
        id: "a11y-translation-controls",
        class: "a11y-widget-row",
        style: "margin-top: 0.5rem; padding-left: 1.5rem; display: " + (prefs.translationEnabled ? "block" : "none") + ";"
      });
      translationControlsContainer.appendChild(el("label", { for: "a11y-translation-lang", text: "Target Language", style: "font-size: 12px;" }));
      var langSelect = el("select", {
        id: "a11y-translation-lang",
        style: "width: 100%; margin-top: 0.5rem; padding: 0.5rem;"
      });
      
      var languages = [
        ["en", "English"], ["es", "Spanish"], ["fr", "French"], ["de", "German"],
        ["it", "Italian"], ["pt", "Portuguese"], ["ru", "Russian"], ["ja", "Japanese"],
        ["zh", "Chinese"], ["ar", "Arabic"], ["hi", "Hindi"], ["ko", "Korean"]
      ];
      
      for (var l = 0; l < languages.length; l++) {
        var opt = el("option", { value: languages[l][0], text: languages[l][1] });
        if (languages[l][0] === prefs.translationLanguage) opt.selected = true;
        langSelect.appendChild(opt);
      }
      
      langSelect.addEventListener("change", function() {
        onChange({ translationLanguage: langSelect.value });
      });
      translationControlsContainer.appendChild(langSelect);
      content.appendChild(translationControlsContainer);
      controls.translationControlsContainer = translationControlsContainer;
      
      // Function to show/hide translation controls
      function updateTranslationControls(enabled) {
        if (controls.translationControlsContainer) {
          controls.translationControlsContainer.style.display = enabled ? "block" : "none";
        }
      }
      controls.updateTranslationControls = updateTranslationControls;
    }

    // Presets
    if (cfg.features.presets) {
      content.appendChild(el("div", { class: "a11y-divider" }));
      var presetRow = el("div", { class: "a11y-widget-row" });
      var presetLabel = el("div", { text: "Quick Presets", class: "a11y-widget-help" });
      presetLabel.style.fontSize = "12px";
      presetLabel.style.fontWeight = "650";
      presetLabel.style.opacity = "1";
      presetLabel.style.marginBottom = "0.4rem";
      presetLabel.style.color = "#111";
      presetRow.appendChild(presetLabel);
      var presets = el("div", { class: "a11y-widget-presets" });
      
      // Helper function to add visual feedback to preset buttons
      function applyPresetFeedback(btn, presetContainer) {
        // Remove applied class from all buttons
        var allBtns = presetContainer.querySelectorAll(".a11y-widget-preset-btn");
        for (var i = 0; i < allBtns.length; i++) {
          allBtns[i].classList.remove("applied");
        }
        // Add applied class to clicked button
        btn.classList.add("applied");
        // Show confirmation toast
        showPresetToast("✓ " + btn.textContent.trim() + " preset applied!");
      }
      
      function showPresetToast(message) {
        var existingToast = document.getElementById("a11y-preset-toast");
        if (existingToast) existingToast.remove();
        
        var toast = document.createElement("div");
        toast.id = "a11y-preset-toast";
        toast.textContent = message;
        toast.style.cssText = 
          "position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); " +
          "background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: #fff; " +
          "padding: 12px 24px; border-radius: 25px; font-size: 14px; font-weight: 600; " +
          "z-index: 2147483003; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4); " +
          "animation: a11y-toast-in 0.3s ease; font-family: system-ui, sans-serif;";
        document.body.appendChild(toast);
        
        // Add animation keyframes if not exists
        if (!document.getElementById("a11y-toast-styles")) {
          var style = document.createElement("style");
          style.id = "a11y-toast-styles";
          style.textContent = "@keyframes a11y-toast-in { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }";
          document.head.appendChild(style);
        }
        
        setTimeout(function() {
          toast.style.opacity = "0";
          toast.style.transition = "opacity 0.3s ease";
          setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
        }, 2000);
      }

      // Core Presets - Based on WCAG 2.1 and accessibility research
      // Reduced to 6 essential presets to avoid overwhelming users
      
      // 1. Low Vision Preset - WCAG 2.1 SC 1.4.3, 1.4.4, 1.4.12
      // Combines: High contrast + Large text (150%) + Comfortable spacing + Readable font
      // Research: 150% text size is WCAG recommended minimum for low vision users
      var lowVision = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🔍 Low Vision",
        "aria-label": "Apply low vision preset: high contrast, 150% text size, comfortable spacing, readable font"
      });
      lowVision.addEventListener("click", function () {
        applyPresetFeedback(lowVision, presets);
        onChange({ 
          contrast: "high", 
          fontScale: 1.5,  // 150% - WCAG recommended for low vision
          spacing: "comfortable", 
          readableFont: true,
          reduceMotion: true
        });
      });
      
      // 2. Dyslexia-Friendly Preset - Based on dyslexia research
      // Research: Increased spacing (0.05em+ letter, 0.12em word) improves reading speed
      // Note: High contrast can worsen dyslexia, so default contrast is used
      var dyslexia = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "📖 Dyslexia",
        "aria-label": "Apply dyslexia-friendly preset: readable font, maximum spacing, 120% text size, reduced motion"
      });
      dyslexia.addEventListener("click", function () {
        applyPresetFeedback(dyslexia, presets);
        onChange({ 
          readableFont: true, 
          spacing: "max",  // Maximum spacing helps with letter/word recognition
          fontScale: 1.2,  // 120% - slightly larger helps without being overwhelming
          reduceMotion: true,
          contrast: "default"  // High contrast can worsen dyslexia symptoms
        });
      });
      
      // 3. Reduced Motion Preset - WCAG 2.1 SC 2.3.3 (Level AAA)
      // Respects prefers-reduced-motion and helps users with vestibular disorders
      var motion = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "⏸️ Reduced Motion",
        "aria-label": "Apply reduced motion preset: disable animations and transitions"
      });
      motion.addEventListener("click", function () {
        applyPresetFeedback(motion, presets);
        onChange({ 
          reduceMotion: true
        });
      });
      
      // 4. High Contrast Preset - WCAG 2.1 SC 1.4.3 (Contrast Minimum - Level AA)
      // Helps users with low vision, color blindness, and in bright lighting
      var highContrast = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🎨 High Contrast",
        "aria-label": "Apply high contrast preset: enhanced color contrast for better visibility"
      });
      highContrast.addEventListener("click", function () {
        applyPresetFeedback(highContrast, presets);
        onChange({ 
          contrast: "high",
          readableFont: true  // Sans-serif improves readability with high contrast
        });
      });
      
      // 5. Large Text Preset - WCAG 2.1 SC 1.4.4 (Resize Text - Level AA)
      // 150% text size is WCAG recommended minimum for low vision users
      var largeText = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🔤 Large Text",
        "aria-label": "Apply large text preset: 150% text size with comfortable spacing"
      });
      largeText.addEventListener("click", function () {
        applyPresetFeedback(largeText, presets);
        onChange({ 
          fontScale: 1.5,  // 150% - WCAG recommended minimum
          spacing: "comfortable",
          readableFont: true
        });
      });
      
      // 6. Dark Theme Preset - For light sensitivity and eye strain
      // Helps users with photophobia and reduces eye strain in low-light conditions
      var darkTheme = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🌙 Dark Theme",
        "aria-label": "Apply dark theme preset: dark background with light text for reduced eye strain"
      });
      darkTheme.addEventListener("click", function () {
        applyPresetFeedback(darkTheme, presets);
        onChange({ 
          contrast: "dark",
          spacing: "comfortable",
          readableFont: true,
          reduceMotion: true
        });
      });

      presets.appendChild(lowVision);
      presets.appendChild(dyslexia);
      presets.appendChild(motion);
      presets.appendChild(highContrast);
      presets.appendChild(largeText);
      presets.appendChild(darkTheme);
      presetRow.appendChild(presets);
      content.appendChild(presetRow);
    }

    // Check for Updates button
    content.appendChild(el("div", { class: "a11y-divider" }));
    var updateRow = el("div", { class: "a11y-widget-row" });
    var updateBtn = el("button", { 
      type: "button", 
      class: "a11y-widget-btn", 
      id: "a11y-check-updates",
      text: "🔄 Check for Updates",
      "aria-label": "Check for widget updates and reload if available"
    });
    updateBtn.style.width = "100%";
    updateBtn.style.marginTop = "0.3rem";
    updateBtn.style.padding = "0.6rem 0.75rem";
    
    var updateStatus = el("div", { 
      class: "a11y-widget-help", 
      id: "a11y-update-status",
      style: "margin-top: 0.5rem; font-weight: 500;",
      text: "Check for the latest widget design updates."
    });
    
    updateBtn.addEventListener("click", function () {
      checkForUpdates(cfg, updateBtn, updateStatus);
    });
    
    updateRow.appendChild(updateBtn);
    updateRow.appendChild(updateStatus);
    content.appendChild(updateRow);

    // Reset
    if (cfg.features.reset) {
      content.appendChild(el("div", { class: "a11y-divider" }));
      var resetRow = el("div", { class: "a11y-widget-row" });
      var resetBtn = el("button", { 
        type: "button", 
        class: "a11y-widget-btn", 
        text: "🔄 Reset to Defaults",
        "aria-label": "Reset all accessibility settings to default values"
      });
      resetBtn.style.width = "100%";
      resetBtn.style.marginTop = "0.3rem";
      resetBtn.style.padding = "0.6rem 0.75rem";
      resetBtn.addEventListener("click", function () { onReset(); });
      resetRow.appendChild(resetBtn);
      resetRow.appendChild(el("div", { class: "a11y-widget-help", text: "Restore all settings to their default values." }));
      content.appendChild(resetRow);
    }

    // Toolbar Mode Toggle
    content.appendChild(el("div", { class: "a11y-divider" }));
    var toolbarModeRow = toggleRow(
      "a11y-toolbar-mode",
      "📋 Toolbar Mode",
      prefs.toolbarMode || false,
      function (v) { 
        enhancedOnChange({ toolbarMode: v });
        toggleToolbarMode(v, root, controls, cfg, prefs, enhancedOnChange);
      },
      "Switch to floating toolbar at the bottom of the page for quick access to all features."
    );
    controls.toolbarModeCheckbox = toolbarModeRow.checkbox;
    content.appendChild(toolbarModeRow.row);

    // Keyboard Instructions Section
    content.appendChild(el("div", { class: "a11y-divider" }));
    var keyboardSection = el("div", { class: "a11y-widget-row" });
    var keyboardLabel = el("div", { 
      text: "⌨️ Keyboard Shortcuts", 
      style: "font-size: 12px; font-weight: 650; color: #111; margin-bottom: 0.5rem; opacity: 1;" 
    });
    keyboardSection.appendChild(keyboardLabel);
    
    var keyboardList = el("div", { 
      style: "font-size: 11px; line-height: 1.6; color: #666; margin-left: 0.5rem;" 
    });
    
    var shortcuts = [
      { key: cfg.keyboardShortcut || "Alt+A", desc: "Open/Close widget panel" },
      { key: "Esc", desc: "Close widget panel" },
      { key: "Tab", desc: "Navigate between controls" },
      { key: "Enter / Space", desc: "Activate buttons and toggles" },
      { key: "Arrow Keys", desc: "Navigate dropdown menus and sliders" }
    ];
    
    for (var s = 0; s < shortcuts.length; s++) {
      var shortcutItem = el("div", { 
        style: "display: flex; justify-content: space-between; margin-bottom: 0.3rem; padding: 0.2rem 0;" 
      });
      var keySpan = el("span", { 
        text: shortcuts[s].key,
        style: "font-weight: 600; color: #111; font-family: monospace; background: #f5f5f5; padding: 0.15rem 0.4rem; border-radius: 3px; margin-right: 0.5rem;"
      });
      var descSpan = el("span", { 
        text: shortcuts[s].desc,
        style: "flex: 1; color: #666;"
      });
      shortcutItem.appendChild(keySpan);
      shortcutItem.appendChild(descSpan);
      keyboardList.appendChild(shortcutItem);
    }
    
    keyboardSection.appendChild(keyboardList);
    keyboardSection.appendChild(el("div", { 
      class: "a11y-widget-help", 
      text: "Use keyboard shortcuts for quick access to accessibility features.",
      style: "margin-top: 0.5rem; font-size: 11px;"
    }));
    content.appendChild(keyboardSection);

    // Open/close behaviour
    var opener = null;
    function openPanel() {
      opener = document.activeElement;
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      var shortcutText = cfg.keyboardShortcut ? " (" + cfg.keyboardShortcut + ")" : "";
      toggle.setAttribute("aria-label", "Close accessibility settings" + shortcutText);
      // focus first input safely (skip close button)
      var content = panel.querySelector("#a11y-widget-content");
      var first = content ? content.querySelector("select, input, button, [tabindex]:not([tabindex='-1'])") : null;
      if (first) {
        setTimeout(function() {
          first.focus();
        }, 100);
      }
      emit(cfg, "widget_open", {});
    }

    function closePanel() {
      panel.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      var shortcutText = cfg.keyboardShortcut ? " (" + cfg.keyboardShortcut + ")" : "";
      toggle.setAttribute("aria-label", "Open accessibility settings" + shortcutText);
      if (opener && opener.focus) {
        setTimeout(function() {
          opener.focus();
        }, 100);
      }
      emit(cfg, "widget_close", {});
    }

    toggle.addEventListener("click", function (e) {
      // Check if we're on Vercel demo site (skip auth for demo)
      var hostname = window.location.hostname;
      var isVercelDemo = hostname === 'a11-widget.vercel.app' || 
                        hostname.endsWith('.vercel.app') ||
                        hostname === 'localhost' ||
                        hostname === '127.0.0.1';
      
      // Skip authentication check on Vercel demo site
      if (isVercelDemo) {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        if (expanded) closePanel(); else openPanel();
        return;
      }
      
      // Check authentication before opening panel (for external websites)
      if (window.__a11yAuth && typeof window.__a11yAuth.checkAuth === "function") {
        window.__a11yAuth.checkAuth().then(function(result) {
          if (result.authenticated) {
            // User is authenticated, proceed with opening/closing panel
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            if (expanded) closePanel(); else openPanel();
          } else {
            // Not authenticated, show login modal
            if (window.__a11yAuth && typeof window.__a11yAuth.showLoginModal === "function") {
              window.__a11yAuth.showLoginModal();
            } else {
              // Fallback: try to show login modal via event
              window.dispatchEvent(new CustomEvent("a11y-auth-required"));
            }
          }
        }).catch(function(error) {
          console.error("[A11Y Widget] Auth check error:", error);
          // On error, show login modal as fallback
          if (window.__a11yAuth && typeof window.__a11yAuth.showLoginModal === "function") {
            window.__a11yAuth.showLoginModal();
          }
        });
      } else {
        // No auth module loaded, proceed normally (backward compatibility)
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        if (expanded) closePanel(); else openPanel();
      }
    });

    panel.querySelector("#a11y-widget-close").addEventListener("click", closePanel);

    // Escape closes when focus inside panel
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePanel();
      }
    });

    // Non-modal: no focus trap; click outside closes (optional but safe)
    document.addEventListener("mousedown", function (e) {
      if (panel.hasAttribute("hidden")) return;
      if (!root.contains(e.target)) closePanel();
    });

    root.appendChild(toggle);
    root.appendChild(panel);

    // Create enhanced onChange that updates UI controls
    var enhancedOnChange = function(delta) {
      onChange(delta);
      // Get current prefs after onChange normalizes them
      var currentPrefs = Store.get(cfg.storageKey);
      if (currentPrefs) {
        updateUIControls(controls, normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs)));
      }
    };

    // Create enhanced onReset that updates UI controls
    var enhancedOnReset = function() {
      onReset();
      updateUIControls(controls, normalizePrefs(assign({}, PREF_DEFAULTS)));
    };

    // Setup keyboard shortcut
    setupKeyboardShortcut(cfg, openPanel, closePanel, toggle);

    // Toolbar Mode Toggle Function
    function toggleToolbarMode(enabled, root, controls, cfg, prefs, onChange) {
      if (enabled) {
        // Create toolbar if it doesn't exist
        if (!controls.toolbar) {
          controls.toolbar = createToolbar(cfg, controls, onChange, enhancedOnReset);
          document.body.appendChild(controls.toolbar);
        }
        // Always show toolbar when enabled (persists across tab switches)
        controls.toolbar.style.display = "flex";
        controls.toolbar.style.visibility = "visible";
        root.setAttribute("data-toolbar-mode", "true");
        // Hide toggle button when toolbar is active
        toggle.style.display = "none";
      } else {
        if (controls.toolbar) {
          controls.toolbar.style.display = "none";
          controls.toolbar.style.visibility = "hidden";
        }
        root.removeAttribute("data-toolbar-mode");
        // Show toggle button when toolbar is disabled
        toggle.style.display = "";
      }
    }

    // Create Toolbar Function
    function createToolbar(cfg, controls, onChange, onReset) {
      var toolbar = el("div", { 
        id: "a11y-widget-toolbar",
        role: "toolbar",
        "aria-label": "Accessibility toolbar"
      });
      // Ensure toolbar persists across tab switches
      toolbar.setAttribute("data-persist", "true");

      // Toolbar buttons with icons
      var toolbarButtons = [];

      // Contrast Mode Button
      if (cfg.features.contrast) {
        var contrastBtn = createToolbarButton("🎨", "Contrast Mode", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          var current = normalized.contrast || "default";
          var modes = ["default", "high", "dark", "light"];
          var nextIndex = (modes.indexOf(current) + 1) % modes.length;
          onChange({ contrast: modes[nextIndex] });
        });
        toolbarButtons.push(contrastBtn);
      }

      // Text Size Button (with +/-)
      if (cfg.features.fontScale) {
        var fontSizeDown = createToolbarButton("−", "Decrease Text Size", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          var current = normalized.fontScale || 1.0;
          onChange({ fontScale: Math.max(1.0, current - 0.1) });
        });
        var fontSizeUp = createToolbarButton("+", "Increase Text Size", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          var current = normalized.fontScale || 1.0;
          onChange({ fontScale: Math.min(1.6, current + 0.1) });
        });
        toolbarButtons.push(fontSizeDown);
        toolbarButtons.push(fontSizeUp);
      }

      // Text Spacing Button
      if (cfg.features.spacing) {
        var spacingBtn = createToolbarButton("📐", "Text Spacing", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          var current = normalized.spacing || "normal";
          var modes = ["normal", "comfortable", "max"];
          var nextIndex = (modes.indexOf(current) + 1) % modes.length;
          onChange({ spacing: modes[nextIndex] });
        });
        toolbarButtons.push(spacingBtn);
      }

      // Readable Font Toggle
      if (cfg.features.readableFont) {
        var readableFontBtn = createToolbarButton("🔤", "Readable Font", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ readableFont: !normalized.readableFont });
        });
        toolbarButtons.push(readableFontBtn);
      }

      // Reduce Motion Toggle
      if (cfg.features.reduceMotion) {
        var motionBtn = createToolbarButton("⏸️", "Reduce Motion", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ reduceMotion: !normalized.reduceMotion });
        });
        toolbarButtons.push(motionBtn);
      }

      // Text-to-Speech Toggle
      if (cfg.features.textToSpeech) {
        var ttsBtn = createToolbarButton("🔊", "Text-to-Speech", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ textToSpeechEnabled: !normalized.textToSpeechEnabled });
        });
        toolbarButtons.push(ttsBtn);
      }

      // Translation Toggle
      if (cfg.features.translation) {
        var translateBtn = createToolbarButton("🌐", "Translation", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ translationEnabled: !normalized.translationEnabled });
        });
        toolbarButtons.push(translateBtn);
      }

      // Reading Ruler Toggle
      if (cfg.features.readingRuler) {
        var rulerBtn = createToolbarButton("📏", "Reading Ruler", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ readingRulerEnabled: !normalized.readingRulerEnabled });
        });
        toolbarButtons.push(rulerBtn);
      }

      // Screen Mask Toggle
      if (cfg.features.screenMask) {
        var maskBtn = createToolbarButton("👁️", "Screen Mask", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ screenMaskEnabled: !normalized.screenMaskEnabled });
        });
        toolbarButtons.push(maskBtn);
      }

      // Text Only Mode Toggle
      if (cfg.features.textOnlyMode) {
        var textOnlyBtn = createToolbarButton("📄", "Text Only Mode", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ textOnlyMode: !normalized.textOnlyMode });
        });
        toolbarButtons.push(textOnlyBtn);
      }

      // Margins Toggle
      if (cfg.features.margins) {
        var marginsBtn = createToolbarButton("📐", "Margins", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ marginsEnabled: !normalized.marginsEnabled });
        });
        toolbarButtons.push(marginsBtn);
      }

      // Cursor Options Toggle
      if (cfg.features.cursorOptions) {
        var cursorBtn = createToolbarButton("🖱️", "Cursor Options", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ cursorEnabled: !normalized.cursorEnabled });
        });
        toolbarButtons.push(cursorBtn);
      }

      // Dictionary Toggle
      if (cfg.features.dictionary) {
        var dictBtn = createToolbarButton("📖", "Dictionary", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ dictionaryEnabled: !normalized.dictionaryEnabled });
        });
        toolbarButtons.push(dictBtn);
      }

      // Magnifier Toggle
      if (cfg.features.magnifier) {
        var magnifierBtn = createToolbarButton("🔍", "Magnifier", function() {
          var currentPrefs = Store.get(cfg.storageKey) || {};
          var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
          onChange({ magnifierEnabled: !normalized.magnifierEnabled });
        });
        toolbarButtons.push(magnifierBtn);
      }

      // Reset Button
      if (cfg.features.reset) {
        var resetBtn = createToolbarButton("🔄", "Reset", function() {
          onReset();
        });
        toolbarButtons.push(resetBtn);
      }

      // Panel Toggle Button (to open full panel)
      var panelBtn = createToolbarButton("⚙️", "Settings Panel", function() {
        openPanel();
      });
      toolbarButtons.push(panelBtn);

      // Close Toolbar Button (at the end)
      var closeBtn = createToolbarButton("✕", "Close Toolbar", function() {
        // Disable toolbar mode
        enhancedOnChange({ toolbarMode: false });
        toggleToolbarMode(false, root, controls, cfg, prefs, enhancedOnChange);
      });
      closeBtn.setAttribute("aria-label", "Close toolbar");
      closeBtn.setAttribute("title", "Close toolbar");
      closeBtn.className = "a11y-toolbar-btn a11y-toolbar-close-btn";
      toolbarButtons.push(closeBtn);

      // Append all buttons to toolbar
      for (var i = 0; i < toolbarButtons.length; i++) {
        toolbar.appendChild(toolbarButtons[i]);
      }

      return toolbar;
    }

    // Create Toolbar Button Helper
    function createToolbarButton(icon, label, onClick) {
      var btn = el("button", {
        type: "button",
        class: "a11y-toolbar-btn",
        "aria-label": label,
        title: label,
        html: icon
      });
      btn.addEventListener("click", onClick);
      return btn;
    }

    // Initialize toolbar mode if enabled
    if (prefs.toolbarMode) {
      toggleToolbarMode(true, root, controls, cfg, prefs, enhancedOnChange);
    }

    // Ensure toolbar persists across tab switches and page visibility changes
    // The toolbar should always be visible when toolbarMode is enabled, even when tab is in background
    var ensureToolbarVisible = function() {
      var currentPrefs = Store.get(cfg.storageKey);
      if (currentPrefs) {
        var normalized = normalizePrefs(assign(assign({}, PREF_DEFAULTS), currentPrefs));
        if (normalized.toolbarMode) {
          // Check if toolbar exists in DOM
          var existingToolbar = document.getElementById("a11y-widget-toolbar");
          if (existingToolbar) {
            // Toolbar exists, ensure it's visible
            existingToolbar.style.display = "flex";
            existingToolbar.style.visibility = "visible";
            controls.toolbar = existingToolbar;
          } else if (controls.toolbar) {
            // Controls reference exists but DOM element is missing, re-append
            if (controls.toolbar.parentNode !== document.body) {
              document.body.appendChild(controls.toolbar);
            }
            controls.toolbar.style.display = "flex";
            controls.toolbar.style.visibility = "visible";
          } else {
            // Toolbar doesn't exist, recreate it
            toggleToolbarMode(true, root, controls, cfg, normalized, enhancedOnChange);
          }
        }
      }
    };

    // Listen for visibility changes to restore toolbar if needed
    document.addEventListener("visibilitychange", function() {
      ensureToolbarVisible();
    });

    // Also check on page focus (when switching back to tab)
    window.addEventListener("focus", function() {
      ensureToolbarVisible();
    });

    // Check periodically to ensure toolbar persists (safety net)
    setInterval(function() {
      if (prefs.toolbarMode) {
        ensureToolbarVisible();
      }
    }, 2000);

    return { 
      root: root, 
      open: openPanel, 
      close: closePanel,
      controls: controls,
      updateControls: function(prefs) { updateUIControls(controls, prefs); }
    };
  }

  // --- Bootstrap (apply prefs before paint as best-effort) -------------------
  function getConfig() {
    var cfg = assign({}, DEFAULTS);

    // 1) window config
    if (window.__A11Y_WIDGET__ && typeof window.__A11Y_WIDGET__ === "object") {
      cfg = assign(cfg, window.__A11Y_WIDGET__);
    }

    // 2) script tag data-attrs (CSP-friendly)
    try {
      var scripts = document.getElementsByTagName("script");
      var self = scripts[scripts.length - 1]; // this script is typically last
      if (self) {
        var siteId = self.getAttribute("data-site-id");
        if (siteId) cfg.siteId = siteId;
        var position = self.getAttribute("data-position");
        if (position) cfg.position = position;
        var z = self.getAttribute("data-z-index");
        if (z) cfg.zIndex = Number(z);
        var surfaces = self.getAttribute("data-surfaces");
        if (surfaces) cfg.surfaces = surfaces.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      }
    } catch (e) {}

    // Auto-detect siteId from hostname if not provided
    if (!cfg.siteId && typeof window !== "undefined" && window.location) {
      try {
        cfg.siteId = window.location.hostname || "default-site";
        // Remove 'www.' prefix for cleaner IDs
        if (cfg.siteId.startsWith("www.")) {
          cfg.siteId = cfg.siteId.substring(4);
        }
      } catch (e) {
        cfg.siteId = "default-site";
      }
    }

    // sanitise
    cfg.position = (cfg.position === "left") ? "left" : "right";
    cfg.zIndex = Number(cfg.zIndex) || DEFAULTS.zIndex;
    cfg.surfaces = (cfg.surfaces && cfg.surfaces.length) ? cfg.surfaces : ["body"];

    return cfg;
  }

  // Auto-load CSS from GitHub if not already loaded by loader script
  // This is a fallback for direct widget.js usage (without loader)
  // Includes cache-busting to ensure updates propagate to all users
  function ensureCSS() {
    // Check if CSS was already loaded by loader script
    var existingCSS = document.getElementById("a11y-widget-stylesheet") || 
                      document.querySelector('link[href*="a11y-widget.css"]');
    if (existingCSS) {
      // CSS already loaded by loader script, don't duplicate
      return;
    }
    
    // Fallback: Load CSS if loader script wasn't used
    var link = document.createElement("link");
    link.id = "a11y-widget-stylesheet";
    link.rel = "stylesheet";
    // Use raw GitHub URL for immediate updates (no CDN caching delay)
    // Add cache-busting to ensure fresh loads when GitHub updates
    var timestamp = Math.floor(Date.now() / 1000); // Use seconds for better cache busting
    var rawUrl = "https://raw.githubusercontent.com/" + GITHUB_REPO + "/" + GITHUB_BRANCH + "/a11y-widget.css?v=" + timestamp;
    link.href = rawUrl;
    link.crossOrigin = "anonymous";
    
    // Fallback to jsDelivr CDN if raw GitHub fails
    link.onerror = function() {
      link.href = CDN_BASE + "a11y-widget.css?v=" + timestamp;
    };
    
    document.head.appendChild(link);
  }

  function init() {
    var cfg = getConfig();

    // Namespace guard
    if (window.__a11yWidget && window.__a11yWidget.__loaded) return;

    // Auto-load CSS from GitHub repository
    ensureCSS();
    
    // Set up dictionary handler once (it checks enabled state internally)
    setupDictionaryHandler();

    var stored = Store.get(cfg.storageKey);
    var prefs = normalizePrefs(assign(assign({}, PREF_DEFAULTS), stored || {}));

    // Apply prefs + mark surfaces early
    applyPrefs(prefs);
    // Check if globalMode is enabled in config or preferences
    var useGlobalMode = cfg.globalMode || prefs.globalMode || false;
    markSurfaces(cfg.surfaces, useGlobalMode);

    // Build UI after DOM ready
    function mount() {
      if (document.getElementById("a11y-widget-root")) return;

      var widget = buildWidget(
        cfg,
        prefs,
        function (delta) {
          prefs = normalizePrefs(assign(prefs, delta));
          applyPrefs(prefs);
          // Re-mark surfaces if globalMode changed
          if (delta.globalMode !== undefined) {
            markSurfaces(cfg.surfaces, prefs.globalMode || cfg.globalMode || false);
          }
          Store.set(cfg.storageKey, prefs);
          emit(cfg, "setting_change", { keys: Object.keys(delta) });
          // Update UI controls after preferences change
          if (widget.updateControls) {
            widget.updateControls(prefs);
          }
        },
        function () {
          prefs = normalizePrefs(assign({}, PREF_DEFAULTS));
          applyPrefs(prefs);
          Store.clear(cfg.storageKey);
          emit(cfg, "reset", {});
          // Update UI controls after reset
          if (widget.updateControls) {
            widget.updateControls(prefs);
          }
        }
      );

      document.body.appendChild(widget.root);

      // open on init if configured
      if (cfg.initialOpen) {
        try { widget.open(); } catch (e) {}
      }

      window.__a11yWidget = {
        __loaded: true,
        config: cfg,
        getPrefs: function () { return assign({}, prefs); },
        setPrefs: function (next) {
          prefs = normalizePrefs(assign(prefs, next || {}));
          applyPrefs(prefs);
          Store.set(cfg.storageKey, prefs);
        },
        reset: function () {
          prefs = normalizePrefs(assign({}, PREF_DEFAULTS));
          applyPrefs(prefs);
          Store.clear(cfg.storageKey);
        }
      };
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }
  }

  init();
})();
