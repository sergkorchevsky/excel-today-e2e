import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: 'tests',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    browserName: 'chromium',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    timezoneId: process.env.TZ || 'Europe/Warsaw',
    locale: process.env.LOCALE || 'en-US',
    video: process.env.PWVIDEO ? 'on' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  reporter: [['html', { open: 'never' }], ['list']]
});
