# Chrome Web Store listing

Copy for the Chrome Web Store developer dashboard. Images are in `store/assets/` and are rendered by
`npm run store:assets` from the pages in `store/src/`.

## Store listing tab

**Name** (from the manifest): Stay Paused

**Summary** (from the manifest `description`, 132 characters max):

> Stop videos from autoplaying when you switch to a tab. Media waits until you click.

**Description:**

```text
Open a few videos in background tabs, switch to one an hour later, and it is waiting for you instead of blaring at you.

Brave, Firefox, Safari, and Edge all let you block autoplay. Chrome does not. Stay Paused adds it back.

HOW IT WORKS
Audio and video stay paused until you click, tap, or press a key on the page. Switching to a tab does not count. Once you interact with a page, everything works as normal: press play, and it plays.

FEATURES
- Works on every site, including YouTube and other video sites
- Background tabs stay paused when you switch to them
- One switch to turn it off
- Allow autoplay on the sites you choose
- Muted previews keep playing by default, with an option to block them too

PRIVATE BY DESIGN
- No data collected, no analytics, no tracking
- No network requests. The extension never talks to a server.
- Open source under the MIT license: https://github.com/msmith1392/stay-paused

WHY IT NEEDS ACCESS TO ALL SITES
Autoplay can happen on any website, so Stay Paused has to run on every page, before the page's own code, to hold media back. It does not read or collect page content.
```

**Category:** Productivity

**Language:** English

**Graphic assets:**

| Field              | File                            | Size     |
| ------------------ | ------------------------------- | -------- |
| Store icon         | `public/icons/icon-128.png`     | 128×128  |
| Screenshot 1       | `store/assets/screenshot-1.jpg` | 1280×800 |
| Screenshot 2       | `store/assets/screenshot-2.jpg` | 1280×800 |
| Screenshot 3       | `store/assets/screenshot-3.jpg` | 1280×800 |
| Small promo tile   | `store/assets/promo-small.jpg`  | 440×280  |
| Marquee promo tile | Not provided (optional)         | 1400×560 |

**Official URL:** none

**Homepage URL:** https://github.com/msmith1392/stay-paused

**Support URL:** https://github.com/msmith1392/stay-paused/issues

## Privacy practices tab

**Single purpose description:**

```text
Stay Paused prevents audio and video on web pages from playing automatically until the user interacts with the page.
```

**Permission justifications:**

`scripting`:

```text
Used to register and unregister the content script that pauses autoplaying media. Re-registering it lets the extension turn off completely or skip the sites the user has allowed, before any page code runs.
```

`storage`:

```text
Saves the user's settings: whether the extension is on, whether muted videos are also blocked, and the list of sites where autoplay is allowed.
```

Host permission (`<all_urls>`):

```text
Autoplay can happen on any website. The content script must run on every page at document start, before the page's own scripts, so it can hold back media until the user interacts. It does not read, collect, or transmit page content.
```

**Remote code:** No, I am not using remote code.

**Data usage:** Check none of the data types. Then certify all three statements:

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://github.com/msmith1392/stay-paused/blob/main/PRIVACY.md

## Distribution tab

**Visibility:** Public

**Regions:** All regions

**Pricing:** Free
