import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
  },
  projects: [
    { name: 'Chromium', use: devices['Desktop Chrome'] },
    { name: 'Firefox', use: devices['Desktop Firefox'] },
    { name: 'WebKit', use: devices['Desktop Safari'] },
    { name: 'Android', use: devices['Pixel 7'] },
    { name: 'iPad', use: devices['iPad (gen 7)'] },
  ],
})
