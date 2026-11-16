import { devices, expect, Page, test } from '@playwright/test';

const swipeUp = async (page: Page) => {
  const session = await page.context().newCDPSession(page);
  const viewport = page.viewportSize()!;
  const x = viewport.width / 2;
  const startY = viewport.height * 0.75;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY }] });
  for (let step = 1; step <= 6; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ x, y: startY - step * viewport.height * 0.07 }],
    });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
};

for (const name of ['iPhone 13', 'Pixel 7']) {
  const device = devices[name];
  test.describe(`${name} touch layout`, () => {
    test.use({
      viewport: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      userAgent: device.userAgent,
      isMobile: true,
      hasTouch: true,
    });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('scrolling does not start videos or open a fullscreen view', async ({ page }) => {
      await page.locator('.title-card').first().scrollIntoViewIfNeeded();
      await expect(page.locator('video[src]')).toHaveCount(0);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const initialScroll = await page.evaluate(() => window.scrollY);
      await swipeUp(page);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialScroll + 50);
      await expect(page.locator('video[src]')).toHaveCount(0);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
    });

    test('tapping a preview plays and pauses it inline, enlargement is separate', async ({ page }) => {
      const card = page.locator('.title-card').first();
      const preview = card.locator('.title-card__preview');
      const video = card.locator('video');
      await preview.tap();
      await expect(preview).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(await video.evaluate((element: HTMLVideoElement) => ({
        inline: element.playsInline,
        muted: element.muted && element.defaultMuted,
        controls: element.controls,
        fullscreen: document.fullscreenElement !== null,
      }))).toEqual({ inline: true, muted: true, controls: false, fullscreen: false });
      await expect(video).toHaveCSS('pointer-events', 'none');
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0.1);
      await preview.tap();
      await expect(preview).toHaveAttribute('aria-pressed', 'false');
      expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
      const pausedTime = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
      await preview.tap();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(pausedTime);
      await preview.tap();
      await card.getByRole('button', { name: 'Увеличить титр:' }).tap();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', '/media/titles/1/still.webp');
      await expect(page.getByRole('dialog').locator('video')).toHaveCount(0);
      await page.getByRole('button', { name: 'Закрыть полноэкранный просмотр' }).tap();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });

    test('an explicitly started video pauses when scrolled offscreen', async ({ page }) => {
      const card = page.locator('.title-card').first();
      const video = card.locator('video');
      await card.locator('.title-card__preview').tap();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
      await page.locator('#covers').scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.locator('.title-card').nth(1).locator('video')).not.toHaveAttribute('src');
    });

    test('closing the gallery restores the scroll position and touch navigation works', async ({ page }) => {
      const trigger = page.locator('.branding-project:first-child .branding-figure__button').nth(1);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.tap({ trial: true });
      const previousScroll = await page.evaluate(() => window.scrollY);
      await trigger.tap();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(page.locator('body')).toHaveCSS('position', 'fixed');
      await dialog.getByRole('button', { name: 'Следующее изображение проекта' }).tap();
      await expect(dialog.locator('img')).toHaveAttribute('src', '/media/branding/soda-luv/h.webp');
      await dialog.getByRole('button', { name: 'Кадр 1', exact: true }).tap();
      await expect(dialog.locator('img')).toHaveAttribute('src', '/media/branding/soda-luv/prevyu.webp');
      const controls = await dialog.locator('button').evaluateAll((elements) => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }));
      expect(controls.every((rect) => rect.width >= 44 && rect.height >= 44)).toBe(true);
      await dialog.getByRole('button', { name: 'Закрыть полноэкранный просмотр' }).tap();
      await expect(dialog).toHaveCount(0);
      await expect(page.locator('body')).not.toHaveCSS('position', 'fixed');
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(previousScroll, 0);
      const restoredScroll = await page.evaluate(() => window.scrollY);
      await swipeUp(page);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(restoredScroll + 50);
    });

    test('gallery fits landscape and small browser viewports without hidden controls', async ({ page }) => {
      await page.locator('.branding-figure__button').first().tap();
      for (const viewport of [{ width: 844, height: 390 }, { width: 375, height: 500 }, { width: 320, height: 568 }]) {
        await page.setViewportSize(viewport);
        const dialog = page.getByRole('dialog');
        await expect.poll(() => dialog.evaluate((element) => Math.abs(element.getBoundingClientRect().height - window.innerHeight))).toBeLessThan(1);
        const overflow = await dialog.locator('button, img').evaluateAll((elements) => elements.some((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -1 || rect.right > window.innerWidth + 1 || rect.top < -1 || rect.bottom > window.innerHeight + 1;
        }));
        expect(overflow).toBe(false);
      }
      await page.getByRole('button', { name: 'Закрыть полноэкранный просмотр' }).tap();
    });

    test('navigation and contact actions are large enough for touch', async ({ page }) => {
      const navigation = page.locator('.hero-credit-item');
      for (const link of await navigation.all()) {
        const rect = (await link.boundingBox())!;
        expect(rect.height).toBeGreaterThanOrEqual(44);
      }
      await page.locator('.hero-credit-item[href="#branding"]').tap();
      await expect.poll(() => page.locator('#branding').evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(50);
      await page.locator('#contacts').scrollIntoViewIfNeeded();
      for (const control of await page.locator('#contacts a, #contacts button').all()) {
        const rect = (await control.boundingBox())!;
        expect(rect.height).toBeGreaterThanOrEqual(44);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      }
    });
  });
}
