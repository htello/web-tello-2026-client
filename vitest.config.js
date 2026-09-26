import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.js'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**'],
      exclude: ['src/main.jsx', 'src/test/**', 'src/**/*.test.*', 'src/**/__mocks__/**'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
        'src/services/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/hooks/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/utils/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
      },
    },
  },
})
