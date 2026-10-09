import { expect, test } from './fixtures';

test('popup turns the extension off and shows the OFF badge', async ({
  page,
  extensionId,
  serviceWorker,
}) => {
  await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);

  // The popup is open in a tab here, so the "current site" is the popup page itself.
  await expect(page.locator('#site-unavailable')).toBeVisible();
  await expect(page.locator('#enabled')).toBeChecked();

  await page.locator('#enabled').uncheck();
  await expect(page.locator('#summary')).toHaveText('Off. Sites can autoplay as usual.');

  await expect
    .poll(() => serviceWorker.evaluate(() => chrome.storage.sync.get('enabled')))
    .toEqual({ enabled: false });
  await expect.poll(() => serviceWorker.evaluate(() => chrome.action.getBadgeText({}))).toBe('OFF');
  await expect
    .poll(() =>
      serviceWorker.evaluate(() => chrome.scripting.getRegisteredContentScripts({ ids: ['gate'] }))
    )
    .toEqual([]);
});

test('popup lists allowed sites and removes them', async ({ page, extensionId, serviceWorker }) => {
  await serviceWorker.evaluate(() =>
    chrome.storage.sync.set({ allowlist: ['twitch.tv', 'youtube.com'] })
  );
  await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);

  const items = page.locator('#allowlist li span');
  await expect(items).toHaveText(['twitch.tv', 'youtube.com']);

  await page.getByRole('button', { name: 'Remove twitch.tv' }).click();
  await expect(items).toHaveText(['youtube.com']);
  await expect
    .poll(() => serviceWorker.evaluate(() => chrome.storage.sync.get('allowlist')))
    .toEqual({ allowlist: ['youtube.com'] });
});
