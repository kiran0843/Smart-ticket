import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tickets': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
      // Add more proxies if you have other backend endpoints
    }
  }
})
