// Service worker. Owns the gate's registration so settings apply before page scripts run.
// The gate itself never reads settings: being on or off, the allowlist, and the muted-video mode
// are all expressed through what gets registered here.

import { toMatchPatterns } from './allowlist';
import { loadSettings } from './settings';
import type { Settings } from './settings';

const GATE_ID = 'gate';

function gateScript(
  settings: Settings,
  useAllowlist: boolean
): chrome.scripting.RegisteredContentScript {
  const excludeMatches = useAllowlist ? settings.allowlist.flatMap(toMatchPatterns) : [];
  return {
    id: GATE_ID,
    js: [settings.blockMuted ? 'gate-strict.js' : 'gate.js'],
    matches: ['<all_urls>'],
    ...(excludeMatches.length > 0 ? { excludeMatches } : {}),
    runAt: 'document_start',
    world: 'MAIN',
    allFrames: true,
    matchOriginAsFallback: true,
    persistAcrossSessions: true,
  };
}

async function updateBadge(enabled: boolean): Promise<void> {
  await chrome.action.setBadgeBackgroundColor({ color: '#71717a' });
  await chrome.action.setBadgeText({ text: enabled ? '' : 'OFF' });
}

async function syncGate(): Promise<void> {
  const settings = await loadSettings();

  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [GATE_ID] });
  if (existing.length > 0) {
    await chrome.scripting.unregisterContentScripts({ ids: [GATE_ID] });
  }

  if (settings.enabled) {
    try {
      await chrome.scripting.registerContentScripts([gateScript(settings, true)]);
    } catch (err) {
      // A bad allowlist pattern must not silently turn the extension off. Blocking everywhere is
      // the safe fallback.
      console.error('Stay Paused: registering with the allowlist failed, ignoring it.', err);
      await chrome.scripting.registerContentScripts([gateScript(settings, false)]);
    }
  }

  await updateBadge(settings.enabled);
}

// Storage events can arrive in quick bursts. Run syncs one at a time so unregister and register
// calls never interleave.
let queue: Promise<void> = Promise.resolve();

function scheduleSync(): void {
  queue = queue.then(syncGate).catch((err: unknown) => {
    console.error('Stay Paused: failed to sync the gate.', err);
  });
}

chrome.runtime.onInstalled.addListener(scheduleSync);
chrome.runtime.onStartup.addListener(scheduleSync);
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === 'sync') {
    scheduleSync();
  }
});
