# Installation Guide — WordPress

This guide covers installing the Accessibility Widget v1 on WordPress sites.

## Prerequisites

- WordPress admin access
- Ability to edit theme files or use plugins
- CDN domain where widget is hosted

## Installation Methods

### Method 1: Insert Headers and Footers Plugin (Easiest)

**Recommended for most users**

1. Install the [Insert Headers and Footers](https://wordpress.org/plugins/insert-headers-and-footers/) plugin
2. Go to **Settings → Insert Headers and Footers**
3. Paste this code in the **Scripts in Header** section:

```html
<!-- Just one line - widget loads automatically! -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>
```

4. Click **Save**
5. Clear any caching plugins (WP Super Cache, W3 Total Cache, etc.)

### Method 2: Theme Header File

**For theme developers**

1. Go to **Appearance → Theme Editor**
2. Select your active theme
3. Open `header.php`
4. Find `</head>` tag
5. Add the widget code **before** `</head>`:

```php
<!-- Accessibility Widget - Just one line! -->
<script src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" defer></script>
  window.__A11Y_WIDGET__ = {
    siteId: "<?php echo get_option('a11y_site_id', 'wordpress-site'); ?>",
    position: "right",
    surfaces: ["body", "main", ".entry-content"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

6. Click **Update File**

**Note**: Theme updates will overwrite this. Use a child theme or custom plugin instead.

### Method 3: Custom Plugin (Best Practice)

Create a custom plugin for persistent installation:

1. Create file: `wp-content/plugins/a11y-widget/a11y-widget.php`:

```php
<?php
/**
 * Plugin Name: Accessibility Widget v1
 * Description: Embeds accessibility widget for WCAG 2.1 AA-aligned enhancements
 * Version: 1.0.0
 */

function a11y_widget_enqueue() {
    ?>
    <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: "<?php echo esc_js(get_option('a11y_site_id', 'wordpress-site')); ?>",
        position: "<?php echo esc_js(get_option('a11y_position', 'right')); ?>",
        surfaces: ["body", "main", ".entry-content", ".wp-block-post-content"],
        enableTelemetry: <?php echo get_option('a11y_telemetry', false) ? 'true' : 'false'; ?>
      };
    </script>
    <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
    <?php
}
add_action('wp_head', 'a11y_widget_enqueue');
```

2. Go to **Plugins → Installed Plugins**
3. Activate "Accessibility Widget v1"

### Method 4: CSP-Friendly (Data Attributes)

If WordPress blocks inline scripts (rare), use data attributes:

```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script
  src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
  data-site-id="YOUR_SITE_ID"
  data-position="right"
  data-surfaces="body,main,.entry-content"
  defer
></script>
```

## WordPress-Specific Configuration

### Recommended Surfaces

WordPress content areas to include:

```javascript
surfaces: [
  "body",
  "main",
  ".entry-content",        // Classic editor content
  ".wp-block-post-content", // Block editor content
  ".wp-block-group__inner-container",
  "[data-canonical-surface='true']" // Custom surfaces
]
```

### Using WordPress Options

Store configuration in WordPress options:

```php
// In your plugin or theme functions.php
add_action('admin_init', function() {
    register_setting('a11y_widget_settings', 'a11y_site_id');
    register_setting('a11y_widget_settings', 'a11y_position');
    register_setting('a11y_widget_settings', 'a11y_telemetry');
});

// Then use in widget code:
siteId: "<?php echo esc_js(get_option('a11y_site_id')); ?>"
```

## Caching Considerations

### WP Super Cache / W3 Total Cache

1. Clear cache after installing widget
2. Widget loads client-side, so caching shouldn't affect it
3. If issues occur, exclude widget script from caching

### Autoptimize / Other Minifiers

If using script minification/combining plugins:

1. Exclude `a11y-widget.js` from optimization
2. Or disable defer/combining for this script
3. Widget is already minified and optimized

### CDN Caching

Widget assets are cached with immutable headers, so WordPress caching won't affect them.

## Troubleshooting

### Widget Not Appearing

1. **Clear WordPress cache** (if using caching plugin)
2. **Check browser console** for errors
3. **Verify script loads**: DevTools → Network → Look for `a11y-widget.js`
4. **Check theme conflicts**: Temporarily switch to default theme to test

### Script Blocked by Security Plugin

Some security plugins (Wordfence, etc.) may block external scripts:

1. Whitelist `cdn.YOURDOMAIN.com` in security plugin settings
2. Or use CSP-friendly method (data attributes)

### Settings Not Persisting

1. Check browser localStorage (DevTools → Application)
2. Verify cookies aren't blocked by privacy plugins
3. Check if site uses subdomain (preferences are per-domain)

### Gutenberg Block Editor

If using Gutenberg, include these surfaces:

```javascript
surfaces: [
  "body",
  ".wp-block-post-content",
  ".wp-block-group__inner-container",
  ".wp-block-columns"
]
```

## Example: Complete Plugin

Create `wp-content/plugins/a11y-widget/a11y-widget.php`:

```php
<?php
/**
 * Plugin Name: Accessibility Widget v1
 * Description: WCAG 2.1 AA-aligned accessibility enhancements
 * Version: 1.0.0
 * Author: Your Name
 */

if (!defined('ABSPATH')) {
    exit;
}

function a11y_widget_scripts() {
    $site_id = get_option('a11y_site_id', 'wordpress-' . get_current_blog_id());
    $position = get_option('a11y_position', 'right');
    $telemetry = get_option('a11y_telemetry', false);
    
    ?>
    <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: <?php echo json_encode($site_id); ?>,
        position: <?php echo json_encode($position); ?>,
        surfaces: ["body", "main", ".entry-content", ".wp-block-post-content"],
        enableTelemetry: <?php echo $telemetry ? 'true' : 'false'; ?>
      };
    </script>
    <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
    <?php
}
add_action('wp_head', 'a11y_widget_scripts', 1);
```

## Next Steps

- Configure [surfaces](README.md#surface-scoping) for your WordPress content
- Set up [telemetry](README.md#telemetry-optional) if needed
- Review [support statement](../support-statement.md) for scope boundaries

