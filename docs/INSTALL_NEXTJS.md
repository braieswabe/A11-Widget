# Installation Guide — Next.js

This guide covers installing the Accessibility Widget v1 on Next.js applications (App Router or Pages Router).

## Prerequisites

- Next.js project (App Router or Pages Router)
- Access to `_app.tsx`, `layout.tsx`, or `_document.tsx`
- CDN domain where widget is hosted

## App Router (Next.js 13+)

### Method 1: Simple Installation (Recommended)

In `app/layout.tsx`:

```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Just one line - widget loads automatically! */}
        <Script 
          src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" 
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Method 2: With Custom Configuration

If you want to customize settings:

```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script id="a11y-config" strategy="beforeInteractive">
          {`
            window.__A11Y_WIDGET__ = {
              position: "right",
              surfaces: ["body", "main"]
            };
          `}
        </Script>
        <Script 
          src="https://cdn.jsdelivr.net/gh/braieswabe/A11-Widget@v1.6.1/a11y-widget-loader.js" 
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Method 2: Using Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_A11Y_SITE_ID=your-site-id
NEXT_PUBLIC_A11Y_POSITION=right
```

In `app/layout.tsx`:

```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
        <Script id="a11y-config" strategy="beforeInteractive">
          {`
            window.__A11Y_WIDGET__ = {
              siteId: "${process.env.NEXT_PUBLIC_A11Y_SITE_ID}",
              position: "${process.env.NEXT_PUBLIC_A11Y_POSITION || 'right'}",
              surfaces: ["body"],
              enableTelemetry: false
            };
          `}
        </Script>
        <Script 
          src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" 
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Method 3: CSP-Friendly (Data Attributes)

If CSP blocks inline scripts:

```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
      </head>
      <body>
        {children}
        <Script 
          src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js"
          data-site-id={process.env.NEXT_PUBLIC_A11Y_SITE_ID}
          data-position="right"
          data-surfaces="body"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
```

## Pages Router (Next.js 12 and below)

### Method 1: Using _app.tsx

In `pages/_app.tsx`:

```tsx
import type { AppProps } from 'next/app'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
      <Script id="a11y-config" strategy="beforeInteractive">
        {`
          window.__A11Y_WIDGET__ = {
            siteId: "${process.env.NEXT_PUBLIC_A11Y_SITE_ID}",
            position: "right",
            surfaces: ["body"],
            enableTelemetry: false
          };
        `}
      </Script>
      <Script 
        src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" 
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </>
  )
}
```

### Method 2: Using _document.tsx

In `pages/_document.tsx`:

```tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__A11Y_WIDGET__ = {
                siteId: "${process.env.NEXT_PUBLIC_A11Y_SITE_ID}",
                position: "right",
                surfaces: ["body"],
                enableTelemetry: false
              };
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" defer></script>
      </body>
    </Html>
  )
}
```

## Next.js-Specific Configuration

### Recommended Surfaces

For Next.js content:

```javascript
surfaces: [
  "body",
  "main",
  "[data-canonical-surface='true']",
  ".main-content" // Your content wrapper
]
```

### TypeScript Types (Optional)

Create `types/a11y-widget.d.ts`:

```typescript
declare global {
  interface Window {
    __A11Y_WIDGET__?: {
      siteId?: string
      position?: 'left' | 'right'
      surfaces?: string[]
      enableTelemetry?: boolean
      telemetryEndpoint?: string
      zIndex?: number
      initialOpen?: boolean
      locale?: string
      features?: {
        contrast?: boolean
        fontScale?: boolean
        spacing?: boolean
        reduceMotion?: boolean
        readableFont?: boolean
        presets?: boolean
        reset?: boolean
        skipLink?: boolean
      }
    }
    __a11yWidget?: {
      __loaded: boolean
      config: any
      getPrefs: () => any
      setPrefs: (prefs: any) => void
      reset: () => void
    }
  }
}

export {}
```

## SSR Considerations

### Avoid SSR Mismatch

The widget is client-side only. Use `next/script` with `strategy="afterInteractive"` or load dynamically:

```tsx
import { useEffect } from 'react'

export default function A11yWidget() {
  useEffect(() => {
    // Only load on client
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js'
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])
  
  return null
}
```

### Loading CSS

CSS can be loaded in `<head>` via `next/head` or `layout.tsx`:

```tsx
import Head from 'next/head'

// In your component
<Head>
  <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
</Head>
```

## Troubleshooting

### Widget Not Appearing

1. **Check browser console** for errors
2. **Verify script loads**: DevTools → Network → Look for `a11y-widget.js`
3. **Check SSR**: Ensure widget loads client-side only
4. **Verify environment variables**: Check `.env.local` is loaded

### Hydration Errors

If you see hydration mismatches:

1. Use `next/script` with `strategy="afterInteractive"`
2. Or load widget in `useEffect` hook
3. Don't render widget in SSR tree

### TypeScript Errors

1. Add type definitions (see above)
2. Or use `// @ts-ignore` for window properties
3. Or extend Window interface globally

### Build Errors

If build fails:

1. Ensure `NEXT_PUBLIC_*` prefix for env vars
2. Check script tags are in correct location
3. Verify CDN URLs are accessible

## Example: Complete App Router Setup

`app/layout.tsx`:

```tsx
import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: 'My App',
  description: 'My Next.js app with accessibility widget',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.css" />
        <Script id="a11y-config" strategy="beforeInteractive">
          {`
            window.__A11Y_WIDGET__ = {
              siteId: "${process.env.NEXT_PUBLIC_A11Y_SITE_ID || 'nextjs-app'}",
              position: "right",
              surfaces: ["body", "main"],
              enableTelemetry: ${process.env.NEXT_PUBLIC_A11Y_TELEMETRY === 'true' ? 'true' : 'false'}
            };
          `}
        </Script>
      </head>
      <body>
        {children}
        <Script 
          src="https://cdn.YOURDOMAIN.com/a11y-widget/v1/a11y-widget.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
```

## Next Steps

- Configure [surfaces](README.md#surface-scoping) for your Next.js content
- Set up [telemetry](README.md#telemetry-optional) if needed
- Review [support statement](../support-statement.md) for scope boundaries

