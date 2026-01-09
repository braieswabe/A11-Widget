# Installation Guide — Google Tag Manager

This guide covers installing the Accessibility Widget v1 via Google Tag Manager when direct code access isn't available.

## Prerequisites

- Google Tag Manager access
- GTM container ID
- CDN domain where widget is hosted

## Installation Steps

### Step 1: Create Custom HTML Tag

1. Log in to Google Tag Manager
2. Go to your container
3. Click **Tags → New**
4. Name it: "Accessibility Widget v1"

### Step 2: Configure Tag

1. **Tag Type**: Choose **Custom HTML**
2. **HTML**: Paste this code:

```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{Site ID}}", // Use GTM variable or hardcode
    position: "right",
    surfaces: ["body"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

3. **Tag Firing**: Choose **All Pages** (or create custom trigger)
4. **Tag Priority**: Set to **100** (load early)
5. **Tag Sequencing**: 
   - **Fire a tag before this tag fires**: None
   - **Fire a tag after this tag fires**: None

### Step 3: Create GTM Variables (Optional)

For dynamic configuration, create variables:

1. **Variables → New**
2. Create these variables:

**Site ID Variable**:
- Type: **Constant**
- Value: `your-site-id`

**Position Variable**:
- Type: **Constant**
- Value: `right`

Then use in tag:

```html
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{Site ID}}",
    position: "{{Position}}",
    surfaces: ["body"],
    enableTelemetry: false
  };
</script>
```

### Step 4: Configure Trigger

**Trigger Type**: **Page View**
- **This tag fires on**: **All Pages**

Or create custom trigger for specific pages:

**Trigger Type**: **Page View**
- **This tag fires on**: **Some Page Views**
- Condition: `Page URL` `contains` `/blog` (example)

### Step 5: Test and Publish

1. Click **Preview** to test
2. Verify widget loads on test pages
3. Check browser console for errors
4. Click **Submit** to publish

## GTM-Specific Considerations

### Load Timing

GTM can load after page paint, causing a flash. To minimize:

1. **Set Tag Priority**: Higher number = loads earlier
2. **Use DOM Ready Trigger**: Instead of Page View (if available)
3. **Load CSS First**: CSS loads synchronously, JS loads defer

### CSP-Friendly Option

If CSP blocks inline scripts in GTM:

**Option 1**: Use data attributes (requires separate tag for config):

**Tag 1** (Config via data attributes):
```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js';
    script.setAttribute('data-site-id', 'your-site-id');
    script.setAttribute('data-position', 'right');
    script.setAttribute('data-surfaces', 'body');
    script.defer = true;
    document.body.appendChild(script);
  })();
</script>
```

**Tag 2** (CSS):
```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
```

### Preventing Duplicate Loads

GTM may fire multiple times. Add guard:

```html
<script>
  if (!window.__a11yWidget || !window.__a11yWidget.__loaded) {
    window.__A11Y_WIDGET__ = {
      siteId: "your-site-id",
      position: "right",
      surfaces: ["body"],
      enableTelemetry: false
    };
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css';
    document.head.appendChild(link);
    
    var script = document.createElement('script');
    script.src = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js';
    script.defer = true;
    document.body.appendChild(script);
  }
</script>
```

## Advanced Configuration

### Conditional Loading

Load widget only on specific pages:

**Trigger**: **Page View**
- **This tag fires on**: **Some Page Views**
- Conditions:
  - `Page URL` `does not contain` `/admin`
  - `Page URL` `does not contain` `/checkout`

### Using GTM Data Layer

If you push data to GTM data layer:

```javascript
// In your site code
dataLayer.push({
  'a11ySiteId': 'your-site-id',
  'a11yPosition': 'right'
});
```

Then in GTM tag:

```html
<script>
  window.__A11Y_WIDGET__ = {
    siteId: {{a11ySiteId}} || "default-site-id",
    position: {{a11yPosition}} || "right",
    surfaces: ["body"],
    enableTelemetry: false
  };
</script>
```

## Troubleshooting

### Widget Not Appearing

1. **Check GTM Preview**: Verify tag fires
2. **Check browser console**: Look for errors
3. **Verify tag priority**: Ensure it's not blocked
4. **Check trigger**: Verify trigger fires on page
5. **Check CSP**: GTM may be blocked by CSP

### Flash of Unstyled Content (FOUC)

GTM loads asynchronously, so widget may appear unstyled briefly:

1. **Load CSS first**: Create separate tag for CSS with higher priority
2. **Use DOM Ready**: Fire tag on DOM ready instead of page view
3. **Acceptable**: Small FOUC is normal with GTM

### Duplicate Widgets

If widget appears twice:

1. **Check tag firing**: Ensure tag only fires once
2. **Add guard**: Use duplicate prevention code (see above)
3. **Check multiple containers**: Ensure only one GTM container

### CSP Issues

If CSP blocks GTM:

1. **Whitelist GTM domain**: `https://www.googletagmanager.com`
2. **Whitelist CDN domain**: `https://cdn.YOURDOMAIN.com`
3. **Use CSP-friendly method**: Data attributes (see above)

## Example: Complete GTM Tag Configuration

**Tag Name**: Accessibility Widget v1

**Tag Type**: Custom HTML

**HTML**:
```html
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  (function() {
    // Prevent duplicate loads
    if (window.__a11yWidget && window.__a11yWidget.__loaded) return;
    
    window.__A11Y_WIDGET__ = {
      siteId: "{{Site ID}}",
      position: "right",
      surfaces: ["body"],
      enableTelemetry: false
    };
    
    var script = document.createElement('script');
    script.src = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js';
    script.defer = true;
    document.body.appendChild(script);
  })();
</script>
```

**Triggering**: All Pages

**Tag Priority**: 100

**Tag Firing Options**: Once per page

## Best Practices

1. **Test in Preview Mode**: Always test before publishing
2. **Use Variables**: Store config in GTM variables for easy updates
3. **Monitor Performance**: Check GTM doesn't slow page load
4. **Document Changes**: Keep notes on tag configuration
5. **Version Control**: Use GTM versions for rollback

## Next Steps

- Configure [surfaces](README.md#surface-scoping) for your content
- Set up [telemetry](README.md#telemetry-optional) if needed
- Review [support statement](../support-statement.md) for scope boundaries

