import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 500_000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react'],
          'vendor-react-dom': ['react-dom', 'react-dom/client'],
        },
      },
    },
  },
  server: { port: 4173 },
  preview: { port: 4173 },
  test: { include: ['tests/**/*.test.{ts,tsx}'] },
})
