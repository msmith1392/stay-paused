// Pure helpers for the per-site allowlist. No chrome.* access, so they can be unit-tested.

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Returns the allowlist key for a page URL, or null for pages the gate never runs on
 * (chrome://, the Web Store, extension pages, file:// and so on).
 * A leading "www." is dropped so "www.youtube.com" and "youtube.com" share one entry.
 */
export function siteFromUrl(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  if (!host) {
    return null;
  }
  return host.startsWith('www.') ? host.slice(4) : host;
}

/** True when the site gets a wildcard pattern that also covers its subdomains. */
function coversSubdomains(site: string): boolean {
  return site.includes('.') && !IPV4.test(site) && !site.startsWith('[');
}

/**
 * Chrome match patterns that cover a site. "example.com" becomes "*://*.example.com/*", which
 * matches example.com and every subdomain. IP addresses and single-label hosts like "localhost"
 * get an exact pattern because a wildcard is not valid for them.
 */
export function toMatchPatterns(site: string): string[] {
  return coversSubdomains(site) ? [`*://*.${site}/*`] : [`*://${site}/*`];
}

function covers(entry: string, site: string): boolean {
  return entry === site || (coversSubdomains(entry) && site.endsWith(`.${entry}`));
}

/** Whether a site is covered by the allowlist, including as a subdomain of an entry. */
export function isAllowlisted(site: string, allowlist: readonly string[]): boolean {
  return allowlist.some((entry) => covers(entry, site));
}

/**
 * Returns the allowlist with the site added or removed, deduplicated and sorted.
 * Removing also drops any parent entry that covers the site, so turning the toggle off on
 * m.youtube.com actually stops allowing it.
 */
export function setAllowed(allowlist: readonly string[], site: string, allowed: boolean): string[] {
  const next = allowed ? [...allowlist, site] : allowlist.filter((entry) => !covers(entry, site));
  return [...new Set(next)].sort();
}
