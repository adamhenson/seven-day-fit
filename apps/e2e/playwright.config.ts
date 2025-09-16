import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const previewUrl = process.env.E2E_BASE_URL;
const bypassToken = process.env.E2E_BYPASS_TOKEN || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: previewUrl || 'http://localhost:3000',
    trace: 'on-first-retry',
    extraHTTPHeaders: bypassToken
      ? {
          'x-vercel-protection-bypass': bypassToken,
          'x-vercel-set-bypass-cookie': 'true',
        }
      : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: previewUrl
    ? undefined
    : [
        {
          command: 'npm -w apps/web run dev',
          cwd: join(fileURLToPath(new URL('.', import.meta.url)), '../..'),
          port: 3000,
          reuseExistingServer: !process.env.CI,
          env: { NODE_ENV: 'development' },
        },
      ],
});
