import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
        '/posts': {
            target: 'http://localhost:3001',
            changeOrigin: true,
        },
    },
  }
})

// vite.config.
