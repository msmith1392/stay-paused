# Privacy Policy

_Last updated: October 12, 2026_

Stay Paused does not collect, store, or share any personal data.

## What the extension does

Stay Paused runs a small script on web pages that stops audio and video from playing until you
click, tap, or press a key on the page. All of this happens inside your browser.

## Data

- **No data collection.** The extension does not collect browsing history, page content, or any
  information about you.
- **No network requests.** The extension never sends anything to a server, including the
  developer's. It contains no analytics, tracking, or advertising code.
- **No remote code.** Everything the extension runs is included in the package you install.

## Settings

Your settings (whether the extension is on, whether muted videos are blocked, and the list of sites
where you allow autoplay) are saved with Chrome's built-in `chrome.storage.sync`. If you are signed
in to Chrome with sync turned on, Chrome syncs these settings between your own devices. That syncing
is handled by Google under the
[Google Chrome Privacy Notice](https://www.google.com/chrome/privacy/). The developer cannot see
them.

## Permissions

| Permission                                          | Why it is needed                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Read and change data on all websites (`<all_urls>`) | Autoplay can happen on any site, so the script must run on every page before the page's own code. |
| `scripting`                                         | Turns the script on or off and leaves out the sites you allow.                                    |
| `storage`                                           | Saves your settings.                                                                              |

## Source code

Stay Paused is open source under the MIT license. You can read every line at
<https://github.com/msmith1392/stay-paused>.

## Contact

Questions or concerns: open an issue at <https://github.com/msmith1392/stay-paused/issues>.
