import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('browse, filter, deep link, direct image display and return to filtered results', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(72);
  await page.getByRole('link', { name: '浏览全部版式' }).click();
  if (await page.getByRole('combobox', { name: '分类' }).isVisible()) await page.getByRole('combobox', { name: '分类' }).selectOption('D');
  else await page.getByRole('button', { name: /^D 路径与流动/ }).click();
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(10);
  await page.getByRole('searchbox', { name: '搜索版式' }).fill('圆环');
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(1);
  await page.locator('.gallery-grid .layout-card').click();
  await expect(page).toHaveURL(/\/layouts\/D04$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('圆环');
  await page.reload();
  await expect(page.getByRole('heading', { name: '适合什么' })).toBeVisible();
  await expect(page.locator('.detail-image img')).toBeVisible();
  await expect(page.getByRole('button', { name: /^放大查看/ })).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link', { name: '← 返回图库' }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('圆环');
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(1);
  await page.getByRole('button', { name: '清除筛选 ×' }).click();
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(72);
  await page.getByRole('searchbox').fill('不存在的版式 xyz');
  await expect(page.getByRole('heading', { name: '暂时没有找到对应版式。' })).toBeVisible();
  await page.getByRole('button', { name: '查看全部版式' }).click();
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(72);
  await page.getByRole('searchbox').fill('single column reading');
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('direct routes, related layouts, category and missing pages', async ({ page }) => {
  await page.goto('/layouts/G01');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page).toHaveTitle(/G01/);
  await expect(page.locator('.related-grid .layout-card')).toHaveCount(2);
  await page.locator('.related-grid .layout-card').first().click();
  await expect(page).not.toHaveURL(/\/G01$/);
  await page.getByRole('link', { name: '浏览这一类' }).click();
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(8);
  await page.goto('/about');
  await expect(page.locator('.category-directory > a')).toHaveCount(8);
  await page.locator('.category-directory > a').first().click();
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(10);
  await page.goto('/layouts/unknown');
  await expect(page.getByRole('heading', { name: '这一页，暂时留白。' })).toBeVisible();
  await page.goto('/unknown');
  await expect(page.getByRole('link', { name: '返回完整图库' })).toBeVisible();
});

test('continuous autoplay, exact loop, pause and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const clock = () => page.locator('#infinite-track').evaluate(el => Number(el.getAnimations()[0]?.currentTime ?? 0));
  await expect.poll(clock).toBeGreaterThan(100);
  const before = await clock();
  await expect.poll(clock).toBeGreaterThan(before + 150);
  await page.getByRole('button', { name: '暂停背景自动轮播' }).click();
  await expect.poll(() => page.locator('#infinite-track').evaluate(el => el.getAnimations()[0].playState)).toBe('paused');
  const paused = await clock();
  await page.waitForTimeout(150);
  expect(await clock()).toBe(paused);
  const periodic = await page.locator('#infinite-track').evaluate(el => {
    const animation = el.getAnimations()[0];
    animation.currentTime = 0;
    const first = getComputedStyle(el).transform;
    animation.currentTime = Number(animation.effect!.getTiming().duration);
    const wrapped = getComputedStyle(el).transform;
    const hrefs = (group: Element) => Array.from(group.querySelectorAll<HTMLAnchorElement>('a.poster'), link => link.getAttribute('href'));
    const firstGroup = hrefs(el.children[0]);
    const secondGroup = hrefs(el.children[1]);
    return first === wrapped && firstGroup.length > 0 && firstGroup.join('|') === secondGroup.join('|');
  });
  expect(periodic).toBe(true);
  await page.getByRole('button', { name: '继续背景自动轮播' }).click();
  await page.getByRole('link', { name: '浏览全部版式' }).click();
  await expect.poll(() => page.locator('#infinite-track').evaluate(el => el.getAnimations()[0].playState)).toBe('paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: '继续背景自动轮播' })).toHaveAttribute('aria-pressed', 'true');
});

test('responsive screenshots and image integrity', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, route] of [['home', '/'], ['detail', '/layouts/A01'], ['about', '/about']]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const imageErrors = await page.locator('img').evaluateAll(images => images.filter(i => i.complete && !i.naturalWidth).map(i => i.src));
    expect(imageErrors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
    if (name === 'home') {
      await page.getByRole('link', { name: '浏览全部版式' }).click();
      await page.waitForTimeout(250);
      await page.screenshot({ path: testInfo.outputPath('collection.png') });
    }
  }
});

test('keyboard accessibility and browser back position', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#collection');
  const card = page.locator('.gallery-grid .layout-card').nth(16);
  await card.scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  await card.click();
  await expect(page.locator('.detail-heading h1')).toBeVisible();
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, -1);
  for (const route of ['/', '/layouts/A01', '/about']) {
    await page.goto(route);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
});

test('sticky controls, filtered stepping and explicit gallery return', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?category=D#collection');
  const card = page.locator('.gallery-grid .layout-card').nth(6);
  await card.scrollIntoViewIfNeeded();
  const tools = await page.locator('.collection-tools').boundingBox();
  expect(tools!.y).toBeGreaterThanOrEqual(0);
  expect(tools!.y).toBeLessThan(2);
  await expect(page.getByRole('searchbox')).toBeInViewport();
  const position = await page.evaluate(() => scrollY);
  await card.click();
  await expect(page).toHaveURL(/\/layouts\/D07$/);
  await page.getByRole('link', { name: '下一种 →', exact: true }).click();
  await expect(page).toHaveURL(/\/layouts\/D08$/);
  await page.locator('.related').scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: '← 返回图库', exact: true })).toBeInViewport();
  await page.getByRole('link', { name: '← 返回图库', exact: true }).click();
  await expect(page.locator('.gallery-grid .layout-card')).toHaveCount(10);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, -1);
  await page.screenshot({ path: testInfo.outputPath('sticky-gallery.png') });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/?q=圆环#collection');
  await expect(page.getByRole('button', { name: '清除筛选 ×' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.goto('/layouts/D04');
  await expect(page.getByRole('link', { name: '下一种 →', exact: true })).toBeInViewport();
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
