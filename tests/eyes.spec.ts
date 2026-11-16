import { expect, test } from '@playwright/test';
import { EyeGaze, LEFT_EYE, RIGHT_EYE, SpringValue } from '../src/eyes/EyeGaze';
import sharp from 'sharp';

for (const side of ['l', 'r']) {
  test(`${side} pupil layer has no gaps or cut edges in its movement area`, async () => {
    const { data, info } = await sharp(`public/media/demon/pupil-${side}.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let pupilStarted = false;
    let seenGap = false;
    let opaqueRows = 0;
    let gaps = 0;
    let translucentInterior = 0;
    for (let y = 0; y < info.height; y++) {
      let opaque = false;
      for (let x = 0; x < info.width; x++) {
        const alpha = data[(y * info.width + x) * 4 + 3];
        if (opaque && alpha !== 255 && y > info.height * 0.75) translucentInterior++;
        if (alpha === 255) opaque = true;
      }
      if (opaque) {
        if (seenGap) {
          gaps++;
          seenGap = false;
        }
        pupilStarted = true;
        opaqueRows++;
      } else if (pupilStarted) {
        seenGap = true;
      }
    }
    expect(opaqueRows).toBeGreaterThan(80);
    expect(gaps).toBe(0);
    expect(translucentInterior).toBe(0);
  });
}

for (const [name, spec] of [['left', LEFT_EYE], ['right', RIGHT_EYE]] as const) {
  test(`${name} eye follows every direction continuously`, () => {
    const gaze = new EyeGaze(spec.anchorX, spec.anchorY, spec.range);
    const centerX = (spec.range.minX + spec.range.maxX) / 2;
    const centerY = (spec.range.minY + spec.range.maxY) / 2;
    expect(gaze.aim(0, 0, 0, 0, 100)).toEqual({ x: centerX, y: centerY });
    expect(gaze.aim(200, 0, 0, 0, 100)).toEqual({ x: spec.range.maxX, y: centerY });
    expect(gaze.aim(-200, 0, 0, 0, 100)).toEqual({ x: spec.range.minX, y: centerY });
    expect(gaze.aim(0, -200, 0, 0, 100)).toEqual({ x: centerX, y: spec.range.minY });
    expect(gaze.aim(0, 200, 0, 0, 100)).toEqual({ x: centerX, y: spec.range.maxY });
    const nearLeft = gaze.aim(-0.1, 0, 0, 0, 100);
    const nearRight = gaze.aim(0.1, 0, 0, 0, 100);
    expect(Math.abs(nearLeft.x - nearRight.x)).toBeLessThan(0.001);
  });

  test(`${name} pupil stays within its mask travel limits during sudden reversals`, () => {
    const gaze = new EyeGaze(spec.anchorX, spec.anchorY, spec.range);
    for (let frame = 0; frame < 300; frame++) {
      const extreme = Math.floor(frame / 30) % 2 === 0;
      gaze.follow({ x: extreme ? spec.range.minX : 0, y: extreme ? spec.range.minY : 0 }, 1 / 60);
      expect(gaze.horizontal.value).toBeGreaterThanOrEqual(spec.range.minX);
      expect(gaze.horizontal.value).toBeLessThanOrEqual(spec.range.maxX);
      expect(gaze.vertical.value).toBeGreaterThanOrEqual(spec.range.minY);
      expect(gaze.vertical.value).toBeLessThanOrEqual(spec.range.maxY);
    }
  });
}

test('eye movement has the same speed at 30, 60, 120 and 144 Hz', () => {
  const values = [30, 60, 120, 144].map((refreshRate) => {
    const spring = new SpringValue(-10, 0);
    for (let frame = 0; frame < refreshRate / 2; frame++) spring.follow(-8, 1 / refreshRate);
    return spring.value;
  });
  for (const value of values) expect(value).toBeCloseTo(values[0], 8);
});

test('blinking keeps the face still and lowers only the eyelids', async ({ page }) => {
  await page.goto('/');
  const eyes = page.locator('.cartoon-eyes');
  const frame = page.locator('.cartoon-eyes__layer--frame');
  const eyelid = page.locator('.cartoon-eyes__eyelid').first();
  await expect(page.locator('.hero-eyes-stage')).toHaveCSS('transform', 'none');
  await eyes.scrollIntoViewIfNeeded();
  const before = await frame.boundingBox();
  await eyes.click();
  await expect(eyes).toHaveClass(/cartoon-eyes--blink/);
  await expect(eyes).toHaveCSS('transform', 'none');
  await expect
    .poll(() => eyelid.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).f), { intervals: [10, 20] })
    .toBeGreaterThan(before!.height * 0.06);
  const after = await frame.boundingBox();
  expect(after!.width).toBe(before!.width);
  expect(after!.height).toBe(before!.height);
  await expect(eyes).not.toHaveClass(/cartoon-eyes--blink/);
  await expect(eyelid).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('demon blinks automatically while visible', async ({ page }) => {
  await page.goto('/');
  const eyes = page.locator('.cartoon-eyes');
  await eyes.scrollIntoViewIfNeeded();
  // Blink hold is ~150 ms; Playwright's default backoff (up to 1000 ms) can step right over it.
  await expect
    .poll(() => eyes.evaluate((el) => el.classList.contains('cartoon-eyes--blink')), {
      intervals: [30],
      timeout: 7000,
    })
    .toBe(true);
  await expect(eyes).not.toHaveClass(/cartoon-eyes--blink/, { timeout: 1000 });
});

test('desktop pupils respond on both sides and return to the original pose on blur', async ({ page }) => {
  await page.goto('/');
  const viewport = page.viewportSize()!;
  const rect = (await page.locator('.cartoon-eyes').boundingBox())!;
  const pupil = page.locator('.cartoon-eyes__pupil').first();
  const originX = rect.x + rect.width * LEFT_EYE.anchorX;
  const originY = rect.y + rect.height * LEFT_EYE.anchorY;
  await page.mouse.move(Math.max(8, originX - rect.width), originY);
  await expect.poll(() => pupil.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e)).toBeLessThan(-rect.width * 0.012);
  await page.mouse.move(Math.min(viewport.width - 8, originX + rect.width), originY);
  await expect.poll(() => pupil.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e)).toBeGreaterThan(rect.width * 0.012);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(pupil).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test.describe('touch eyes', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });

  test('touch tracking returns to idle and freezes outside the viewport', async ({ page }) => {
    await page.goto('/');
    const pupils = page.locator('.cartoon-eyes__pupil');
    await page.evaluate(() => {
      window.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', clientX: 0, clientY: 0 }));
      window.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', clientX: 0, clientY: 0 }));
    });
    await page.waitForTimeout(800);
    const tracking = await pupils.first().getAttribute('style');
    await page.waitForTimeout(1800);
    expect(await pupils.first().getAttribute('style')).not.toEqual(tracking);
    await page.locator('#contacts').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const offscreen = await pupils.evaluateAll((elements) => elements.map((element) => element.getAttribute('style')));
    await page.waitForTimeout(200);
    expect(await pupils.evaluateAll((elements) => elements.map((element) => element.getAttribute('style')))).toEqual(offscreen);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.cartoon-eyes').scrollIntoViewIfNeeded();
    await expect(pupils.first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  });
});
