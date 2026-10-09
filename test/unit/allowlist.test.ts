import { describe, expect, it } from 'vitest';
import { isAllowlisted, setAllowed, siteFromUrl, toMatchPatterns } from '../../src/allowlist';

describe('siteFromUrl', () => {
  it('returns the hostname without www', () => {
    expect(siteFromUrl('https://www.youtube.com/watch?v=abc')).toBe('youtube.com');
    expect(siteFromUrl('https://m.youtube.com/')).toBe('m.youtube.com');
    expect(siteFromUrl('http://localhost:8787/js-play.html')).toBe('localhost');
  });

  it('returns null for pages the gate does not run on', () => {
    expect(siteFromUrl(undefined)).toBeNull();
    expect(siteFromUrl('')).toBeNull();
    expect(siteFromUrl('chrome://extensions')).toBeNull();
    expect(siteFromUrl('chrome-extension://abc/popup.html')).toBeNull();
    expect(siteFromUrl('file:///Users/me/video.html')).toBeNull();
    expect(siteFromUrl('not a url')).toBeNull();
  });
});

describe('toMatchPatterns', () => {
  it('uses a subdomain wildcard for normal domains', () => {
    expect(toMatchPatterns('youtube.com')).toEqual(['*://*.youtube.com/*']);
  });

  it('uses an exact host for IPs and single-label hosts', () => {
    expect(toMatchPatterns('127.0.0.1')).toEqual(['*://127.0.0.1/*']);
    expect(toMatchPatterns('localhost')).toEqual(['*://localhost/*']);
    expect(toMatchPatterns('[::1]')).toEqual(['*://[::1]/*']);
  });
});

describe('isAllowlisted', () => {
  it('matches the site and its subdomains', () => {
    expect(isAllowlisted('youtube.com', ['youtube.com'])).toBe(true);
    expect(isAllowlisted('m.youtube.com', ['youtube.com'])).toBe(true);
  });

  it('does not match lookalike domains or parents', () => {
    expect(isAllowlisted('notyoutube.com', ['youtube.com'])).toBe(false);
    expect(isAllowlisted('youtube.com', ['m.youtube.com'])).toBe(false);
    expect(isAllowlisted('a.localhost', ['localhost'])).toBe(false);
  });
});

describe('setAllowed', () => {
  it('adds a site once and keeps the list sorted', () => {
    expect(setAllowed(['vimeo.com'], 'twitch.tv', true)).toEqual(['twitch.tv', 'vimeo.com']);
    expect(setAllowed(['twitch.tv'], 'twitch.tv', true)).toEqual(['twitch.tv']);
  });

  it('removes the site and any parent entry that covers it', () => {
    expect(setAllowed(['twitch.tv', 'youtube.com'], 'youtube.com', false)).toEqual(['twitch.tv']);
    expect(setAllowed(['youtube.com'], 'm.youtube.com', false)).toEqual([]);
  });
});
