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
        // In development, serve widget files from root
        server.middlewares.use((req, res, next) => {
          // Serve new versioned widget file (v1.8.0)
          if (req.url === '/a11y-widget-v1.8.0.js' || req.url?.startsWith('/a11y-widget-v1.8.0.js?')) {
            const widgetJs = join(__dirname, '..', 'a11y-widget-v1.8.0.js')
            if (existsSync(widgetJs)) {
              res.setHeader('Content-Type', 'application/javascript')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(widgetJs))
              return
            }
          }
          // Fallback to v1.7.0 for backward compatibility
          if (req.url === '/a11y-widget-v1.7.0.js' || req.url?.startsWith('/a11y-widget-v1.7.0.js?')) {
            const widgetJs = join(__dirname, '..', 'a11y-widget-v1.7.0.js')
            if (existsSync(widgetJs)) {
              res.setHeader('Content-Type', 'application/javascript')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(widgetJs))
              return
            }
          }
          // Fallback to original widget file for backward compatibility
          if (req.url === '/a11y-widget.js' || req.url?.startsWith('/a11y-widget.js?')) {
            const widgetJs = join(__dirname, '..', 'a11y-widget.js')
            if (existsSync(widgetJs)) {
              res.setHeader('Content-Type', 'application/javascript')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(widgetJs))
              return
            }
          }
          if (req.url === '/a11y-widget.css' || req.url?.startsWith('/a11y-widget.css?')) {
            const widgetCss = join(__dirname, '..', 'a11y-widget.css')
            if (existsSync(widgetCss)) {
              res.setHeader('Content-Type', 'text/css')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(readFileSync(widgetCss))
              return
            }
          }
          next()
        })
      },
      closeBundle() {
        // Copy widget files to dist root for serving
        const distPath = join(__dirname, 'dist')
        const widgetJs = join(__dirname, '..', 'a11y-widget.js')
        const widgetJsV170 = join(__dirname, '..', 'a11y-widget-v1.7.0.js')
        const widgetJsV180 = join(__dirname, '..', 'a11y-widget-v1.8.0.js')
        const widgetCss = join(__dirname, '..', 'a11y-widget.css')
        const downloadsDir = join(__dirname, 'public', 'downloads')
        const distDownloadsDir = join(distPath, 'downloads')
        
        // Copy widget files (all versions for backward compatibility)
        if (existsSync(widgetJs)) {
          copyFileSync(widgetJs, join(distPath, 'a11y-widget.js'))
        }
        if (existsSync(widgetJsV170)) {
          copyFileSync(widgetJsV170, join(distPath, 'a11y-widget-v1.7.0.js'))
        }
        if (existsSync(widgetJsV180)) {
          copyFileSync(widgetJsV180, join(distPath, 'a11y-widget-v1.8.0.js'))
        }
        if (existsSync(widgetCss)) {
          copyFileSync(widgetCss, join(distPath, 'a11y-widget.css'))
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
