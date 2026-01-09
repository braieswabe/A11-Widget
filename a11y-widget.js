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
    surfaces: ["body"],              // CSS selectors to mark as data-a11y-surface="true"
    features: {
      contrast: true,
      fontScale: true,
      spacing: true,
      reduceMotion: true,
      readableFont: true,
      presets: true,
      reset: true,
      skipLink: true
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
    reduceMotion: false
  };

  function normalizePrefs(p) {
    p = p || {};
    var out = {
      contrast: (p.contrast === "high" || p.contrast === "dark" || p.contrast === "light") ? p.contrast : "default",
      fontScale: clamp(Number(p.fontScale || 1.0), 1.0, 1.6),
      spacing: (p.spacing === "comfortable" || p.spacing === "max") ? p.spacing : "normal",
      readableFont: !!p.readableFont,
      reduceMotion: !!p.reduceMotion
    };
    return out;
  }

  // --- Apply to DOM ---------------------------------------------------------
  function applyPrefs(prefs) {
    var html = document.documentElement;
    html.setAttribute("data-a11y", "true");
    html.setAttribute("data-a11y-contrast", prefs.contrast);
    html.setAttribute("data-a11y-spacing", prefs.spacing);
    html.setAttribute("data-a11y-readable-font", prefs.readableFont ? "1" : "0");
    html.setAttribute("data-a11y-reduce-motion", prefs.reduceMotion ? "1" : "0");
    // CSS variables
    html.style.setProperty("--a11y-font-scale", String(prefs.fontScale));
  }

  function markSurfaces(selectors) {
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
      reduceMotionCheckbox: null
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
      title: "Accessibility Settings",
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
      contrastRow.appendChild(el("label", { for: "a11y-contrast", text: "Contrast Mode" }));
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
      var sizeLabel = el("label", { for: "a11y-font", class: "a11y-widget-label", text: "Text Size" });
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
      fs.appendChild(el("legend", { class: "a11y-widget-label", text: "Text Spacing" }));
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
        "Readable Font",
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
        "Reduce Motion",
        prefs.reduceMotion,
        function (v) { onChange({ reduceMotion: v }); },
        "Disable animations, transitions, and motion effects. Helps users sensitive to motion."
      );
      controls.reduceMotionCheckbox = motionRow.checkbox;
      content.appendChild(motionRow.row);
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

      // Low Vision Preset - Based on WCAG and accessibility best practices
      // Recommended: High contrast, 150% text size, comfortable spacing, readable font
      var lowVision = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🔍 Low Vision",
        "aria-label": "Apply low vision preset: high contrast mode, 150% text size, comfortable spacing, readable font, reduced motion"
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
      
      // Dyslexia-Friendly Preset - Based on dyslexia research and best practices
      // Recommended: Readable font, max spacing, slightly larger text (120%), reduced motion
      // Note: High contrast can worsen dyslexia, so we use default contrast
      var dyslexia = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "📖 Dyslexia-Friendly",
        "aria-label": "Apply dyslexia-friendly preset: readable sans-serif font, maximum spacing, 120% text size, reduced motion"
      });
      dyslexia.addEventListener("click", function () {
        onChange({ 
          readableFont: true, 
          spacing: "max",  // Maximum spacing helps with letter/word recognition
          fontScale: 1.2,  // 120% - slightly larger helps without being too large
          reduceMotion: true,
          contrast: "default"  // High contrast can worsen dyslexia
        });
      });
      
      // Reduced Motion Preset - WCAG 2.1 SC 2.3.3 (Animation from Interactions)
      // Recommended: Disable all motion, comfortable spacing for reading flow
      var motion = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "⏸️ Reduced Motion",
        "aria-label": "Apply reduced motion preset: disable animations and transitions, comfortable spacing"
      });
      motion.addEventListener("click", function () {
        onChange({ 
          reduceMotion: true,
          spacing: "comfortable"  // Helps maintain reading flow
        });
      });
      
      // High Contrast Preset - WCAG 2.1 SC 1.4.3 (Contrast Minimum)
      // Recommended: High contrast mode for better visibility
      var highContrast = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🎨 High Contrast",
        "aria-label": "Apply high contrast preset: enhanced color contrast for better visibility"
      });
      highContrast.addEventListener("click", function () {
        onChange({ 
          contrast: "high"
        });
      });
      
      // Large Text Preset - WCAG 2.1 SC 1.4.4 (Resize Text)
      // Recommended: 150% text size with comfortable spacing
      var largeText = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🔤 Large Text",
        "aria-label": "Apply large text preset: 150% text size with comfortable spacing"
      });
      largeText.addEventListener("click", function () {
        onChange({ 
          fontScale: 1.5,  // 150% - WCAG recommended
          spacing: "comfortable",
          readableFont: true
        });
      });
      
      // Extra Large Text Preset - WCAG 2.1 SC 1.4.4 (Resize Text)
      // Recommended: 160% text size for severe vision impairments
      var extraLargeText = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🔠 Extra Large",
        "aria-label": "Apply extra large text preset: 160% text size with maximum spacing for severe vision impairments"
      });
      extraLargeText.addEventListener("click", function () {
        onChange({ 
          fontScale: 1.6,  // 160% - Maximum supported
          spacing: "max",
          readableFont: true,
          contrast: "high"
        });
      });
      
      // Dark Theme Preset - For light sensitivity and eye strain
      // Recommended: Dark contrast mode with comfortable settings
      var darkTheme = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🌙 Dark Theme",
        "aria-label": "Apply dark theme preset: dark contrast mode with comfortable spacing and readable font"
      });
      darkTheme.addEventListener("click", function () {
        onChange({ 
          contrast: "dark",
          spacing: "comfortable",
          readableFont: true,
          reduceMotion: true
        });
      });
      
      // Reading Mode Preset - Optimized for reading comprehension
      // Recommended: Comfortable spacing, readable font, reduced motion
      var readingMode = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "📚 Reading Mode",
        "aria-label": "Apply reading mode preset: optimized spacing, readable font, reduced motion for better reading comprehension"
      });
      readingMode.addEventListener("click", function () {
        onChange({ 
          spacing: "comfortable",
          readableFont: true,
          reduceMotion: true,
          fontScale: 1.1  // Slightly larger for easier reading
        });
      });
      
      // Focus Mode Preset - Minimal distractions for concentration
      // Recommended: Reduced motion, comfortable spacing, readable font
      var focusMode = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🎯 Focus Mode",
        "aria-label": "Apply focus mode preset: reduced motion and comfortable spacing to minimize distractions"
      });
      focusMode.addEventListener("click", function () {
        onChange({ 
          reduceMotion: true,
          spacing: "comfortable",
          readableFont: true
        });
      });
      
      // Color Blind Friendly Preset - Enhanced contrast without color dependency
      // Recommended: High contrast mode with readable font
      var colorBlindFriendly = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "🎨 Color Blind",
        "aria-label": "Apply color blind friendly preset: high contrast mode with readable font for better color distinction"
      });
      colorBlindFriendly.addEventListener("click", function () {
        onChange({ 
          contrast: "high",
          readableFont: true,
          spacing: "comfortable"
        });
      });
      
      // Minimal Preset - Simplest settings for basic needs
      // Recommended: Just readable font and comfortable spacing
      var minimal = el("button", { 
        type: "button", 
        class: "a11y-widget-preset-btn", 
        text: "✨ Minimal",
        "aria-label": "Apply minimal preset: readable font and comfortable spacing with default settings"
      });
      minimal.addEventListener("click", function () {
        onChange({ 
          readableFont: true,
          spacing: "comfortable"
        });
      });

      presets.appendChild(lowVision);
      presets.appendChild(dyslexia);
      presets.appendChild(motion);
      presets.appendChild(highContrast);
      presets.appendChild(largeText);
      presets.appendChild(extraLargeText);
      presets.appendChild(darkTheme);
      presets.appendChild(readingMode);
      presets.appendChild(focusMode);
      presets.appendChild(colorBlindFriendly);
      presets.appendChild(minimal);
      presetRow.appendChild(presets);
      content.appendChild(presetRow);
    }

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
      toggle.setAttribute("aria-label", "Close accessibility settings");
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
      toggle.setAttribute("aria-label", "Open accessibility settings");
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

  // Auto-load CSS from GitHub if not already loaded
  // Includes cache-busting to ensure updates propagate to all users
  function ensureCSS() {
    if (document.getElementById("a11y-widget-stylesheet")) return;
    
    var link = document.createElement("link");
    link.id = "a11y-widget-stylesheet";
    link.rel = "stylesheet";
    // Use raw GitHub URL for immediate updates (no CDN caching delay)
    // Add cache-busting to ensure fresh loads when GitHub updates
    var timestamp = Math.floor(Date.now() / 1000); // Use seconds for better cache busting
    var rawUrl = "https://raw.githubusercontent.com/" + GITHUB_REPO + "/" + GITHUB_BRANCH + "/a11y-widget.css?t=" + timestamp;
    link.href = rawUrl;
    link.crossOrigin = "anonymous";
    
    // Fallback to jsDelivr CDN if raw GitHub fails
    link.onerror = function() {
      link.href = CDN_BASE + "a11y-widget.css?t=" + timestamp;
    };
    
    document.head.appendChild(link);
  }

  function init() {
    var cfg = getConfig();

    // Namespace guard
    if (window.__a11yWidget && window.__a11yWidget.__loaded) return;

    // Auto-load CSS from GitHub repository
    ensureCSS();

    var stored = Store.get(cfg.storageKey);
    var prefs = normalizePrefs(assign(assign({}, PREF_DEFAULTS), stored || {}));

    // Apply prefs + mark surfaces early
    applyPrefs(prefs);
    markSurfaces(cfg.surfaces);

    // Build UI after DOM ready
    function mount() {
      if (document.getElementById("a11y-widget-root")) return;

      var widget = buildWidget(
        cfg,
        prefs,
        function (delta) {
          prefs = normalizePrefs(assign(prefs, delta));
          applyPrefs(prefs);
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
