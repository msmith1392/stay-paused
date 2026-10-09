// MAIN-world content script. Runs at document_start in every frame, before page scripts.
// It cannot use chrome.* APIs. Anything it needs from settings is decided at registration time.
// esbuild wraps this file in an IIFE, so nothing here leaks onto the page's window.

import { mayPlay } from './gate-logic';

const proto = HTMLMediaElement.prototype;
const nativePlay = proto.play;
const nativePause = proto.pause;

function isAllowed(el: HTMLMediaElement): boolean {
  return mayPlay({
    hasBeenActive: navigator.userActivation?.hasBeenActive ?? false,
    muted: el.muted,
    blockMuted: __BLOCK_MUTED__,
  });
}

// Same error name Chrome uses when its own autoplay policy blocks play(), so sites already
// handle it (YouTube shows a paused player instead of an error).
function blockedError(): DOMException {
  return new DOMException(
    "play() failed because the user didn't interact with the document first. (Stay Paused)",
    'NotAllowedError'
  );
}

// Method shorthand keeps the name "play" and makes the function non-constructible, like the native.
const wrapped = {
  play(this: HTMLMediaElement): Promise<void> {
    if (isAllowed(this)) {
      return nativePlay.call(this);
    }
    return Promise.reject(blockedError());
  },
};

Object.defineProperty(proto, 'play', {
  ...Object.getOwnPropertyDescriptor(proto, 'play'),
  value: wrapped.play,
});

// Backstop for playback that never calls play(): the autoplay attribute, load() on an autoplay
// element, and browser-initiated starts. Media events don't bubble, so listen in the capture phase.
function onPlay(event: Event): void {
  const el = event.target;
  if (el instanceof HTMLMediaElement && !isAllowed(el)) {
    nativePause.call(el);
  }
}

// Muted autoplay is allowed by default; unmuting it without user activation is not.
function onVolumeChange(event: Event): void {
  const el = event.target;
  if (el instanceof HTMLMediaElement && !el.paused && !isAllowed(el)) {
    nativePause.call(el);
  }
}

window.addEventListener('play', onPlay, true);
window.addEventListener('volumechange', onVolumeChange, true);
