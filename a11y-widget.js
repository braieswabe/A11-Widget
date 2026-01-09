/*! a11y-widget.js — Accessibility Widget v1 (IIFE, no deps)
    Scope: widget UI + configured surfaces only.
    No claims of full-site ADA compliance.
    
    GitHub Repository: https://github.com/braieswabe/A11-Widget
    CDN: https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@main/
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
    cursorSize: "normal",            // normal|large|extra-large
    dictionaryEnabled: false,
    magnifierEnabled: false,
    magnifierZoom: 2.0               // Zoom level (1.5–5.0)
  };

  function normalizePrefs(p) {
    p = p || {};
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
      cursorSize: (p.cursorSize === "large" || p.cursorSize === "extra-large") ? p.cursorSize : "normal",
      dictionaryEnabled: !!p.dictionaryEnabled,
      magnifierEnabled: !!p.magnifierEnabled,
      magnifierZoom: clamp(Number(p.magnifierZoom || 2.0), 1.5, 5.0),
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
  var magnifierElement = null;
  var magnifierContent = null;
  var magnifierHandler = null;
  var magnifierMouseEnterHandler = null;
  var magnifierMouseLeaveHandler = null;
  var magnifierCanvas = null;

  function createMagnifier(prefs) {
    if (magnifierElement) {
      magnifierElement.remove();
    }
    if (magnifierHandler) {
      document.removeEventListener("mousemove", magnifierHandler);
      document.removeEventListener("mouseenter", magnifierHandler);
      document.removeEventListener("mouseleave", magnifierHandler);
    }
    
    var size = 200;
    var zoom = parseFloat(prefs.magnifierZoom || 2.0);
    var isMouseOver = false;
    var lastUpdateTime = 0;
    var throttleDelay = 16; // ~60fps
    
    magnifierElement = document.createElement("div");
    magnifierElement.id = "a11y-magnifier";
    magnifierElement.style.cssText = 
      "position: fixed; " +
      "pointer-events: none; " +
      "z-index: 2147482997; " +
      "width: " + size + "px; " +
      "height: " + size + "px; " +
      "border: 3px solid #0066cc; " +
      "border-radius: 50%; " +
      "overflow: hidden; " +
      "box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.1); " +
      "display: none; " +
      "background: white; " +
      "transform: translate(-50%, -50%);";
    
    // Create canvas for magnified content with higher resolution for better quality
    magnifierCanvas = document.createElement("canvas");
    var canvasScale = 2; // Higher resolution for better quality
    magnifierCanvas.width = size * canvasScale;
    magnifierCanvas.height = size * canvasScale;
    magnifierCanvas.style.cssText = 
      "width: 100%; " +
      "height: 100%; " +
      "display: block; " +
      "image-rendering: -webkit-optimize-contrast; " +
      "image-rendering: crisp-edges;";
    
    magnifierContent = document.createElement("div");
    magnifierContent.style.cssText = 
      "width: 100%; " +
      "height: 100%; " +
      "position: relative; " +
      "overflow: hidden; " +
      "border-radius: 50%;";
    magnifierContent.appendChild(magnifierCanvas);
    magnifierElement.appendChild(magnifierContent);
    document.body.appendChild(magnifierElement);
    
    magnifierHandler = function(e) {
      var html = document.documentElement;
      var enabled = html.getAttribute("data-a11y-magnifier") === "1";
      
      if (!enabled || !magnifierElement || !magnifierCanvas) {
        if (magnifierElement) {
          magnifierElement.style.display = "none";
        }
        return;
      }
      
      // Throttle updates for better performance
      var now = Date.now();
      if (now - lastUpdateTime < throttleDelay && e.type === "mousemove") {
        return;
      }
      lastUpdateTime = now;
      
      var currentZoom = parseFloat(html.style.getPropertyValue("--a11y-magnifier-zoom") || "2.0");
      zoom = currentZoom;
      
      magnifierElement.style.display = "block";
      
      // Position magnifier to follow cursor with offset
      var offsetX = 120;
      var offsetY = 120;
      var x = e.clientX + offsetX;
      var y = e.clientY - offsetY;
      
      // Keep within viewport bounds
      if (x + size / 2 > window.innerWidth) {
        x = e.clientX - offsetX - size;
      }
      if (y - size / 2 < 0) {
        y = e.clientY + offsetY;
      }
      if (x - size / 2 < 0) {
        x = size / 2;
      }
      if (y + size / 2 > window.innerHeight) {
        y = window.innerHeight - size / 2;
      }
      
      magnifierElement.style.left = x + "px";
      magnifierElement.style.top = y + "px";
      
      // Draw magnified content immediately
      drawMagnifiedContent(e.clientX, e.clientY, zoom, magnifierCanvas, size);
    };
    
    // Handle mouse enter/leave for better performance
    var mouseEnterHandler = function(e) {
      isMouseOver = true;
      if (magnifierElement) {
        magnifierElement.style.display = "block";
      }
    };
    
    var mouseLeaveHandler = function(e) {
      isMouseOver = false;
      if (magnifierElement) {
        magnifierElement.style.display = "none";
      }
    };
    
    document.addEventListener("mousemove", magnifierHandler, { passive: true });
    document.addEventListener("mouseenter", mouseEnterHandler, { passive: true });
    document.addEventListener("mouseleave", mouseLeaveHandler, { passive: true });
  }
  
  function drawMagnifiedContent(mouseX, mouseY, zoomLevel, canvas, size) {
    if (!canvas) return;
    
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    var canvasScale = 2; // Match the scale used in createMagnifier
    var scaledSize = size * canvasScale;
    
    // Clear canvas
    ctx.clearRect(0, 0, scaledSize, scaledSize);
    
    // Calculate source area (what part of the page to magnify)
    var sourceSize = size / zoomLevel;
    var sourceX = mouseX - sourceSize / 2;
    var sourceY = mouseY - sourceSize / 2;
    
    // Use a more efficient approach: capture viewport and crop
    // First try html2canvas if available
    if (typeof html2canvas !== "undefined") {
      // Capture a larger area around the cursor for better quality
      var captureSize = Math.max(sourceSize * 1.5, 300);
      var captureX = Math.max(0, mouseX - captureSize / 2);
      var captureY = Math.max(0, mouseY - captureSize / 2);
      
      html2canvas(document.body, {
        x: captureX,
        y: captureY,
        width: Math.min(captureSize, window.innerWidth - captureX),
        height: Math.min(captureSize, window.innerHeight - captureY),
        scale: 1,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null
      }).then(function(canvasImg) {
        if (canvasImg && ctx) {
          // Calculate the offset within the captured image
          var offsetX = mouseX - captureX;
          var offsetY = mouseY - captureY;
          
          // Draw the captured content scaled up with circular clipping
          ctx.save();
          ctx.beginPath();
          ctx.arc(scaledSize / 2, scaledSize / 2, scaledSize / 2 - 4, 0, Math.PI * 2);
          ctx.clip();
          
          // Draw the magnified area
          var drawSize = sourceSize;
          var drawX = (scaledSize / 2) - (drawSize * canvasScale / 2);
          var drawY = (scaledSize / 2) - (drawSize * canvasScale / 2);
          
          ctx.drawImage(
            canvasImg,
            offsetX - drawSize / 2, offsetY - drawSize / 2, // Source position
            drawSize, drawSize, // Source size
            drawX, drawY, // Destination position
            drawSize * canvasScale, drawSize * canvasScale // Destination size (magnified)
          );
          
          ctx.restore();
        }
      }).catch(function(err) {
        // Fallback if html2canvas fails
        drawFallbackMagnifier(ctx, scaledSize, zoomLevel);
      });
    } else {
      // Load html2canvas dynamically
      if (!window.html2canvasLoading && !window.html2canvasFailed) {
        window.html2canvasLoading = true;
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = function() {
          window.html2canvasLoading = false;
          window.html2canvas = true;
          drawMagnifiedContent(mouseX, mouseY, zoomLevel, canvas, size);
        };
        script.onerror = function() {
          window.html2canvasLoading = false;
          window.html2canvasFailed = true;
          drawFallbackMagnifier(ctx, scaledSize, zoomLevel);
        };
        document.head.appendChild(script);
      } else if (window.html2canvasFailed) {
        drawFallbackMagnifier(ctx, scaledSize, zoomLevel);
      }
    }
  }
  
  function drawFallbackMagnifier(ctx, size, zoomLevel) {
    // Draw a white background
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw a subtle pattern
    ctx.fillStyle = "#f0f0f0";
    var patternSize = 20;
    for (var y = 0; y < size; y += patternSize) {
      for (var x = 0; x < size; x += patternSize) {
        if ((x + y) % (patternSize * 2) === 0) {
          ctx.fillRect(x, y, patternSize, patternSize);
        }
      }
    }
    
    // Draw zoom level text
    ctx.fillStyle = "#0066cc";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(zoomLevel + "x", size / 2, size / 2);
    
    // Draw a crosshair at center
    ctx.strokeStyle = "#0066cc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 15, size / 2);
    ctx.lineTo(size / 2 + 15, size / 2);
    ctx.moveTo(size / 2, size / 2 - 15);
    ctx.lineTo(size / 2, size / 2 + 15);
    ctx.stroke();
    
    // Draw zoom level text
    ctx.fillStyle = "#0066cc";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(zoomLevel.toFixed(1) + "x", size / 2, size - 15);
    
    // Draw instruction text
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";
    ctx.fillText("Move mouse", size / 2, size / 2 + 5);
  }

  function removeMagnifier() {
    if (magnifierElement) {
      magnifierElement.remove();
      magnifierElement = null;
      magnifierContent = null;
      magnifierCanvas = null;
    }
    if (magnifierHandler) {
      document.removeEventListener("mousemove", magnifierHandler);
      magnifierHandler = null;
    }
    if (magnifierMouseEnterHandler) {
      document.removeEventListener("mouseenter", magnifierMouseEnterHandler);
      magnifierMouseEnterHandler = null;
    }
    if (magnifierMouseLeaveHandler) {
      document.removeEventListener("mouseleave", magnifierMouseLeaveHandler);
      magnifierMouseLeaveHandler = null;
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
  function translateText(text, targetLang) {
    if (!text || !targetLang || targetLang === "en") return Promise.resolve(null);
    
    // Use MyMemory API (free tier)
    // Note: For production, you'd want to use a proper translation API with API key
    var apiUrl = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=en|" + targetLang;
    
    return fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) throw new Error("Translation failed");
        return response.json();
      })
      .then(function(data) {
        if (data && data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText;
        }
        return null;
      })
      .catch(function() {
        return null;
      });
  }

  // Translation state tracking
  var translationCache = {};
  var translationNodes = [];

  function applyTranslation(prefs) {
    if (!prefs.translationEnabled || prefs.translationLanguage === "en") {
      removeTranslation();
      return;
    }

    var targetLang = prefs.translationLanguage;
    var surfaces = document.querySelectorAll("[data-a11y-surface='true']");
    
    // Clear previous translation state
    removeTranslation();
    translationNodes = [];

    // Collect all text nodes from surfaces
    for (var i = 0; i < surfaces.length; i++) {
      var surface = surfaces[i];
      // Skip widget elements
      if (surface.id && surface.id.indexOf("a11y-widget") === 0) continue;
      
      var walker = document.createTreeWalker(
        surface,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      var node;
      while ((node = walker.nextNode())) {
        var text = node.textContent.trim();
        if (text && text.length > 0) {
          // Skip if already has original text stored (already translated)
          if (node.parentElement && node.parentElement.getAttribute("data-a11y-original-text")) {
            continue;
          }
          translationNodes.push({
            node: node,
            text: text,
            parent: node.parentElement
          });
        }
      }
    }

    // Translate in batches to reduce API calls
    translateBatch(translationNodes, targetLang, 0);
  }

  function translateBatch(nodes, targetLang, startIndex) {
    var batchSize = 5; // Translate 5 nodes at a time
    var endIndex = Math.min(startIndex + batchSize, nodes.length);
    var batch = nodes.slice(startIndex, endIndex);
    
    if (batch.length === 0) {
      // All translations complete
      return;
    }

    var promises = [];
    for (var i = 0; i < batch.length; i++) {
      var item = batch[i];
      var text = item.text;
      
      // Check cache first
      var cacheKey = text + "|" + targetLang;
      if (translationCache[cacheKey]) {
        applyTranslationToNode(item, translationCache[cacheKey]);
        continue;
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
    }

    // Wait for all promises in batch
    Promise.all(promises).then(function(results) {
      for (var j = 0; j < results.length; j++) {
        if (results[j]) {
          applyTranslationToNode(results[j].item, results[j].translated);
        }
      }
      
      // Continue with next batch
      if (endIndex < nodes.length) {
        setTimeout(function() {
          translateBatch(nodes, targetLang, endIndex);
        }, 100); // Small delay to avoid rate limiting
      }
    });
  }

  function applyTranslationToNode(item, translatedText) {
    if (!item.node || !item.parent) return;
    
    // Store original text in parent element's data attribute
    if (!item.parent.getAttribute("data-a11y-original-text")) {
      item.parent.setAttribute("data-a11y-original-text", item.text);
    }
    
    // Replace text content
    try {
      item.node.textContent = translatedText;
    } catch (e) {
      // Ignore errors
    }
  }

  function removeTranslation() {
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
    
    // Update spacing radios
    if (controls.spacingRadios) {
      for (var i = 0; i < controls.spacingRadios.length; i++) {
        controls.spacingRadios[i].checked = (controls.spacingRadios[i].value === prefs.spacing);
      }
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
      spacingRadios: [],
      readableFontCheckbox: null,
      reduceMotionCheckbox: null,
      // Advanced features
      textToSpeechCheckbox: null,
      readingRulerCheckbox: null,
      screenMaskCheckbox: null,
      textOnlyModeCheckbox: null,
      marginsCheckbox: null,
      cursorCheckbox: null,
      magnifierCheckbox: null,
      magnifierZoomSlider: null,
      magnifierControlsContainer: null,
      dictionaryCheckbox: null,
      translationCheckbox: null,
      globalModeCheckbox: null
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

    var toggle = el("button", {
      id: "a11y-widget-toggle",
      type: "button",
      "aria-controls": "a11y-widget-panel",
      "aria-expanded": "false",
      "aria-label": "Open accessibility settings",
      "aria-haspopup": "dialog",
      "aria-keyshortcuts": cfg.keyboardShortcut || undefined,
      title: "Accessibility Settings" + (cfg.keyboardShortcut ? " (" + cfg.keyboardShortcut + ")" : ""),
      text: "Accessibility"
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

    // Spacing preset radios
    if (cfg.features.spacing) {
      var spacingRow = el("div", { class: "a11y-widget-row" });
      var fs = el("fieldset", { class: "a11y-widget-fieldset" });
      fs.appendChild(el("legend", { class: "a11y-widget-label", text: "📐 Text Spacing" }));
      var group = el("div", { class: "a11y-widget-radio-group" });
      var spacingOpts = [
        ["normal", "Normal"],
        ["comfortable", "Comfortable"],
        ["max", "Max"]
      ];
      for (var s = 0; s < spacingOpts.length; s++) {
        var id = "a11y-spacing-" + spacingOpts[s][0];
        var radioWrapper = el("div", { class: "a11y-widget-radio-wrapper" });
        var r = el("input", { 
          id: id, 
          type: "radio", 
          name: "a11y-spacing", 
          value: spacingOpts[s][0],
          class: "a11y-widget-radio"
        });
        if (prefs.spacing === spacingOpts[s][0]) r.checked = true;
        controls.spacingRadios.push(r);
        r.addEventListener("change", function (ev) {
          if (ev.target && ev.target.checked) onChange({ spacing: ev.target.value });
        });
        var l = el("label", { for: id, class: "a11y-widget-radio-label", text: spacingOpts[s][1] });
        radioWrapper.appendChild(r);
        radioWrapper.appendChild(l);
        group.appendChild(radioWrapper);
      }
      fs.appendChild(group);
      spacingRow.appendChild(fs);
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
        function (v) { onChange({ cursorEnabled: v }); },
        "Increase cursor size for better visibility."
      );
      controls.cursorCheckbox = cursorRow.checkbox;
      content.appendChild(cursorRow.row);
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

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closePanel(); else openPanel();
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
