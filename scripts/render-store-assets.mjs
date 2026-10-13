// Renders the extension icons and Chrome Web Store images with Playwright's Chromium.
//   public/icons/icon-{16,32,48,128}.png  toolbar and store icons (transparent PNG)
//   public/icons/icon.svg                 source artwork, also used by the store pages
//   store/assets/*.jpg                    screenshots (1280x800) and promo tile (440x280)
// The store pages in store/src/ embed the real popup from dist/, so run `npm run build` first
// (`npm run store:assets` does both).
import { chromium } from '@playwright/test';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const BLUE = '#2563eb';

/**
 * Pause-symbol icon. Chrome's guidance: the 128px icon keeps its artwork inside 96px with 16px of
 * transparent padding. Smaller sizes use less padding, and every edge is snapped to whole pixels
 * so the bars stay crisp at 16px.
 */
function iconSvg(size) {
  const pad = { 16: 0, 32: 2, 48: 4, 128: 16 }[size];
  const box = size - pad * 2;
  const barW = Math.round(box * 0.15);
  const gap = Math.round(box * 0.13);
  const barH = Math.round(box * 0.5);
  const x0 = pad + Math.round((box - (barW * 2 + gap)) / 2);
  const y0 = pad + Math.round((box - barH) / 2);
  const r = Math.max(1, Math.round(box * 0.04));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${pad}" y="${pad}" width="${box}" height="${box}" rx="${Math.round(box * 0.22)}" fill="${BLUE}"/>
  <rect x="${x0}" y="${y0}" width="${barW}" height="${barH}" rx="${r}" fill="#ffffff"/>
  <rect x="${x0 + barW + gap}" y="${y0}" width="${barW}" height="${barH}" rx="${r}" fill="#ffffff"/>
</svg>
`;
}

// Stub of the chrome.* APIs the popup uses, so the real popup renders outside the extension.
function stubChrome() {
  const settings = { enabled: true, blockMuted: false, allowlist: ['music.example.com'] };
  globalThis.chrome = {
    tabs: {
      query: async () => [{ id: 1, url: 'https://videos.example.com/watch?v=42' }],
      reload: async () => {},
    },
    storage: { sync: { get: async () => ({ ...settings }), set: async () => {} } },
  };
}

const pages = [
  { src: 'screenshot-1.html', out: 'screenshot-1.jpg', width: 1280, height: 800 },
  { src: 'screenshot-2.html', out: 'screenshot-2.jpg', width: 1280, height: 800 },
  { src: 'screenshot-3.html', out: 'screenshot-3.jpg', width: 1280, height: 800 },
  { src: 'promo-small.html', out: 'promo-small.jpg', width: 440, height: 280 },
];

await access('dist/popup/popup.js').catch(() => {
  console.error('dist/ is missing. Run `npm run build` first, or use `npm run store:assets`.');
  process.exit(1);
});

await mkdir('public/icons', { recursive: true });
await mkdir('store/assets', { recursive: true });
await writeFile('public/icons/icon.svg', iconSvg(128));

const browser = await chromium.launch();
try {
  const icons = await browser.newPage();
  for (const size of [16, 32, 48, 128]) {
    await icons.setViewportSize({ width: size, height: size });
    await icons.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block}</style>${iconSvg(size)}`
    );
    await icons.screenshot({ path: `public/icons/icon-${size}.png`, omitBackground: true });
    console.log(`Wrote public/icons/icon-${size}.png`);
  }

  // JPEG because the store wants screenshots and tiles without an alpha channel.
  const store = await browser.newPage();
  await store.addInitScript(stubChrome);
  for (const { src, out, width, height } of pages) {
    await store.setViewportSize({ width, height });
    await store.goto(pathToFileURL(resolve('store/src', src)).href);
    await store.waitForLoadState('networkidle');
    await store.screenshot({ path: `store/assets/${out}`, type: 'jpeg', quality: 92 });
    console.log(`Wrote store/assets/${out}`);
  }
} finally {
  await browser.close();
}
