import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm -w apps/web run dev',
      cwd: join(__dirname, '../..'),
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env: { NODE_ENV: 'development' },
    },
  ],
});
