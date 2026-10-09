// Toolbar popup. Reads and writes settings; the background re-registers the gate on change.

import { isAllowlisted, setAllowed, siteFromUrl } from '../allowlist';
import { loadSettings, saveSettings } from '../settings';
import type { Settings } from '../settings';

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing #${id}`);
  }
  return el as T;
}

const enabledInput = byId<HTMLInputElement>('enabled');
const summary = byId<HTMLParagraphElement>('summary');
const siteSection = byId<HTMLElement>('site-section');
const siteName = byId<HTMLElement>('site-name');
const siteAllowedInput = byId<HTMLInputElement>('site-allowed');
const siteUnavailable = byId<HTMLParagraphElement>('site-unavailable');
const blockMutedInput = byId<HTMLInputElement>('block-muted');
const reloadNotice = byId<HTMLDivElement>('reload-notice');
const reloadButton = byId<HTMLButtonElement>('reload');
const allowlistSection = byId<HTMLElement>('allowlist-section');
const allowlistEl = byId<HTMLUListElement>('allowlist');

let settings: Settings;
let site: string | null = null;
let tabId: number | undefined;

function render(): void {
  enabledInput.checked = settings.enabled;
  document.body.classList.toggle('disabled', !settings.enabled);
  summary.textContent = settings.enabled
    ? 'Videos wait until you click or press a key on the page.'
    : 'Off. Sites can autoplay as usual.';

  siteSection.hidden = site === null;
  siteUnavailable.hidden = site !== null;
  if (site !== null) {
    siteName.textContent = site;
    siteAllowedInput.checked = isAllowlisted(site, settings.allowlist);
  }

  blockMutedInput.checked = settings.blockMuted;

  allowlistSection.hidden = settings.allowlist.length === 0;
  allowlistEl.replaceChildren(
    ...settings.allowlist.map((entry) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = entry;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'link';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${entry}`);
      remove.addEventListener('click', () => {
        void update({ allowlist: settings.allowlist.filter((e) => e !== entry) });
      });
      li.append(name, remove);
      return li;
    })
  );
}

async function update(patch: Partial<Settings>): Promise<void> {
  settings = { ...settings, ...patch };
  render();
  await saveSettings(patch);
  // Only offer a reload when there is a normal web page to reload.
  reloadNotice.hidden = site === null;
}

async function init(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id;
  site = siteFromUrl(tab?.url);
  settings = await loadSettings();
  render();

  enabledInput.addEventListener('change', () => {
    void update({ enabled: enabledInput.checked });
  });
  siteAllowedInput.addEventListener('change', () => {
    if (site !== null) {
      void update({ allowlist: setAllowed(settings.allowlist, site, siteAllowedInput.checked) });
    }
  });
  blockMutedInput.addEventListener('change', () => {
    void update({ blockMuted: blockMutedInput.checked });
  });
  reloadButton.addEventListener('click', () => {
    if (tabId !== undefined) {
      void chrome.tabs.reload(tabId);
      window.close();
    }
  });
}

void init();
