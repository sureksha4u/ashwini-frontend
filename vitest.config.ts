import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // Playwright specs live in /tests/*.spec.ts; vitest must NOT discover
    // them — they import @playwright/test which only works under Playwright.
    exclude: ['node_modules', 'dist', '.next', 'tests/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
