// Captures documentation screenshots from the CloudThinker app.
//
// For each shot: open the route, run the steps that reach the right screen,
// replace personal data with neutral examples, outline the control the reader
// needs, crop, and save a WebP to images/v2/<id>.webp.
//
// Usage:
//   node scripts/capture/capture.mjs <profileDir> <shots.json> [id ...]
//   node scripts/capture/capture.mjs <profileDir> --inspect <route>   (prints headings, tabs, buttons)
//
// The profile directory comes from login.mjs and must stay outside the repo.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(process.env.PW_FROM ?? import.meta.url);
const { chromium } = require('@playwright/test');

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '../../images/v2');
const BASE = process.env.CT_BASE ?? 'https://dev.cloudthinker.io';
const [profile, arg, ...rest] = process.argv.slice(2);

// Neutral stand-ins for real people and workspaces. Extend this list when a
// new name shows up in a capture; never ship a screenshot with a real name.
const PEOPLE = {
  'Duc Bui': 'Jordan Lee',
  'Nhi Luong': 'Sam Patel',
  'Khai Trinh': 'Riley Chen',
  'Steve Tran': 'Morgan Diaz',
  'Dat Dam': 'Casey Wong',
  'CloudThinker Dev': 'Acme Production',
};
// Exact text nodes (initials badges and similar) to swap.
const EXACT = { ST: 'MD', DD: 'CW', DB: 'JL', NL: 'SP', KT: 'RC' };

const ctx = await chromium.launchPersistentContext(profile, {
  headless: true,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
});
const page = ctx.pages()[0] ?? (await ctx.newPage());

async function open(route) {
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  if (page.url().includes('/auth')) throw new Error('Not signed in: run login.mjs first');
}

// Replace personal and account data in the rendered page with neutral values.
async function redact(replace = {}) {
  replace = { ...PEOPLE, ...replace };
  await page.evaluate(({ replace, exact }) => {
    const rules = [
      [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, 'you@example.com'],
      [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '00000000-0000-0000-0000-000000000000'],
      [/arn:aws[a-z-]*:[^\s"']+/g, 'arn:aws:iam::123456789012:role/CloudThinkerReadOnly'],
      [/\b\d{12}\b/g, '123456789012'],
      ...Object.entries(replace).map(([from, to]) => [new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to]),
    ];
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const trimmed = node.nodeValue.trim();
        if (exact[trimmed]) {
          node.nodeValue = node.nodeValue.replace(trimmed, exact[trimmed]);
          return;
        }
        let t = node.nodeValue;
        for (const [re, to] of rules) t = t.replace(re, to);
        if (t !== node.nodeValue) node.nodeValue = t;
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (['INPUT', 'TEXTAREA'].includes(node.tagName) && node.value) {
        let v = node.value;
        for (const [re, to] of rules) v = v.replace(re, to);
        node.value = v;
      }
      for (const c of node.childNodes) walk(c);
    };
    walk(document.body);
    // Avatars and profile photos: blur them.
    for (const img of document.querySelectorAll('img')) {
      const hint = `${img.alt} ${img.className} ${img.src}`.toLowerCase();
      if (/avatar|profile|gravatar|googleusercontent|user/.test(hint)) img.style.filter = 'blur(6px)';
    }
  }, { replace, exact: EXACT });
}

function locate(target) {
  if (target.selector) return page.locator(target.selector).first();
  if (target.role) return page.getByRole(target.role, { name: target.name, exact: Boolean(target.exact) }).first();
  return page.getByText(target.text, { exact: Boolean(target.exact) }).first();
}

async function step(s) {
  if (s.click) await locate(s.click).click({ timeout: 10000 });
  if (s.hover) await locate(s.hover).hover({ timeout: 10000 });
  if (s.fill) await locate(s.fill.target).fill(s.fill.value);
  if (s.press) await page.keyboard.press(s.press);
  if (s.scrollTo) await locate(s.scrollTo).scrollIntoViewIfNeeded();
  await page.waitForTimeout(s.wait ?? 800);
}

async function highlight(targets = []) {
  let n = 0;
  for (const t of targets) {
    n += 1;
    const el = locate(t);
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await el.evaluate((node, label) => {
      node.style.outline = '3px solid #0c93c0';
      node.style.outlineOffset = '3px';
      node.style.borderRadius = node.style.borderRadius || '6px';
      if (label) {
        const r = node.getBoundingClientRect();
        const b = document.createElement('div');
        b.textContent = label;
        Object.assign(b.style, {
          position: 'fixed', left: `${r.left - 14}px`, top: `${r.top - 14}px`, zIndex: 99999,
          background: '#0c93c0', color: '#fff', font: '600 12px/22px sans-serif',
          width: '22px', height: '22px', borderRadius: '11px', textAlign: 'center',
        });
        document.body.appendChild(b);
      }
    }, targets.length > 1 ? String(n) : '');
  }
}

async function clipFor(shot) {
  if (!shot.crop) return undefined;
  const pad = shot.crop.pad ?? 24;
  const box = await locate(shot.crop).boundingBox();
  if (!box) return undefined;
  // Trim the left edge (sidebar bleed) and fit the height to the content.
  const inset = shot.crop.insetLeft ?? 0;
  box.x += inset;
  box.width -= inset;
  if (shot.crop.fit !== false) {
    const bottom = await locate(shot.crop).evaluate((root) => {
      let max = 0;
      for (const el of root.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        const leaf = !el.children.length || ['BUTTON', 'INPUT', 'IMG', 'svg'].includes(el.tagName);
        if (leaf && r.height > 0 && r.width > 0 && r.top < innerHeight) max = Math.max(max, r.bottom);
      }
      return max;
    });
    if (bottom > box.y) box.height = Math.min(box.height, bottom - box.y);
  }
  const vw = 1440;
  const vh = 900;
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  return { x, y, width: Math.min(vw - x, box.width + pad * 2), height: Math.min(vh - y, box.height + pad * 2) };
}

if (arg === '--inspect') {
  await open(rest[0]);
  await redact();
  const info = await page.evaluate(() => {
    const txt = (sel) => [...document.querySelectorAll(sel)].map((e) => e.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 40);
    return {
      url: location.pathname,
      headings: txt('h1, h2, h3'),
      tabs: txt('[role=tab]'),
      buttons: txt('button, a[role=button]'),
      labels: txt('label'),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  if (rest[1]) await page.screenshot({ path: rest[1] });
  await ctx.close();
  process.exit(0);
}

const shots = JSON.parse(readFileSync(arg, 'utf8')).filter((s) => !rest.length || rest.includes(s.id));
mkdirSync(OUT, { recursive: true });
for (const shot of shots) {
  try {
    await open(shot.route);
    for (const s of shot.steps ?? []) await step(s);
    await redact(shot.replace);
    await highlight(shot.highlight);
    await page.waitForTimeout(400);
    const png = join(OUT, `${shot.id}.png`);
    await page.screenshot({ path: png, clip: await clipFor(shot) });
    execFileSync('cwebp', ['-quiet', '-q', '86', png, '-o', join(OUT, `${shot.id}.webp`)]);
    unlinkSync(png);
    console.log('OK', shot.id);
  } catch (e) {
    console.log('FAIL', shot.id, String(e.message).split('\n')[0]);
  }
}
await ctx.close();
