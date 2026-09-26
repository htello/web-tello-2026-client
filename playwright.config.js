import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

// `.env` (gitignored) aporta las credenciales E2E del panel admin
// (E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD). Node >= 20.12 expone loadEnvFile.
if (existsSync('.env')) process.loadEnvFile('.env')

// Timeouts generosos: el journey del panel usa el server real y, si apunta a
// producción (Render free), la primera petición puede tardar ~50 s (cold start).
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
  },
  reporter: [['html', { open: 'never' }]],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
