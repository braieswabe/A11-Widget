import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const repoRoot = join(__dirname, '..')
const widgetPkg = JSON.parse(
  readFileSync(join(repoRoot, 'packages', 'a11y-widget', 'package.json'), 'utf8')
) as { version: string }
const WIDGET_SEMVER = widgetPkg.version
const VERSIONED_JS = `a11y-widget-v${WIDGET_SEMVER}.js`
const VERSIONED_LOADER = `a11y-widget-loader-v${WIDGET_SEMVER}.js`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-widget-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const isVersionedJs =
            req.url === `/${VERSIONED_JS}` ||
            req.url?.startsWith(`/${VERSIONED_JS}?`) ||
            req.url === '/a11y-widget.js' ||
            req.url?.startsWith('/a11y-widget.js?')
          if (isVersionedJs) {
            const npmCoreJs = join(repoRoot, 'packages', 'a11y-widget', 'vendor', 'a11y-widget.core.js')
            const widgetJsVersionedRoot = join(repoRoot, VERSIONED_JS)
            const widgetJsRoot = join(repoRoot, 'a11y-widget.js')
            const widgetJs = existsSync(npmCoreJs)
              ? npmCoreJs
              : existsSync(widgetJsVersionedRoot)
                ? widgetJsVersionedRoot
                : widgetJsRoot
            if (existsSync(widgetJs)) {
              res.setHeader('Content-Type', 'application/javascript')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(widgetJs))
              return
            }
          }

          const isLoader =
            req.url === `/${VERSIONED_LOADER}` || req.url?.startsWith(`/${VERSIONED_LOADER}?`)
          if (isLoader) {
            const loaderPath = join(repoRoot, VERSIONED_LOADER)
            if (existsSync(loaderPath)) {
              res.setHeader('Content-Type', 'application/javascript')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(loaderPath))
              return
            }
          }

          if (req.url === '/a11y-widget.css' || req.url?.startsWith('/a11y-widget.css?')) {
            const widgetCss = join(repoRoot, 'a11y-widget.css')
            const npmCss = join(repoRoot, 'packages', 'a11y-widget', 'assets', 'a11y-widget.css')
            const cssFile = existsSync(npmCss) ? npmCss : widgetCss
            if (existsSync(cssFile)) {
              res.setHeader('Content-Type', 'text/css')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(cssFile))
              return
            }
          }
          next()
        })
      },
      closeBundle() {
        const distPath = join(__dirname, 'dist')

        const npmCoreJs = join(repoRoot, 'packages', 'a11y-widget', 'vendor', 'a11y-widget.core.js')
        const npmCss = join(repoRoot, 'packages', 'a11y-widget', 'assets', 'a11y-widget.css')
        const widgetJsVersioned = join(repoRoot, VERSIONED_JS)
        const widgetLoaderVersioned = join(repoRoot, VERSIONED_LOADER)
        const widgetJs = join(repoRoot, 'a11y-widget.js')
        const widgetCss = join(repoRoot, 'a11y-widget.css')
        const downloadsDir = join(__dirname, 'public', 'downloads')
        const distDownloadsDir = join(distPath, 'downloads')

        if (existsSync(npmCoreJs)) {
          copyFileSync(npmCoreJs, join(distPath, VERSIONED_JS))
          console.log(`[Vite] Copied widget v${WIDGET_SEMVER} from npm package`)
        } else if (existsSync(widgetJsVersioned)) {
          copyFileSync(widgetJsVersioned, join(distPath, VERSIONED_JS))
          console.log(`[Vite] Copied widget v${WIDGET_SEMVER} fallback from root`)
        }

        if (existsSync(widgetLoaderVersioned)) {
          copyFileSync(widgetLoaderVersioned, join(distPath, VERSIONED_LOADER))
          console.log(`[Vite] Copied widget loader v${WIDGET_SEMVER}`)
        }

        if (existsSync(npmCoreJs)) {
          copyFileSync(npmCoreJs, join(distPath, 'a11y-widget.js'))
          console.log('[Vite] Copied legacy widget JS from npm package')
        } else if (existsSync(widgetJs)) {
          copyFileSync(widgetJs, join(distPath, 'a11y-widget.js'))
          console.log('[Vite] Copied legacy widget JS fallback from repo root')
        }

        if (existsSync(npmCss)) {
          copyFileSync(npmCss, join(distPath, 'a11y-widget.css'))
          console.log('[Vite] Copied widget CSS from npm package')
        } else if (existsSync(widgetCss)) {
          copyFileSync(widgetCss, join(distPath, 'a11y-widget.css'))
          console.log('[Vite] Copied widget CSS fallback from repo root')
        }

        if (existsSync(downloadsDir)) {
          if (!existsSync(distDownloadsDir)) {
            mkdirSync(distDownloadsDir, { recursive: true })
          }
          const files = readdirSync(downloadsDir)
          files.forEach((file) => {
            const src = join(downloadsDir, file)
            const dest = join(distDownloadsDir, file)
            if (statSync(src).isFile()) {
              copyFileSync(src, dest)
            }
          })
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: '/'
})
