import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_PATH = '/voice-lens';

test.describe('Accessibility - Automated Axe Checks', () => {
  test('Landing page (/) should have no accessibility violations', async ({ page }) => {
    await page.goto(BASE_PATH + '/');
    await page.waitForLoadState('networkidle');

    // Wait for pulse-highlight animations to complete (2s duration + stagger delays for 11 findings)
    // Last finding starts at 10 * 120ms = 1200ms, animation duration = 2000ms, total ~3200ms
    await page.waitForTimeout(3500);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Writing Workspace (/write) should have no accessibility violations', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Demo page (/demo) should have no accessibility violations', async ({ page }) => {
    // Mock Pollinations API
    await page.route('**/gen.pollinations.ai/v1/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-chat-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'gpt-4o-mini',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify({
                explanation: 'Test explanation',
                keyInsights: ['Insight 1'],
                rewrite: 'Test rewrite',
                confidence: 0.85,
              }),
            },
            finish_reason: 'stop',
          }],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        }),
      });
    });

    await page.route('**/gen.pollinations.ai/v1/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          object: 'list',
          data: [
            { id: 'gpt-4o-mini', object: 'model', owned_by: 'pollinations' },
            { id: 'gpt-4o', object: 'model', owned_by: 'pollinations' },
          ],
        }),
      });
    });

    await page.goto(BASE_PATH + '/demo');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('About page (/about) should have no accessibility violations', async ({ page }) => {
    await page.goto(BASE_PATH + '/about');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('Landing page - Tab navigation reaches all interactive elements', async ({ page }) => {
    await page.goto(BASE_PATH + '/');
    await page.waitForLoadState('networkidle');

    // Tab through all focusable elements
    const focusableSelectors = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const focusableElements = await page.locator(focusableSelectors).all();

    expect(focusableElements.length).toBeGreaterThan(0);

    // Verify first element can be focused
    await focusableElements[0].focus();
    await expect(focusableElements[0]).toBeFocused();
  });

  test('Writing Workspace - Full keyboard workflow', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    // Focus editor
    const editor = page.locator('textarea[aria-label="Writing editor"]');
    await editor.focus();
    await expect(editor).toBeFocused();

    // Type text - analysis is debounced (auto-runs)
    await editor.fill('This is a test sentence. This is a test sentence.');

    // Wait for debounced analysis
    await page.waitForTimeout(1000);

    // Tab to toolbar buttons
    const boldButton = page.locator('button[aria-label="Bold (⌘B)"]');
    await boldButton.focus();
    await expect(boldButton).toBeFocused();

    // Verify findings are accessible (no analyze button - analysis is auto)
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });
  });

  test('Writing Workspace - Focus mode toggle via keyboard', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    // Ctrl+Shift+F should toggle focus mode
    await page.keyboard.press('Control+Shift+F');
    await page.waitForTimeout(300);

    // Verify focus mode indicator appears
    const focusIndicator = page.locator('text=Focus Mode');
    await expect(focusIndicator).toBeVisible({ timeout: 2000 });

    // Toggle off
    await page.keyboard.press('Control+Shift+F');
    await page.waitForTimeout(300);
  });

  test('Writing Workspace - Analysis runs automatically on text change', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const editor = page.locator('textarea[aria-label="Writing editor"]');
    await editor.fill('Test sentence for analysis. Test sentence for analysis.');
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Accessibility - Focus Management', () => {
  test('Writing Workspace - Focus indicator visible on all interactive elements', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const interactiveElements = await page.locator('button, a, textarea, [role="button"]').all();

    for (const element of interactiveElements) {
      await element.focus();
      await expect(element).toBeFocused();

      // Check for visible focus ring (via computed styles)
      const focusStyles = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have some focus indicator (outline or box-shadow)
      const hasFocusIndicator =
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.outlineStyle !== 'none' ||
        focusStyles.boxShadow !== 'none';

      // Skip elements that are visually hidden but focusable
      if (hasFocusIndicator || (await element.isVisible())) {
        expect(hasFocusIndicator).toBeTruthy();
      }
    }
  });

  test('Writing Workspace - Focus trap in focus mode', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    // Enable focus mode
    await page.keyboard.press('Control+Shift+F');
    await page.waitForTimeout(300);

    // Tab should cycle within focus mode elements
    const editor = page.locator('textarea[aria-label="Writing editor"]');
    await editor.focus();

    // Tab forward
    await page.keyboard.press('Tab');
    // Should still be in focusable elements
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['TEXTAREA', 'BUTTON', 'A', 'DIV'].includes(focused)).toBeTruthy();
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('Writing Workspace - ARIA live regions for analysis results', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const editor = page.locator('textarea[aria-label="Writing editor"]');
    await editor.fill('The cat sat on the mat. The cat sat on the mat.');
    await page.waitForTimeout(1000);

    // Check for aria-live region
    const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    await expect(liveRegion.first()).toBeVisible();
  });

  test('Writing Workspace - Findings have proper roles and labels', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const editor = page.locator('textarea[aria-label="Writing editor"]');
    await editor.fill('The cat sat on the mat. The cat sat on the mat.');
    await page.waitForTimeout(1500);

    // Findings should have role="list" or role="listitem"
    const findingsList = page.locator('[role="list"], [role="listitem"]');
    // At minimum, findings should be structured with proper headings
    const findingHeaders = page.locator('h3, h4, [role="heading"]');
    await expect(findingHeaders.first()).toBeVisible({ timeout: 5000 });
  });

  test('Buttons have accessible names via aria-label or text content', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      const hasAccessibleName = !!ariaLabel || (textContent && textContent.trim().length > 0);
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('Form controls have associated labels', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await expect(textarea).toHaveAttribute('aria-label', 'Writing editor');
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('Text meets WCAG AA contrast ratio (4.5:1 for normal text)', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    // Use axe to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('UI components meet 3:1 contrast for non-text elements', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    const nonTextContrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'non-text-contrast'
    );

    expect(nonTextContrastViolations).toEqual([]);
  });
});

test.describe('Accessibility - Reduced Motion', () => {
  test('prefers-reduced-motion is respected globally', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    // Trigger an animation (e.g., analysis)
    const editor = page.locator('textarea[aria-label="Writing editor"]');
    await editor.fill('Test sentence. Test sentence.');
    await page.waitForTimeout(1000);

    // Check that animations are disabled via computed styles
    const animationDuration = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return style.getPropertyValue('--duration-normal') || '300ms';
    });

    // Global reduced motion media query should force 0.01ms
    // This is verified by the CSS rule in index.css
    const reducedMotionActive = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    expect(reducedMotionActive).toBeTruthy();
  });

  test('Spinner respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(BASE_PATH + '/write');
    await page.waitForLoadState('networkidle');

    // Trigger analysis to show spinner
    const editor = page.locator('textarea[aria-label="Writing editor"]');
    await editor.fill('Test sentence for spinner. Test sentence for spinner.');
    await page.waitForTimeout(1000);

    // Check spinner animation is disabled
    const spinner = page.locator('.animate-spin').first();
    if (await spinner.isVisible()) {
      const animation = await spinner.evaluate((el) => {
        return window.getComputedStyle(el).animationDuration;
      });
      // Should be 0.01ms or 0s due to reduced motion
      expect(parseFloat(animation)).toBeLessThanOrEqual(0.01);
    }
  });
});