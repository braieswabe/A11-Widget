# Widget Core Patch Diff

## File: a11y-widget.js & a11y-widget-v1.1.0.js

### Change 1: Modified init() function signature

**Before:**
```javascript
function init() {
  var cfg = getConfig();
  // ...
}
```

**After:**
```javascript
function init(userConfig) {
  // Merge userConfig into window.__A11Y_WIDGET__ if provided
  if (userConfig && typeof userConfig === "object") {
    if (!window.__A11Y_WIDGET__) {
      window.__A11Y_WIDGET__ = {};
    }
    window.__A11Y_WIDGET__ = assign(window.__A11Y_WIDGET__, userConfig);
  }
  
  var cfg = getConfig();
  // ...
}
```

### Change 2: Remove auto-execution, expose init function

**Before:**
```javascript
  }

  init();
})();
```

**After:**
```javascript
  }

  // Expose init function for manual initialization (CDN loader or npm)
  window.__a11yWidgetInit = init;
})();
```

## File: a11y-widget-loader-v1.1.0.js

### Change: Update script.onload to call init function

**Before:**
```javascript
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
```

**After:**
```javascript
    script.onload = function() {
      console.log('[A11Y] JS loaded from:', script.src);
      // Initialize widget using exposed init function
      if (window.__a11yWidgetInit) {
        window.__a11yWidgetInit(window.__A11Y_WIDGET__);
        console.log('[A11Y] Widget initialized via CDN loader');
      } else {
        console.warn('[A11Y] Widget init function not found after script load');
      }
    };
```
