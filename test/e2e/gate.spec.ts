import {
  FIXTURES,
  expect,
  hasBeenActive,
  interact,
  isPaused,
  playLog,
  settle,
  test,
} from './fixtures';

test.describe('control: extension turned off', () => {
  // Proves the test browser autoplays on its own, so the blocking tests below are meaningful.
  test('autoplay attribute plays when disabled', async ({ page, setSettings }) => {
    await setSettings({ enabled: false });
    await page.goto(`${FIXTURES}/autoplay-attr.html`);
    await expect.poll(() => isPaused(page)).toBe(false);
  });
});

test.describe('blocking before interaction', () => {
  test('autoplay attribute stays paused, then plays after interaction', async ({ page }) => {
    await page.goto(`${FIXTURES}/autoplay-attr.html`);
    await settle(page);
    expect(await isPaused(page)).toBe(true);

    await interact(page);
    await page.locator('video').evaluate((el) => (el as HTMLMediaElement).play());
    await expect.poll(() => isPaused(page)).toBe(false);
  });

  test('play() on load is rejected with NotAllowedError', async ({ page }) => {
    await page.goto(`${FIXTURES}/js-play.html`);
    await expect.poll(() => playLog(page)).toContain('js-play on load: rejected NotAllowedError');
    expect(await isPaused(page)).toBe(true);

    await page.locator('#btn').click();
    await expect.poll(() => playLog(page)).toContain('js-play on click: resolved');
    expect(await isPaused(page)).toBe(false);
  });

  test('new Audio() outside the DOM is blocked', async ({ page }) => {
    await page.goto(`${FIXTURES}/audio-object.html`);
    await expect
      .poll(() => playLog(page))
      .toContain('audio-object on load: rejected NotAllowedError');

    await page.locator('#btn').click();
    await expect.poll(() => playLog(page)).toContain('audio-object on click: resolved');
  });

  test('muted autoplay plays by default', async ({ page }) => {
    await page.goto(`${FIXTURES}/muted-autoplay.html`);
    await expect.poll(() => isPaused(page)).toBe(false);
  });

  test('muted autoplay is blocked with "Also block muted videos"', async ({
    page,
    setSettings,
  }) => {
    await setSettings({ blockMuted: true });
    await page.goto(`${FIXTURES}/muted-autoplay.html`);
    await settle(page);
    expect(await isPaused(page)).toBe(true);
  });

  test('muted video unmuted by the page gets paused', async ({ page }) => {
    await page.goto(`${FIXTURES}/unmute.html`);
    await expect.poll(() => isPaused(page)).toBe(false);
    await settle(page, 2000);
    expect(await isPaused(page)).toBe(true);
  });

  test('same-origin and cross-origin iframes stay paused', async ({ page }) => {
    await page.goto(`${FIXTURES}/iframes.html`);
    await settle(page);
    const same = page.frameLocator('#same');
    const cross = page.frameLocator('#cross');
    expect(await same.locator('video').evaluate((el) => (el as HTMLMediaElement).paused)).toBe(
      true
    );
    expect(await cross.locator('video').evaluate((el) => (el as HTMLMediaElement).paused)).toBe(
      true
    );
  });

  test('play() borrowed from an about:blank iframe is blocked', async ({ page }) => {
    await page.goto(`${FIXTURES}/about-blank.html`);
    await expect
      .poll(() => playLog(page))
      .toContain('borrowed play on load: rejected NotAllowedError');
    expect(await isPaused(page)).toBe(true);
  });

  test('tab opened in the background stays paused when brought to front', async ({
    page,
    context,
  }) => {
    await page.goto(`${FIXTURES}/`);
    const [tab] = await Promise.all([
      context.waitForEvent('page'),
      page.getByText('Autoplay attribute').click({ modifiers: ['ControlOrMeta'] }),
    ]);
    await tab.waitForLoadState('load');
    await settle(page);
    await tab.bringToFront();
    await settle(tab);
    expect(await hasBeenActive(tab)).toBe(false);
    expect(await isPaused(tab)).toBe(true);
  });
});

test.describe('settings', () => {
  test('allowlisted site autoplays', async ({ page, setSettings }) => {
    await setSettings({ allowlist: ['localhost'] });
    await page.goto(`${FIXTURES}/autoplay-attr.html`);
    await expect.poll(() => isPaused(page)).toBe(false);
  });

  test('allowlist does not affect other sites', async ({ page, setSettings }) => {
    await setSettings({ allowlist: ['example.com'] });
    await page.goto(`${FIXTURES}/autoplay-attr.html`);
    await settle(page);
    expect(await isPaused(page)).toBe(true);
  });
});
