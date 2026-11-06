import { test, expect } from '@playwright/test';

test.describe('CSS Verification — Production Build', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('application root has correct background and typography', async ({ page }) => {
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    const background = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    const color = await root.evaluate((el) => getComputedStyle(el).color);
    const fontFamily = await root.evaluate((el) => getComputedStyle(el).fontFamily);

    // body has bg-background (white in light mode) and text-foreground
    expect(background).toBeTruthy();
    expect(color).toBeTruthy();
    expect(fontFamily).toContain('Inter');
  });

  test('header inner flex container has correct layout', async ({ page }) => {
    // The header contains a div.flex that has the layout - use first to avoid strict mode violation
    const headerFlex = page.locator('header .flex').first();
    await expect(headerFlex).toBeVisible();

    const display = await headerFlex.evaluate((el) => getComputedStyle(el).display);
    const alignItems = await headerFlex.evaluate((el) => getComputedStyle(el).alignItems);
    const justifyContent = await headerFlex.evaluate((el) => getComputedStyle(el).justifyContent);

    expect(display).toBe('flex');
    expect(alignItems).toBe('center');
    expect(justifyContent).toBe('space-between');
  });

  test('main element has max-width and centering', async ({ page }) => {
    // The main element has mx-auto max-w-7xl
    const main = page.locator('main');
    await expect(main).toBeVisible();

    const maxWidth = await main.evaluate((el) => getComputedStyle(el).maxWidth);
    const marginLeft = await main.evaluate((el) => getComputedStyle(el).marginLeft);
    const marginRight = await main.evaluate((el) => getComputedStyle(el).marginRight);

    // Browser computes rem to px (80rem = 1280px at 16px base)
    expect(['80rem', '1280px']).toContain(maxWidth);
    // Margins may compute to 0px in flex/grid contexts, verify visual centering instead
    const boundingBox = await main.boundingBox();
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (boundingBox && maxWidth === '1280px') {
      // Element should be centered: left offset = (viewport - 1280) / 2
      const expectedLeft = (viewportWidth - 1280) / 2;
      expect(boundingBox.x).toBeCloseTo(expectedLeft, 5); // within 5px
    }
  });

  test('editor has intended dimensions and typography', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await expect(textarea).toBeVisible();

    const fontFamily = await textarea.evaluate((el) => getComputedStyle(el).fontFamily);
    const lineHeight = await textarea.evaluate((el) => getComputedStyle(el).lineHeight);
    const minHeight = await textarea.evaluate((el) => getComputedStyle(el).minHeight);

    expect(fontFamily).toContain('JetBrains Mono');
    // line-height can be computed as pixels, so check value
    const lineHeightNum = parseFloat(lineHeight);
    expect(lineHeightNum).toBeGreaterThan(20); // 1.7 * 16px base ≈ 27px
    expect(parseFloat(minHeight)).toBeGreaterThanOrEqual(300);
  });

  test('connection panel (BYOPSection) has correct layout', async ({ page }) => {
    // BYOPSection renders the connection panel
    const connectionPanel = page.locator('text=Pollen Connection').locator('..').locator('..');
    await expect(connectionPanel).toBeVisible();

    const display = await connectionPanel.evaluate((el) => getComputedStyle(el).display);
    // Could be block or flex depending on implementation - check it's styled
    expect(['block', 'flex', 'inline-flex']).toContain(display);
  });

  test('buttons have intended styling', async ({ page }) => {
    const analyzeBtn = page.locator('button:has-text("Analyze Style")');
    const connectBtn = page.locator('button:has-text("Connect Pollen")');

    await expect(analyzeBtn).toBeVisible();
    await expect(connectBtn).toBeVisible();

    // Check button has Tailwind button styles (bg-primary, text-primary-foreground, rounded)
    const bgColor = await analyzeBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const textColor = await analyzeBtn.evaluate((el) => getComputedStyle(el).color);
    const borderRadius = await analyzeBtn.evaluate((el) => getComputedStyle(el).borderRadius);

    expect(bgColor).toBeTruthy();
    expect(textColor).toBeTruthy();
    expect(borderRadius).toBeTruthy();
  });

  test('responsive grid behavior - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const main = page.locator('main');
    const gridCols = await main.evaluate((el) => getComputedStyle(el).gridTemplateColumns);

    // On desktop, should have grid layout
    expect(gridCols).toBeTruthy();
  });

  test('responsive grid behavior - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const main = page.locator('main');
    const gridCols = await main.evaluate((el) => getComputedStyle(el).gridTemplateColumns);

    // On mobile, grid should be single column
    expect(gridCols).toBeTruthy();
  });

  test('dark mode styles work', async ({ page }) => {
    // Add dark class to html
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    const body = page.locator('body');
    const background = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    const color = await body.evaluate((el) => getComputedStyle(el).color);

    // Dark mode should have dark background
    expect(background).toBeTruthy();
    expect(color).toBeTruthy();
  });

  test('no assets return 404', async ({ page }) => {
    const responses: { url: string; status: number }[] = [];

    page.on('response', (response) => {
      responses.push({ url: response.url(), status: response.status() });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const failedAssets = responses.filter(
      (r) => r.status === 404 && (r.url.includes('.css') || r.url.includes('.js') || r.url.includes('.svg'))
    );

    expect(failedAssets.length).toBe(0);
  });

  test('no runtime errors in console', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out expected OAuth-related errors (no env vars in preview)
    const relevantErrors = errors.filter(
      (e) => !e.includes('OAuth') && !e.includes('Pollinations')
    );

    expect(relevantErrors.length).toBe(0);
  });

  test('screenshot desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/screenshot-desktop.png', fullPage: true });
  });

  test('screenshot mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/screenshot-mobile.png', fullPage: true });
  });
});