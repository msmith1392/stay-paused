# Stay Paused

A Chrome extension that stops video and audio from autoplaying until you interact with the page.

Open a few YouTube videos in background tabs, come back to them hours later, and they wait for you
instead of all starting at once. Brave, Firefox, Safari, and Edge have this built in. Chrome does
not.

**Status:** version 1.0, submitted to the Chrome Web Store and awaiting review.

## How it works

A small script runs on each page before the page's own code. It holds back `play()` and `autoplay`
until you click, tap, or press a key on that page. Switching to the tab does not count. Muted
autoplay (animated previews) is allowed by default.

No data collection, no network requests, no analytics, no remote code. See [PRIVACY.md](PRIVACY.md).

## Develop

Requires Node 20+ and Chrome 120+. For E2E tests, run `npx playwright install chromium` once.

```bash
npm install
npm run watch
```

Then in Chrome:

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked** and pick the `dist/` folder

After code changes, click the reload icon on the extension card and reload the test tab.

| Command                | What it does                                           |
| ---------------------- | ------------------------------------------------------ |
| `npm run build`        | Build into `dist/`                                     |
| `npm run watch`        | Rebuild on change                                      |
| `npm run check`        | Typecheck, lint, format check, and unit tests          |
| `npm test`             | Unit tests                                             |
| `npm run test:e2e`     | Build, then Playwright tests with the extension loaded |
| `npm run test:real`    | Same, against YouTube (needs network)                  |
| `npm run fixtures`     | Serve test pages at http://localhost:8787/             |
| `npm run zip`          | Build and package `release/stay-paused-*.zip`          |
| `npm run store:assets` | Render icons and store images                          |

## License

[MIT](LICENSE)
