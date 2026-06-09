import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-widget-files',
      configureServer(server) {
        // In development, serve widget files from npm package or root
        server.middlewares.use((req, res, next) => {
          // Serve widget file - prefer npm-synced runtime with root fallback
          const isWidgetJsRequest =
            req.url === '/a11y-widget-v1.6.8.js' ||
            req.url?.startsWith('/a11y-widget-v1.6.8.js?') ||
            req.url === '/a11y-widget.js' ||
            req.url?.startsWith('/a11y-widget.js?')
          if (isWidgetJsRequest) {
            // #region agent log
            const logData = {
              location: 'vite.config.ts:configureServer',
              message: 'Vite dev server widget request',
              data: {
                url: req.url,
                path: req.path
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'B'
            };
            fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
            // #endregion
            
            const npmCoreJs = join(__dirname, '..', 'packages', 'a11y-widget', 'vendor', 'a11y-widget.core.js')
            const widgetJsVersionedRoot = join(__dirname, '..', 'a11y-widget-v1.6.8.js')
            const widgetJsRoot = join(__dirname, '..', 'a11y-widget.js')
            const widgetJs = existsSync(npmCoreJs)
              ? npmCoreJs
              : (existsSync(widgetJsVersionedRoot) ? widgetJsVersionedRoot : widgetJsRoot)
            
            // #region agent log
            const logData2 = {
              location: 'vite.config.ts:configureServer',
              message: 'Vite file path resolution',
              data: {
                npmCoreJsExists: existsSync(npmCoreJs),
                widgetJsVersionedRootExists: existsSync(widgetJsVersionedRoot),
                widgetJsRootExists: existsSync(widgetJsRoot),
                selectedPath: widgetJs,
                widgetJsVersionedRootPath: widgetJsVersionedRoot,
                npmCoreJsPath: npmCoreJs,
                widgetJsRootPath: widgetJsRoot
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'B'
            };
            fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
            // #endregion
            
            if (existsSync(widgetJs)) {
              // #region agent log
              const fileContent = readFileSync(widgetJs, 'utf8');
              const hasRemovedSections = fileContent.includes('Widget Appearance and Icon Customization sections removed');
              const logData3 = {
                location: 'vite.config.ts:configureServer',
                message: 'Vite file content verification',
                data: {
                  filePath: widgetJs,
                  fileSize: fileContent.length,
                  hasRemovedSectionsMarker: hasRemovedSections
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'E'
              };
              fetch('http://127.0.0.1:7244/ingest/3544e706-ca53-43b1-b2c7-985ccfcff332',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
              // #endregion
              
              res.setHeader('Content-Type', 'application/javascript')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(widgetJs))
              return
            }
          }
          if (req.url === '/a11y-widget.css' || req.url?.startsWith('/a11y-widget.css?')) {
            // Npm package assets are kept current by `sync-widget`; root CSS is the fallback.
            const widgetCss = join(__dirname, '..', 'a11y-widget.css')
            const npmCss = join(__dirname, '..', 'packages', 'a11y-widget', 'assets', 'a11y-widget.css')
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
        // Copy widget files to dist root for serving
        const distPath = join(__dirname, 'dist')
        
        // Prefer npm package vendor: `sync-widget` copies the current release runtime there.
        const npmCoreJs = join(__dirname, '..', 'packages', 'a11y-widget', 'vendor', 'a11y-widget.core.js')
        const npmCss = join(__dirname, '..', 'packages', 'a11y-widget', 'assets', 'a11y-widget.css')
        const widgetJsVersioned = join(__dirname, '..', 'a11y-widget-v1.6.8.js')
        const widgetJs = join(__dirname, '..', 'a11y-widget.js')
        const widgetCss = join(__dirname, '..', 'a11y-widget.css')
        const downloadsDir = join(__dirname, 'public', 'downloads')
        const distDownloadsDir = join(distPath, 'downloads')
        
        // Copy updated versioned widget JS for current web app runtime
        if (existsSync(npmCoreJs)) {
          copyFileSync(npmCoreJs, join(distPath, 'a11y-widget-v1.6.8.js'))
          console.log('[Vite] Copied widget v1.6.8 from npm package')
        } else if (existsSync(widgetJsVersioned)) {
          copyFileSync(widgetJsVersioned, join(distPath, 'a11y-widget-v1.6.8.js'))
          console.log('[Vite] Copied widget v1.6.8 fallback from root')
        }

        // Copy legacy `a11y-widget.js` for any direct links from the npm-synced runtime.
        if (existsSync(npmCoreJs)) {
          copyFileSync(npmCoreJs, join(distPath, 'a11y-widget.js'))
          console.log('[Vite] Copied legacy widget JS from npm package')
        } else if (existsSync(widgetJs)) {
          copyFileSync(widgetJs, join(distPath, 'a11y-widget.js'))
          console.log('[Vite] Copied legacy widget JS fallback from repo root')
        }
        
        // Copy CSS from npm package first; root CSS is the fallback source.
        if (existsSync(npmCss)) {
          copyFileSync(npmCss, join(distPath, 'a11y-widget.css'))
          console.log('[Vite] Copied widget CSS from npm package')
        } else if (existsSync(widgetCss)) {
          copyFileSync(widgetCss, join(distPath, 'a11y-widget.css'))
          console.log('[Vite] Copied widget CSS fallback from repo root')
        }
        
        // Copy downloads folder
        if (existsSync(downloadsDir)) {
          if (!existsSync(distDownloadsDir)) {
            mkdirSync(distDownloadsDir, { recursive: true })
          }
          const files = readdirSync(downloadsDir)
          files.forEach(file => {
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
    assetsDir: 'assets',
  },
  base: '/',
})
