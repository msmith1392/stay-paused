// Real-site check against YouTube (Milestone 2). Tagged @real-site: not run in CI because it
// depends on the network and on YouTube's markup. Run with `npm run test:real`.

import { expect, hasBeenActive, isPaused, settle, test, waitForMedia } from './fixtures';

// "Me at the zoo", the first YouTube video. Unlikely to disappear.
const WATCH_URL = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

test.describe('YouTube @real-site', () => {
  test.setTimeout(60_000);

  test('watch page opened in a background tab stays paused', async ({ page, context }) => {
    await page.setContent(`<a href="${WATCH_URL}" target="_blank">video</a>`);
    const [tab] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a').click({ modifiers: ['ControlOrMeta'] }),
    ]);
    await tab.waitForLoadState('domcontentloaded');
    await waitForMedia(tab, 'video');
    await settle(tab, 3000);

    await tab.bringToFront();
    await settle(tab, 3000);
    expect(await hasBeenActive(tab)).toBe(false);
    expect(await isPaused(tab, 'video')).toBe(true);
  });

  test('watch page plays after the user presses play', async ({ page }) => {
    await page.goto(WATCH_URL);
    await waitForMedia(page, 'video');
    await settle(page, 3000);
    expect(await hasBeenActive(page)).toBe(false);
    expect(await isPaused(page, 'video')).toBe(true);

    await page.locator('#movie_player').click();
    await expect.poll(() => isPaused(page, 'video'), { timeout: 10_000 }).toBe(false);
  });
});
