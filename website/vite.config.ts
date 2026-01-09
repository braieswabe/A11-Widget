import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-widget-files',
      closeBundle() {
        // Copy widget files to dist root for serving
        const distPath = join(__dirname, 'dist')
        const widgetJs = join(__dirname, '..', 'a11y-widget.js')
        const widgetCss = join(__dirname, '..', 'a11y-widget.css')
        
        if (existsSync(widgetJs)) {
          copyFileSync(widgetJs, join(distPath, 'a11y-widget.js'))
        }
        if (existsSync(widgetCss)) {
          copyFileSync(widgetCss, join(distPath, 'a11y-widget.css'))
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
