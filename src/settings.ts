export type Settings = {
  /** Global on/off switch. */
  enabled: boolean;
  /** Also block muted media (animated previews, hero videos). */
  blockMuted: boolean;
  /** Hostnames where autoplay is allowed, e.g. "example.com". Covers subdomains. */
  allowlist: string[];
};

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  blockMuted: false,
  allowlist: [],
};

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return {
    enabled: typeof stored.enabled === 'boolean' ? stored.enabled : DEFAULT_SETTINGS.enabled,
    blockMuted:
      typeof stored.blockMuted === 'boolean' ? stored.blockMuted : DEFAULT_SETTINGS.blockMuted,
    allowlist: Array.isArray(stored.allowlist)
      ? stored.allowlist.filter((s): s is string => typeof s === 'string')
      : DEFAULT_SETTINGS.allowlist,
  };
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(patch);
}
