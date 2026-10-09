// Playwright fixtures: a Chromium instance with the built extension loaded from dist/.

import { test as base, chromium, expect } from '@playwright/test';
import type { BrowserContext, Frame, Page, Worker } from '@playwright/test';
import { resolve } from 'node:path';
import { toMatchPatterns } from '../../src/allowlist';
import { DEFAULT_SETTINGS } from '../../src/settings';
import type { Settings } from '../../src/settings';

export const FIXTURES = 'http://localhost:8787';

const extensionPath = resolve('dist');

type Fixtures = {
  context: BrowserContext;
  serviceWorker: Worker;
  extensionId: string;
  page: Page;
  setSettings: (patch: Partial<Settings>) => Promise<void>;
};

type GateState = { js: string[]; excludeMatches: string[] } | null;

async function readGateState(sw: Worker): Promise<GateState> {
  return sw.evaluate(async () => {
    const [script] = await chrome.scripting.getRegisteredContentScripts({ ids: ['gate'] });
    return script ? { js: script.js ?? [], excludeMatches: script.excludeMatches ?? [] } : null;
  });
}

function expectedGateState(settings: Settings): GateState {
  if (!settings.enabled) {
    return null;
  }
  return {
    js: [settings.blockMuted ? 'gate-strict.js' : 'gate.js'],
    excludeMatches: settings.allowlist.flatMap(toMatchPatterns),
  };
}

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      // The full Chromium build (not the headless shell) is needed to load extensions.
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        // Turn off Chrome's own autoplay policy so the extension is the only thing blocking.
        '--autoplay-policy=no-user-gesture-required',
        '--mute-audio',
      ],
    });
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    // onInstalled registers the gate asynchronously. Wait for it before any page loads.
    await expect.poll(() => readGateState(sw)).toEqual(expectedGateState(DEFAULT_SETTINGS));
    await use(sw);
  },

  extensionId: async ({ serviceWorker }, use) => {
    await use(new URL(serviceWorker.url()).host);
  },

  page: async ({ context, serviceWorker }, use) => {
    void serviceWorker;
    const page = await context.newPage();
    await use(page);
  },

  setSettings: async ({ serviceWorker }, use) => {
    await use(async (patch) => {
      const next = { ...DEFAULT_SETTINGS, ...patch };
      await serviceWorker.evaluate((s) => chrome.storage.sync.set(s), next);
      await expect.poll(() => readGateState(serviceWorker)).toEqual(expectedGateState(next));
    });
  },
});

export { expect };

/**
 * Evaluates an expression in the page WITHOUT giving it user activation.
 * Playwright's evaluate() runs with userGesture: true, so merely reading state through it would
 * unlock the gate and make "still blocked" checks pass or fail for the wrong reason.
 */
async function readPage<T>(page: Page, expression: string): Promise<T> {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { result } = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
    return result.value as T;
  } finally {
    await cdp.detach();
  }
}

/**
 * Whether the first media element matching the selector is paused. For a Page this does not grant
 * user activation. For a Frame it does (Playwright has no gesture-free path), so only use it on
 * frames as a final check.
 */
export async function isPaused(target: Page | Frame, selector = 'video, audio'): Promise<boolean> {
  if ('mainFrame' in target) {
    return readPage(target, `document.querySelector(${JSON.stringify(selector)}).paused`);
  }
  return target
    .locator(selector)
    .first()
    .evaluate((el) => (el as HTMLMediaElement).paused);
}

/** Waits for a media element to exist, without granting user activation (unlike locator.waitFor). */
export async function waitForMedia(
  page: Page,
  selector = 'video, audio',
  timeout = 20_000
): Promise<void> {
  await expect
    .poll(() => readPage<boolean>(page, `!!document.querySelector(${JSON.stringify(selector)})`), {
      timeout,
    })
    .toBe(true);
}

/** Whether the page has user activation. Read without granting it. */
export async function hasBeenActive(page: Page): Promise<boolean> {
  return readPage(page, 'navigator.userActivation.hasBeenActive');
}

/** The play() outcomes recorded by test/fixtures/status.js. Does not grant user activation. */
export async function playLog(page: Page): Promise<string[]> {
  return readPage(page, 'window.__log');
}

/** Gives the page user activation the way a person would, by clicking its heading. */
export async function interact(page: Page): Promise<void> {
  await page.locator('h1').click();
}

/** Lets autoplay and timers run, so a "still paused" check is meaningful. */
export async function settle(page: Page, ms = 1500): Promise<void> {
  await page.waitForTimeout(ms);
}
