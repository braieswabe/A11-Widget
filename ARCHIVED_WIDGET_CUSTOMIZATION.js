/**
 * ARCHIVED: Widget Appearance and Icon Customization Sections
 * 
 * This file contains the archived code for Widget Appearance and Icon Customization
 * that was removed from the widget UI. This code is preserved for future reference
 * and can be restored if needed.
 * 
 * Archived Date: 2026-01-13
 * Reason: Removed from UI to simplify widget interface
 */

// ============================================================================
// WIDGET APPEARANCE SECTION (ARCHIVED)
// ============================================================================
// This section was located after the "Check for Updates" button
// and before the "Reset" button section

function ARCHIVED_WidgetAppearanceSection() {
  return `
    // Widget Appearance Section
    content.appendChild(el("div", { class: "a11y-divider" }));
    var appearanceRow = el("div", { class: "a11y-widget-row" });
    appearanceRow.appendChild(el("legend", { text: "🎨 Widget Appearance" }));

    var themeSelect = el("select", { 
      id: "a11y-widget-theme",
      "aria-label": "Select widget theme"
    });
    var themes = [
      ["default", "Default"],
      ["light", "Light"],
      ["dark", "Dark"],
      ["high-contrast", "High Contrast"],
      ["compact", "Compact"],
      ["spacious", "Spacious"]
    ];
    for (var i = 0; i < themes.length; i++) {
      var opt = el("option", { value: themes[i][0], text: themes[i][1] });
      if (prefs.widgetTheme === themes[i][0]) opt.selected = true;
      themeSelect.appendChild(opt);
    }
    themeSelect.addEventListener("change", function() {
      var theme = themeSelect.value;
      enhancedOnChange({ 
        widgetTheme: theme,
        widgetCustomization: {}
      });
      var root = document.getElementById("a11y-widget-root");
      var updatedPrefs = assign({}, prefs);
      updatedPrefs.widgetTheme = theme;
      updatedPrefs.widgetCustomization = {};
      applyWidgetCustomization(updatedPrefs, root);
    });
    appearanceRow.appendChild(themeSelect);
    appearanceRow.appendChild(el("div", { 
      class: "a11y-widget-help", 
      text: "Choose a preset theme for the widget appearance." 
    }));
    content.appendChild(appearanceRow);
  `;
}

// ============================================================================
// ICON CUSTOMIZATION SECTION (ARCHIVED)
// ============================================================================
// This section included:
// - Icon Size slider
// - Icon Design selector with previews
// - Icon Style preset selector
// - Icon Upload functionality
// - Uploaded Icons List

