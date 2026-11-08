// Opens a real browser window so a person can sign in to the app once.
// The session lives in a profile directory OUTSIDE the repo (never commit it).
// Usage: node scripts/capture/login.mjs <profileDir> [baseUrl]
import { createRequire } from 'node:module';
const require = createRequire(process.env.PW_FROM ?? import.meta.url);
const { chromium } = require('@playwright/test');

const [profile, base = 'https://dev.cloudthinker.io'] = process.argv.slice(2);
const ctx = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: 1440, height: 900 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto(`${base}/auth/login`);
console.log('Waiting for sign-in (up to 15 minutes)...');
const deadline = Date.now() + 15 * 60 * 1000;
while (Date.now() < deadline) {
  const url = page.url();
  if (url.startsWith(base) && !url.includes('/auth')) {
    await page.waitForTimeout(4000);
    console.log('SIGNED_IN', page.url());
    break;
  }
  await page.waitForTimeout(2000);
}
await ctx.close();
