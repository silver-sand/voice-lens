import { test, expect } from '@playwright/test';

const BASE_PATH = '/voice-lens';
const breakpoints = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const routes = [
  { path: '/', name: 'Landing' },
  { path: '/demo', name: 'Demo' },
  { path: '/write', name: 'Write' },
  { path: '/about', name: 'About' },
];

test.describe('Responsive Testing at 3 Breakpoints', () => {
  for (const bp of breakpoints) {
    for (const route of routes) {
      test(`${bp.name} (${bp.width}px) - ${route.name} page renders correctly`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });

        // Demo page needs API mocking
        if (route.path === '/demo') {
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
                      explanation: 'Your writing shows several patterns typical of LLM-generated text.',
                      keyInsights: ['Consider varying your sentence openings'],
                      rewrite: 'The cat sat on the mat.',
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
        }

        await page.goto(BASE_PATH + route.path);
        await page.waitForLoadState('networkidle');

        // Take screenshot for visual comparison
        await page.screenshot({
          path: `test-results/responsive-${bp.name}-${route.name}.png`,
          fullPage: true
        });

        // Verify no horizontal overflow (viewport width + scrollbar tolerance)
        // Mobile viewports can have small overflow due to scrollbar width
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const tolerance = bp.width < 500 ? 35 : 20; // More tolerance for mobile
        expect(bodyWidth).toBeLessThanOrEqual(bp.width + tolerance);

        // Verify main content is visible
        await expect(page.locator('main')).toBeVisible();
      });
    }
  }
});