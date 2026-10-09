// Shared helper for fixture pages. Shows whether each media element is playing and records
// play() results so a human or Playwright can read them.
//   window.__media: extra media elements not in the DOM (for example new Audio())
//   window.__log:   play() outcomes, e.g. "js-play: rejected NotAllowedError"
window.__media = window.__media ?? [];
window.__log = window.__log ?? [];

window.logResult = (label, promise) => {
  promise.then(
    () => window.__log.push(`${label}: resolved`),
    (err) => window.__log.push(`${label}: rejected ${err.name}`)
  );
};

function render() {
  const out = document.getElementById('status');
  if (!out) return;
  const all = [...document.querySelectorAll('video, audio'), ...window.__media];
  const rows = all.map((el, i) => {
    const name = el.dataset?.name ?? el.id ?? `media ${i}`;
    const state = el.paused ? 'PAUSED' : 'PLAYING';
    return `${name}: ${state}${el.muted ? ' (muted)' : ''}`;
  });
  out.textContent = [...rows, '', ...window.__log].join('\n');
}

setInterval(render, 250);
