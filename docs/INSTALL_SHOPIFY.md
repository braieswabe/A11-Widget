# Installation Guide — Shopify

This guide covers installing the Accessibility Widget v1 on Shopify stores.

## Prerequisites

- Shopify admin access
- Ability to edit theme code
- CDN domain where widget is hosted

## Installation Steps

### Step 1: Access Theme Editor

1. Log in to Shopify admin
2. Go to **Online Store → Themes**
3. Click **Actions → Edit code** on your active theme

### Step 2: Edit theme.liquid

1. In the theme editor, open `layout/theme.liquid`
2. Find the `</head>` tag
3. Add the widget code **before** `</head>`:

```liquid
<!-- Accessibility Widget - Just one line! -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>
```

4. Click **Save**

### Step 3: Configure Surfaces

Update `surfaces` to match your Shopify theme structure:

```javascript
surfaces: [
  "body",
  "main",
  ".shopify-section",
  ".main-content",
  "[data-canonical-surface='true']"
]
```

## Shopify-Specific Configuration

### Using Shopify Variables

You can use Liquid variables:

```liquid
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{ shop.permanent_domain }}",
    position: "right",
    surfaces: ["body", "main", ".shopify-section"],
    enableTelemetry: false,
    zIndex: 2147483000 // Ensure it's above cart drawer
  };
</script>
```

### Recommended Surfaces for Shopify

Common Shopify content areas:

```javascript
surfaces: [
  "body",
  "main",
  ".shopify-section",
  ".main-content",
  ".product__description",
  ".rte", // Rich text editor content
  "[data-canonical-surface='true']"
]
```

## Z-Index Considerations

Shopify themes often have high z-index elements (cart drawer, modals). The widget defaults to `2147483000`, but you may need to adjust:

```javascript
zIndex: 999999 // Lower if needed, but ensure it's above content
```

Test that the widget doesn't cover:
- Cart drawer
- Product modals
- Navigation menus
- Checkout buttons

## CSP-Friendly Installation

If Shopify blocks inline scripts (rare), use data attributes:

```liquid
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script
  src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
  data-site-id="{{ shop.permanent_domain }}"
  data-position="right"
  data-surfaces="body,main,.shopify-section"
  defer
></script>
```

## Testing

1. **Preview theme** before publishing
2. Test on different pages:
   - Homepage
   - Product pages
   - Collection pages
   - Cart page
3. Verify widget doesn't interfere with:
   - Cart functionality
   - Product image zoom
   - Checkout process
   - Theme modals

## Troubleshooting

### Widget Not Appearing

1. **Check browser console** for errors
2. **Verify script loads**: DevTools → Network → Look for `a11y-widget.js`
3. **Check theme conflicts**: Some themes may override scripts
4. **Clear Shopify cache**: Settings → Online Store → Clear cache

### Widget Covers Important Elements

1. **Adjust z-index**: Lower the widget z-index
2. **Change position**: Use `position: "left"` instead of `"right"`
3. **Check cart drawer**: Ensure widget doesn't cover cart button

### Settings Not Persisting

1. Check browser localStorage (DevTools → Application)
2. Verify cookies aren't blocked
3. Check if using subdomain (preferences are per-domain)

### Theme Updates

**Important**: Theme updates will overwrite your changes!

**Solutions**:
1. **Use a custom theme** (not a purchased theme you update)
2. **Document your changes** so you can reapply after updates
3. **Use Shopify Scripts** (if available) to inject widget
4. **Create a backup** of your theme before updates

## Example: Complete theme.liquid Snippet

Add before `</head>` in `layout/theme.liquid`:

```liquid
{% comment %}
  Accessibility Widget v1
  Provides WCAG 2.1 AA-aligned enhancements for declared surfaces
{% endcomment %}
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{ shop.permanent_domain }}",
    position: "right",
    surfaces: [
      "body",
      "main",
      ".shopify-section",
      ".main-content",
      ".product__description",
      ".rte"
    ],
    enableTelemetry: false,
    zIndex: 999999 // Adjust if needed for your theme
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

## Alternative: Shopify App (Advanced)

For persistent installation across theme updates, create a Shopify app:

1. Create a Shopify app in Partners dashboard
2. Use App Proxy or Script Tags API
3. Inject widget via app extension

This is more complex but survives theme updates.

## Next Steps

- Configure [surfaces](README.md#surface-scoping) for your Shopify content
- Test widget on all page types
- Review [support statement](../support-statement.md) for scope boundaries
- Consider z-index adjustments for your theme

