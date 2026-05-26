// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000', // Cambia esto si tu backend usa otro puerto
    trace: 'on-first-retry',
  },
});
