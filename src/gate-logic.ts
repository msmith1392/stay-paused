// Pure decision logic for the gate. No DOM access, so it can be unit-tested directly.

export type PlayContext = {
  /** Sticky user activation for the frame: navigator.userActivation.hasBeenActive. */
  hasBeenActive: boolean;
  /** Whether the media element is muted. */
  muted: boolean;
  /** "Also block muted videos" setting, fixed at build time per gate variant. */
  blockMuted: boolean;
};

/** Returns true when a media element may start or keep playing. */
export function mayPlay({ hasBeenActive, muted, blockMuted }: PlayContext): boolean {
  if (hasBeenActive) {
    return true;
  }
  return muted && !blockMuted;
}
