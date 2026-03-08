import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const baseURL = process.env.VITE_LOCAL_URL ?? 'https://uat-erp.hawee.hicas.vn';
const slowMo = Number(process.env.PW_SLOW_MO ?? 300);
const workers = Number(process.env.PW_WORKERS ?? (isCI ? 1 : 1));
// Số lần retry khi test failed - hữu ích khi test bị flaky do mạng, loading, animation…
const retries = Number(process.env.PW_RETRIES ?? (isCI ? 2 : 1));
// luôn hiện trình duyệt khi chạy test
const headless = process.env.PW_HEADLESS
  ? process.env.PW_HEADLESS === 'true'
  : isCI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCI,
  retries,
  workers,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL,
    headless,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 120_000,
    navigationTimeout: 60_000,
    launchOptions: {
      slowMo,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