function ARCHIVED_IconCustomizationSection() {
  return `
    // Icon Customization Section
    content.appendChild(el("div", { class: "a11y-divider" }));
    var iconRow = el("div", { class: "a11y-widget-row" });
    iconRow.appendChild(el("legend", { text: "🎯 Icon Customization" }));

    // Size slider
    var sizeRow = el("div", { class: "a11y-widget-row" });
    sizeRow.appendChild(el("label", { for: "a11y-icon-size", text: "Icon Size" }));
    var sizeWrapper = el("div", { class: "a11y-widget-range-wrapper" });
    var sizeRange = el("input", {
      type: "range",
      id: "a11y-icon-size",
      min: "32",
      max: "80",
      step: "4",
      value: String(prefs.iconSize || 48)
    });
    var sizeValue = el("div", { 
      class: "a11y-widget-font-value",
      text: (prefs.iconSize || 48) + "px"
    });
    sizeRange.addEventListener("input", function() {
      var size = parseInt(sizeRange.value);
      sizeValue.textContent = size + "px";
      var updatedPrefs = assign({}, prefs);
      updatedPrefs.iconSize = size;
      enhancedOnChange({ iconSize: size });
      renderIcon(updatedPrefs, toggle);
    });
    sizeWrapper.appendChild(sizeRange);
    sizeWrapper.appendChild(sizeValue);
    sizeRow.appendChild(sizeWrapper);
    iconRow.appendChild(sizeRow);

    // Icon Design Selector with Previews
    var designRow = el("div", { class: "a11y-widget-field" });
    designRow.appendChild(el("label", { text: "Icon Design", style: "display: block; margin-bottom: 0.5rem; font-weight: 500;" }));
    var designGrid = el("div", { 
      style: "display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-bottom: 0.5rem;" 
    });
    
    var iconDesignNames = {
      default: "Default",
      circleA: "Circle A",
      universal: "Universal",
      eye: "Eye",
      gear: "Gear",
      heart: "Heart",
      shield: "Shield",
      hand: "Hand",
      star: "Star",
      checkmark: "Checkmark"
    };
    
    Object.keys(ICON_DESIGNS).forEach(function(designKey) {
      var designBtn = el("button", {
        type: "button",
        class: "a11y-icon-design-btn",
        "aria-label": iconDesignNames[designKey] || designKey,
        title: iconDesignNames[designKey] || designKey,
        style: "width: 100%; aspect-ratio: 1; padding: 0.5rem; border: 2px solid var(--a11y-color-border); border-radius: 6px; background: var(--a11y-color-bg); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;"
      });
      
      if (prefs.iconDesign === designKey) {
        designBtn.style.borderColor = "var(--a11y-color-secondary)";
        designBtn.style.backgroundColor = "var(--a11y-color-bg-light)";
        designBtn.style.boxShadow = "0 2px 4px rgba(0,123,255,0.2)";
      }
      
      // Create preview icon
      var previewSize = 32;
      var previewIcon = el("div", {
        style: "width: " + previewSize + "px; height: " + previewSize + "px; display: flex; align-items: center; justify-content: center;"
      });
      var designFn = ICON_DESIGNS[designKey];
      previewIcon.innerHTML = designFn();
      designBtn.appendChild(previewIcon);
      
      designBtn.addEventListener("click", function() {
        // Update selected state
        var allBtns = designGrid.querySelectorAll(".a11y-icon-design-btn");
        for (var i = 0; i < allBtns.length; i++) {
          allBtns[i].style.borderColor = "var(--a11y-color-border)";
          allBtns[i].style.backgroundColor = "var(--a11y-color-bg)";
          allBtns[i].style.boxShadow = "none";
        }
        designBtn.style.borderColor = "var(--a11y-color-secondary)";
        designBtn.style.backgroundColor = "var(--a11y-color-bg-light)";
        designBtn.style.boxShadow = "0 2px 4px rgba(0,123,255,0.2)";
        
        // Update preferences
        var updatedPrefs = assign({}, prefs);
        updatedPrefs.iconDesign = designKey;
        enhancedOnChange({ iconDesign: designKey });
        renderIcon(updatedPrefs, toggle);
      });
      
      designBtn.addEventListener("mouseenter", function() {
        if (prefs.iconDesign !== designKey) {
          designBtn.style.borderColor = "var(--a11y-color-primary-light)";
          designBtn.style.backgroundColor = "var(--a11y-color-bg-light)";
        }
      });
      
      designBtn.addEventListener("mouseleave", function() {
        if (prefs.iconDesign !== designKey) {
          designBtn.style.borderColor = "var(--a11y-color-border)";
          designBtn.style.backgroundColor = "var(--a11y-color-bg)";
        }
      });
      
      designGrid.appendChild(designBtn);
    });
    
    designRow.appendChild(designGrid);
    iconRow.appendChild(designRow);

    // Style preset selector
    var styleRow = el("div", { class: "a11y-widget-field" });
    styleRow.appendChild(el("label", { for: "a11y-icon-style", text: "Icon Style" }));
    var styleSelect = el("select", { id: "a11y-icon-style" });
    ["default", "minimal", "bold", "outline"].forEach(function(style) {
      var opt = el("option", { value: style, text: style.charAt(0).toUpperCase() + style.slice(1) });
      if (prefs.iconStyle === style) opt.selected = true;
      styleSelect.appendChild(opt);
    });
    styleSelect.addEventListener("change", function() {
      var style = styleSelect.value;
      enhancedOnChange({ 
        iconStyle: style,
        iconCustomization: {}
      });
      var updatedPrefs = assign({}, prefs);
      updatedPrefs.iconStyle = style;
      updatedPrefs.iconCustomization = {};
      renderIcon(updatedPrefs, toggle);
    });
    styleRow.appendChild(styleSelect);
    iconRow.appendChild(styleRow);
    iconRow.appendChild(el("div", { 
      class: "a11y-widget-help", 
      text: "Choose icon size, design, and style preset. Upload your own icon below." 
    }));
    content.appendChild(iconRow);

    // Icon Upload Section
    var uploadRow = el("div", { class: "a11y-widget-row" });
    uploadRow.appendChild(el("legend", { text: "📤 Upload Custom Icon" }));

    var fileInput = el("input", {
      type: "file",
      id: "a11y-icon-upload",
      accept: "image/png,image/jpeg,image/svg+xml,image/gif,image/webp"
    });
    fileInput.style.display = "none";

    var uploadBtn = el("button", {
      type: "button",
      class: "a11y-widget-btn",
      text: "Choose Icon File"
    });
    uploadBtn.addEventListener("click", function() {
      fileInput.click();
    });

    fileInput.addEventListener("change", function(e) {
      var file = e.target.files[0];
      if (!file) return;
      
      // Validate file size (max 500KB)
      if (file.size > 500 * 1024) {
        alert("Icon file must be smaller than 500KB");
        return;
      }
      
      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|svg\+xml|gif|webp)$/)) {
        alert("Please select a valid image file (PNG, JPEG, SVG, GIF, or WebP)");
        return;
      }
      
      var reader = new FileReader();
      reader.onload = function(e) {
        var dataUrl = e.target.result;
        IconDB.saveIcon(dataUrl, file.name).then(function(iconId) {
          var updatedPrefs = assign({}, prefs);
          updatedPrefs.iconId = iconId;
          enhancedOnChange({ iconId: iconId });
          renderIcon(updatedPrefs, toggle);
          alert("Icon uploaded successfully!");
          // Reload icons list
          if (typeof loadUploadedIcons === "function") {
            loadUploadedIcons();
          }
        }).catch(function(err) {
          console.error("Failed to save icon:", err);
          alert("Failed to upload icon. Please try again.");
        });
      };
      reader.readAsDataURL(file);
      // Reset file input
      fileInput.value = "";
    });

    uploadRow.appendChild(uploadBtn);
    uploadRow.appendChild(fileInput);
    uploadRow.appendChild(el("div", { 
      class: "a11y-widget-help", 
      text: "Upload PNG, JPEG, SVG, GIF, or WebP image (max 500KB). Icon will persist across sessions." 
    }));
    content.appendChild(uploadRow);

    // Uploaded Icons List
    var iconsListRow = el("div", { class: "a11y-widget-row", id: "a11y-uploaded-icons" });
    iconsListRow.appendChild(el("legend", { text: "📋 Your Uploaded Icons" }));
    var iconsList = el("div", { id: "a11y-icons-list" });
    iconsListRow.appendChild(iconsList);
    content.appendChild(iconsListRow);

    // Load and display uploaded icons
    function loadUploadedIcons() {
      IconDB.listIcons().then(function(icons) {
        iconsList.innerHTML = "";
        if (icons.length === 0) {
          iconsList.appendChild(el("div", { 
            class: "a11y-widget-help",
            text: "No uploaded icons yet. Upload an icon above to get started." 
          }));
          return;
        }
        icons.forEach(function(icon) {
          var iconItem = el("div", { 
            class: "a11y-widget-field",
            style: "display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border: 1px solid var(--a11y-color-border); border-radius: var(--a11y-radius); margin-bottom: 0.5rem;"
          });
          
          IconDB.getIcon(icon.iconId).then(function(dataUrl) {
            if (dataUrl) {
              var img = el("img", {
                src: dataUrl,
                alt: icon.name,
                style: "width: 32px; height: 32px; object-fit: contain; border-radius: 4px;"
              });
              iconItem.appendChild(img);
            }
          }).catch(function() {
            // Ignore errors loading icon preview
          });
          
          var nameSpan = el("span", { text: icon.name, style: "flex: 1;" });
          iconItem.appendChild(nameSpan);
          
          var useBtn = el("button", {
            type: "button",
            class: "a11y-widget-btn",
            text: "Use",
            style: "padding: 0.25rem 0.5rem; font-size: 12px;"
          });
          useBtn.addEventListener("click", function() {
            var updatedPrefs = assign({}, prefs);
            updatedPrefs.iconId = icon.iconId;
            enhancedOnChange({ iconId: icon.iconId });
            renderIcon(updatedPrefs, toggle);
          });
          iconItem.appendChild(useBtn);
          
          var deleteBtn = el("button", {
            type: "button",
            class: "a11y-widget-btn",
            text: "Delete",
            style: "padding: 0.25rem 0.5rem; font-size: 12px; background: #dc3545; color: white;"
          });
          deleteBtn.addEventListener("click", function() {
            if (confirm("Delete this icon?")) {
              IconDB.deleteIcon(icon.iconId).then(function() {
                loadUploadedIcons();
                if (prefs.iconId === icon.iconId) {
                  var updatedPrefs = assign({}, prefs);
                  updatedPrefs.iconId = null;
                  enhancedOnChange({ iconId: null });
                  renderIcon(updatedPrefs, toggle);
                }
              }).catch(function(err) {
                console.error("Failed to delete icon:", err);
                alert("Failed to delete icon. Please try again.");
              });
            }
          });
          iconItem.appendChild(deleteBtn);
          
          iconsList.appendChild(iconItem);
        });
      }).catch(function(err) {
        console.error("Failed to load icons:", err);
        iconsList.innerHTML = "";
        iconsList.appendChild(el("div", { 
          class: "a11y-widget-help",
          text: "Unable to load uploaded icons. IndexedDB may not be available." 
        }));
      });
    }

    loadUploadedIcons();
  `;
}

// ============================================================================
// NOTES
// ============================================================================
// 
// These sections were removed to simplify the widget interface.
// The functionality can be restored by:
// 1. Copying the code from this archive file
// 2. Inserting it back into the buildWidget() function
// 3. Ensuring all dependencies (ICON_DESIGNS, IconDB, renderIcon, etc.) are available
//
// Related functions that may still be needed:
// - applyWidgetCustomization() - applies widget theme
// - renderIcon() - renders icon with selected design/style
// - IconDB - IndexedDB wrapper for icon storage
// - WIDGET_THEMES - theme presets object
// - ICON_PRESETS - icon style presets object
// - ICON_DESIGNS - icon design SVG functions object
