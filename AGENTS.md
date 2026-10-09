# AGENTS.md: Stay Paused

Chrome extension (Manifest V3) that blocks media autoplay until the user interacts with the page.
Open source, MIT, intended for the Chrome Web Store.

Design and roadmap: `plans/implementation-plan.md` (local only, gitignored; may be missing in a fresh
clone). Read it before changing behavior when it exists.

## Hard rules

- **Single purpose.** Only autoplay blocking. No ad blocking, muting, or unrelated features.
- **Privacy.** No network requests, analytics, telemetry, or remote code. Ever.
- **No runtime dependencies.** Dev dependencies only. The shipped code must stay small and readable.
- **Permissions.** Only `scripting`, `storage`, and `<all_urls>`. Do not add permissions without
  updating the justification table in `plans/implementation-plan.md`.
- **TypeScript.** `strict: true`. Explicit return types on functions. `import type` for type-only
  imports.
- **Copy.** User-facing text (popup, README, store listing) uses plain language and no em dashes.
- **Scope.** Minimal diffs. Match existing patterns. Do not refactor unrelated code.

## Architecture

| File                | Role                                                               |
| ------------------- | ------------------------------------------------------------------ |
| `src/background.ts` | Service worker. Registers `gate.js` with `chrome.scripting`.       |
| `src/gate.ts`       | MAIN-world script at `document_start`, all frames. Wraps `play()`. |
| `src/gate-logic.ts` | Pure allow/block decision. Unit-tested.                            |
| `src/globals.d.ts`  | Build-time `__BLOCK_MUTED__` flag (`gate.js` vs `gate-strict.js`). |
| `src/settings.ts`   | Typed `chrome.storage.sync` wrapper and defaults.                  |
| `src/popup/`        | Toolbar popup, vanilla TS.                                         |
| `public/`           | `manifest.json` and icons, copied into `dist/` as is.              |
| `scripts/build.mjs` | esbuild bundler. Each entry is an IIFE.                            |
| `test/unit/`        | Vitest unit tests.                                                 |
| `test/fixtures/`    | Local test pages, served by `npm run fixtures`.                    |

### Constraints that are easy to get wrong

- `gate.ts` runs in the page's MAIN world. It **cannot** use `chrome.*` APIs, and page scripts can
  see anything it puts on `window`. Keep everything inside the IIFE.
- The gate must not read settings at runtime. Settings take effect through how the background
  registers the script (`excludeMatches` for the allowlist, unregister when disabled).
- When blocking `play()`, reject with `DOMException` named `NotAllowedError`. Sites already handle
  that error because Chrome uses it natively.
- Settings changes apply to new page loads only.

## Commands

```bash
npm run build      # dist/
npm run watch      # rebuild on change
npm run check      # typecheck + lint + prettier + unit tests
npm test           # unit tests only
npm run fixtures   # serve test pages at http://localhost:8787/
npm run zip        # release/stay-paused-<version>.zip
```

Load `dist/` unpacked at `chrome://extensions` to test. Keep `version` in `package.json` and
`public/manifest.json` in sync (`npm run zip` fails if they differ).

## Git

- Do not run `git commit` unless explicitly asked.
- Do not run `git push` unless explicitly asked.
- Never commit anything under `plans/`. It is private and gitignored.
- Commit messages use Conventional Commits types: `feat`, `fix`, `chore`, `docs`, `refactor`,
  `test`, `build`, `ci`.
- When asked for a commit message, use an imperative subject of 50 characters or fewer, including
  the type prefix (for example `feat: block play() before user activation`). Then a blank line,
  then a body explaining what and why. Put each sentence on its own line with a blank line between
  sentences, and wrap long sentences at 72 characters.
- Releases get annotated semver tags on `main` that match the manifest version, for example
  `git tag -a v1.0.0 -m "v1.0.0"`.

## Milestone status

- [x] 0. Scaffold
- [x] 1. Gate works on local fixtures (unit-tested; browser-verified in 4)
- [ ] 2. Real-site check (YouTube background tabs)
- [ ] 3. Settings, popup, allowlist, badge
- [ ] 4. Playwright E2E + CI
- [ ] 5. Store assets and listing
- [ ] 6. Submit
- [ ] 7. v1.1
