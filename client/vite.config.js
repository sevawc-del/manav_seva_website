import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['leaflet', 'd3-selection', 'd3-fetch', 'd3-geo', 'topojson-client'],
          'content-vendor': ['react-markdown', 'remark-gfm', 'dompurify']
        }
      }
    }
  }
})
