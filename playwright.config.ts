import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173/voice-lens/';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm preview --port 4173 --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      VITE_POLLINATIONS_APP_KEY: 'test-app-key',
      VITE_REDIRECT_URI: 'http://127.0.0.1:4173/voice-lens/',
    },
  },
});