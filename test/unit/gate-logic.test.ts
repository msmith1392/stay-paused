import { describe, expect, it } from 'vitest';
import { mayPlay } from '../../src/gate-logic';

describe('mayPlay', () => {
  it('allows any media after user activation', () => {
    expect(mayPlay({ hasBeenActive: true, muted: false, blockMuted: false })).toBe(true);
    expect(mayPlay({ hasBeenActive: true, muted: false, blockMuted: true })).toBe(true);
    expect(mayPlay({ hasBeenActive: true, muted: true, blockMuted: true })).toBe(true);
  });

  it('blocks audible media before user activation', () => {
    expect(mayPlay({ hasBeenActive: false, muted: false, blockMuted: false })).toBe(false);
    expect(mayPlay({ hasBeenActive: false, muted: false, blockMuted: true })).toBe(false);
  });

  it('allows muted media before user activation by default', () => {
    expect(mayPlay({ hasBeenActive: false, muted: true, blockMuted: false })).toBe(true);
  });

  it('blocks muted media before user activation in strict mode', () => {
    expect(mayPlay({ hasBeenActive: false, muted: true, blockMuted: true })).toBe(false);
  });
});
