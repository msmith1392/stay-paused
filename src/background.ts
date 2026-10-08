// Service worker. Owns the gate's registration so settings can apply before page scripts run.
// Milestone 3 adds settings-driven registration (enabled toggle, allowlist, muted mode).

const GATE_ID = 'gate';

async function registerGate(): Promise<void> {
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [GATE_ID] });
  if (existing.length > 0) {
    await chrome.scripting.unregisterContentScripts({ ids: [GATE_ID] });
  }

  await chrome.scripting.registerContentScripts([
    {
      id: GATE_ID,
      js: ['gate.js'],
      matches: ['<all_urls>'],
      runAt: 'document_start',
      world: 'MAIN',
      allFrames: true,
      matchOriginAsFallback: true,
      persistAcrossSessions: true,
    },
  ]);
}

chrome.runtime.onInstalled.addListener(() => {
  void registerGate();
});

chrome.runtime.onStartup.addListener(() => {
  void registerGate();
});
