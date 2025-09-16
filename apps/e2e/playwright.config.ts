import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const previewUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: previewUrl || 'http://localhost:3000',
    trace: 'on-first-retry',
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
