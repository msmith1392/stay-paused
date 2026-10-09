import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'test/e2e',
  timeout: 30_000,
  // Each test launches its own Chromium with the extension, so keep parallelism modest.
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  webServer: {
    command: 'node scripts/serve-fixtures.mjs',
    url: 'http://localhost:8787/',
    reuseExistingServer: !process.env.CI,
  },
});
