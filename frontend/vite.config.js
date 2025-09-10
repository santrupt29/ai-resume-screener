// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/functions': {
        target: 'https://blcnjrbtdigdtdxpegdc.supabase.co',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})