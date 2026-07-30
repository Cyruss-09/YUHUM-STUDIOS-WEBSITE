import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
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
  },
})