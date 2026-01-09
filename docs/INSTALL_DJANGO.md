# Installation Guide — Django / Rails / .NET

This guide covers installing the Accessibility Widget v1 on server-side rendered applications (Django, Rails, .NET, etc.).

## Prerequisites

- Access to base template/layout file
- Ability to edit HTML templates
- CDN domain where widget is hosted

## Django

### Method 1: Base Template

In your `base.html` or `layout.html`:

```django
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}My Site{% endblock %}</title>
    
    <!-- Accessibility Widget -->
    <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: "{{ request.get_host }}",
        position: "right",
        surfaces: ["body", "main"],
        enableTelemetry: false
      };
    </script>
    <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
</head>
<body>
    {% block content %}{% endblock %}
</body>
</html>
```

### Method 2: Template Tag

Create `templatetags/a11y_widget.py`:

```python
from django import template

register = template.Library()

@register.inclusion_tag('a11y_widget/widget.html')
def a11y_widget(site_id=None, position='right'):
    return {
        'site_id': site_id or 'django-site',
        'position': position
    }
```

Create `templates/a11y_widget/widget.html`:

```django
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "{{ site_id }}",
    position: "{{ position }}",
    surfaces: ["body", "main"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

Use in templates:

```django
{% load a11y_widget %}
{% a11y_widget site_id=request.get_host position="right" %}
```

### Method 3: Settings Configuration

In `settings.py`:

```python
A11Y_WIDGET_CONFIG = {
    'site_id': 'django-site',
    'position': 'right',
    'surfaces': ['body', 'main'],
    'enable_telemetry': False
}
```

In template:

```django
<script>
  window.__A11Y_WIDGET__ = {{ A11Y_WIDGET_CONFIG|safe }};
</script>
```

## Ruby on Rails

### Method 1: Application Layout

In `app/views/layouts/application.html.erb`:

```erb
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    
    <!-- Accessibility Widget -->
    <%= stylesheet_link_tag 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css', media: 'all' %>
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: "<%= request.host %>",
        position: "right",
        surfaces: ["body", "main"],
        enableTelemetry: false
      };
    </script>
    <%= javascript_include_tag 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js', defer: true %>
  </head>
  <body>
    <%= yield %>
  </body>
</html>
```

### Method 2: Partial

Create `app/views/shared/_a11y_widget.html.erb`:

```erb
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "<%= Rails.application.config.a11y_site_id || request.host %>",
    position: "<%= Rails.application.config.a11y_position || 'right' %>",
    surfaces: ["body", "main"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

Include in layout:

```erb
<%= render 'shared/a11y_widget' %>
```

### Method 3: Configuration

In `config/application.rb` or `config/environments/production.rb`:

```ruby
config.a11y_site_id = 'rails-app'
config.a11y_position = 'right'
```

## .NET (ASP.NET Core)

### Method 1: Layout File

In `Views/Shared/_Layout.cshtml`:

```cshtml
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>@ViewData["Title"]</title>
    
    <!-- Accessibility Widget -->
    <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: "@Context.Request.Host",
        position: "right",
        surfaces: ["body", "main"],
        enableTelemetry: false
      };
    </script>
    <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
</head>
<body>
    @RenderBody()
</body>
</html>
```

### Method 2: Partial View

Create `Views/Shared/_A11yWidget.cshtml`:

```cshtml
<link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
<script>
  window.__A11Y_WIDGET__ = {
    siteId: "@Configuration["A11y:SiteId"]",
    position: "@Configuration["A11y:Position"]",
    surfaces: ["body", "main"],
    enableTelemetry: false
  };
</script>
<script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
```

Include in layout:

```cshtml
@await Html.PartialAsync("_A11yWidget")
```

### Method 3: Configuration

In `appsettings.json`:

```json
{
  "A11y": {
    "SiteId": "dotnet-app",
    "Position": "right"
  }
}
```

## General Considerations

### CSP Headers

If you control CSP headers, allow:

```
script-src 'self' https://cdn.YOURDOMAIN.com;
style-src 'self' https://cdn.YOURDOMAIN.com;
```

### Environment Variables

Use environment variables for configuration:

**Django**:
```python
import os
site_id = os.environ.get('A11Y_SITE_ID', 'default-site')
```

**Rails**:
```ruby
site_id = ENV['A11Y_SITE_ID'] || 'default-site'
```

**.NET**:
```csharp
var siteId = Configuration["A11Y_SITE_ID"] ?? "default-site";
```

### Recommended Surfaces

Common server-side rendered content areas:

```javascript
surfaces: [
  "body",
  "main",
  ".content",
  ".main-content",
  "[data-canonical-surface='true']"
]
```

## Troubleshooting

### Widget Not Appearing

1. **Check template rendering**: Verify widget code is in rendered HTML
2. **Check browser console**: Look for JavaScript errors
3. **Verify CDN access**: Ensure CDN is accessible from client
4. **Check CSP**: Verify CSP allows external scripts/styles

### Template Syntax Errors

1. **Escape quotes**: Use proper template escaping
2. **JSON encoding**: Use `|safe` (Django) or `raw` (Rails) for JSON
3. **Check syntax**: Verify template syntax is correct

### Settings Not Persisting

1. Check browser localStorage (DevTools → Application)
2. Verify cookies aren't blocked
3. Check domain matching (subdomains are separate)

## Example: Complete Django Setup

`templates/base.html`:

```django
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}My Site{% endblock %}</title>
    
    {% load static %}
    <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
    <script>
      window.__A11Y_WIDGET__ = {
        siteId: "{{ request.get_host }}",
        position: "right",
        surfaces: ["body", "main", ".content"],
        enableTelemetry: false
      };
    </script>
    <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
</head>
<body>
    <main>
        {% block content %}{% endblock %}
    </main>
</body>
</html>
```

## Next Steps

- Configure [surfaces](README.md#surface-scoping) for your content
- Set up [telemetry](README.md#telemetry-optional) if needed
- Review [support statement](../support-statement.md) for scope boundaries

