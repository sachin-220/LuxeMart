import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          jspdf: ['jspdf'],
          html2canvas: ['html2canvas'],
          'framer-motion': ['framer-motion'],
          confetti: ['react-confetti', 'canvas-confetti']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
