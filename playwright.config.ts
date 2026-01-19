import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  testDir: 'tests/visual',
  use: { baseURL: process.env.BASE_URL || 'http://localhost:3000' },
  projects: [
    { name: 'Mobile', use: { ...devices['iPhone 12'] } },
    { name: 'Desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
