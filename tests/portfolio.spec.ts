import { expect, test } from '@playwright/test';

const brandingFrame = '.branding-project:first-child .branding-figure__button';

test('gallery contains focus, restores the trigger and opens the requested frame', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator(brandingFrame).nth(1);
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', '/media/branding/soda-luv/gosti.webp');
  await expect(dialog.getByRole('button', { name: 'Закрыть полноэкранный просмотр' })).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/has-custom-cursor/);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('img')).toHaveAttribute('src', '/media/branding/soda-luv/h.webp');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('img')).toHaveAttribute('src', '/media/branding/soda-luv/prevyu.webp');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.locator('img')).toHaveAttribute('src', '/media/branding/soda-luv/h.webp');
  await dialog.getByRole('button', { name: 'Кадр 2', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Кадр 2', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.hero-credit-item').first().evaluate((element: HTMLAnchorElement) => element.focus());
  await expect(page.locator('.hero-credit-item').first()).not.toBeFocused();
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement === document.body || Boolean(document.activeElement?.closest('dialog')))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.mouse.move(2, 2);
  await expect(page.locator('.custom-cursor')).toHaveClass(/custom-cursor--default/);
  await page.locator('.cover-card').first().click();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', '/media/covers/img-0290.webp');
  await expect(page.getByRole('dialog').locator('.lightbox-topbar__title')).toHaveCount(0);
  await expect(page.getByRole('dialog').locator('.lightbox-topbar__category')).toHaveText('Музыкальные обложки');
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 812, height: 375 },
  { width: 1440, height: 900 },
]) {
  test(`content and gallery fit ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    for (const selector of ['.hero-section', '#titles', '#covers', '#posters', '#branding', '#contacts']) {
      const section = page.locator(selector);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
      const overflow = await section.evaluate((element) => Array.from(element.querySelectorAll('a, button, h1, h2, img')).filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.width > 1 && (rect.left < -1 || rect.right > window.innerWidth + 1);
      }).map((element) => element.className));
      expect(overflow).toEqual([]);
    }
    for (const trigger of [page.locator(brandingFrame).first(), page.locator('.poster-item__button').first()]) {
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('img')).toBeVisible();
      const layout = await dialog.evaluate((element) => {
        const controls = Array.from(element.querySelectorAll('button, img')).map((child) => child.getBoundingClientRect());
        return {
          outside: controls.some((rect) => rect.left < -1 || rect.right > window.innerWidth + 1 || rect.top < -1 || rect.bottom > window.innerHeight + 1),
          overflow: element.scrollHeight > element.clientHeight + 1,
          imageHeight: element.querySelector('img')!.getBoundingClientRect().height,
        };
      });
      expect(layout.outside).toBe(false);
      expect(layout.overflow).toBe(false);
      expect(layout.imageHeight).toBeGreaterThan(30);
      await page.keyboard.press('Escape');
    }
  });
}

test('reduced motion stops videos and eye movement, including preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#titles').scrollIntoViewIfNeeded();
  await expect(page.locator('.title-card--static')).toHaveCount(9);
  expect(await page.locator('video').evaluateAll((videos: HTMLVideoElement[]) => videos.every((video) => video.paused && !video.getAttribute('src')))).toBe(true);
  await page.mouse.move(20, 20);
  await expect(page.locator('.custom-cursor')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.title-card__video').first()).toHaveAttribute('src', '/media/titles/1/video.mp4');
  await expect.poll(() => page.locator('video').evaluateAll((videos: HTMLVideoElement[]) => videos.some((video) => !video.paused))).toBe(true);
  await page.locator('.title-card').first().click();
  expect(await page.locator('video').evaluateAll((videos: HTMLVideoElement[]) => videos.every((video) => video.paused))).toBe(true);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.cartoon-eyes').scrollIntoViewIfNeeded();
  await page.locator('.cartoon-eyes').click();
  await expect(page.locator('.cartoon-eyes')).not.toHaveClass(/cartoon-eyes--blink/);
  await expect(page.locator('.cartoon-eyes__pupil').first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('autoplay refusal shows a still instead of a broken video preview', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Denied', 'NotAllowedError'));
  });
  await page.goto('/');
  await page.locator('#titles').scrollIntoViewIfNeeded();
  await expect(page.locator('.title-card').first()).toHaveClass(/title-card--static/);
  await expect(page.locator('.title-card__still').first()).toHaveCSS('opacity', '1');
});

test('denied clipboard uses fallback and removes its temporary field', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); } },
    });
    document.execCommand = (command) => {
      (window as unknown as { copiedValue: string }).copiedValue = (document.activeElement as HTMLTextAreaElement).value;
      return command === 'copy';
    };
  });
  await page.goto('/');
  const copy = page.locator('.copy-email-btn');
  await copy.click();
  await expect(page.getByRole('status')).toContainText('скопирован в буфер обмена');
  expect(await page.evaluate(() => (window as unknown as { copiedValue: string }).copiedValue)).toBe('exckapeasfuck@gmail.com');
  await expect(page.locator('textarea')).toHaveCount(0);
  await expect(copy).toBeFocused();
});

test('clipboard failure is reported and its temporary field is removed', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    document.execCommand = () => { throw new Error('Copy unavailable'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Скопировать почту', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Не удалось скопировать');
  await expect(page.locator('textarea')).toHaveCount(0);
});

test('media files load and there are no runtime errors', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const sources = await page.locator('img').evaluateAll((images: HTMLImageElement[]) => images.map((image) => image.getAttribute('src')!));
  for (const source of new Set(sources)) {
    const response = await request.get(source);
    expect(response.ok(), source).toBe(true);
    expect(response.headers()['content-type'], source).toMatch(/^image\//);
  }
  expect(errors).toEqual([]);
});
