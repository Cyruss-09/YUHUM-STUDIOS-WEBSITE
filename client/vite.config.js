import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/YUHUM-STUDIOS-WEBSITE/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Fixes the "failed to connect to websocket" HMR loop error
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // <-- change to whatever port your Express server actually runs on
        changeOrigin: true,
      },
    },
  },
})