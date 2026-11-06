import { test, expect } from '@playwright/test';

// Mock Pollinations API responses
const mockPollinationsChatResponse = {
  id: 'test-chat-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-4o-mini',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: JSON.stringify({
          explanation: 'Your writing shows several patterns typical of LLM-generated text, including formulaic openers and repetitive phrasing.',
          keyInsights: [
            'Consider varying your sentence openings',
            'Replace formulaic transitions with more natural connectors',
          ],
          rewrite: 'The cat sat on the mat. It purred loudly, enjoying the warm sunbeam.',
          confidence: 0.85,
        }),
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150,
  },
};

const mockPollinationsModelsResponse = {
  object: 'list',
  data: [
    { id: 'gpt-4o-mini', object: 'model', owned_by: 'pollinations' },
    { id: 'gpt-4o', object: 'model', owned_by: 'pollinations' },
    { id: 'claude-3.5-sonnet', object: 'model', owned_by: 'pollinations' },
  ],
};

test.describe('Style Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Pollinations API endpoints
    await page.route('**/gen.pollinations.ai/v1/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPollinationsChatResponse),
      });
    });

    await page.route('**/gen.pollinations.ai/v1/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPollinationsModelsResponse),
      });
    });

    // Pre-seed the auth token in sessionStorage to bypass OAuth flow
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('pollinationsAccessToken', 'mock-access-token-abcdef123456');
    });
    // Reload to pick up the token
    await page.reload();
  });

  test('loads the app with correct title and header', async ({ page }) => {
    await expect(page).toHaveTitle('Voice Lens — Style Analysis for Writers');
    await expect(page.locator('h1')).toContainText('Voice Lens');
    await expect(page.locator('text=Style analysis for thoughtful writers')).toBeVisible();
  });

  test('shows Pollen connection section in header', async ({ page }) => {
    await expect(page.locator('text=Pollen Connection')).toBeVisible();
    // Token is pre-seeded, so should show Connected state and Disconnect button
    await expect(page.locator('text=Connected')).toBeVisible();
    await expect(page.locator('button:has-text("Disconnect")')).toBeVisible();
  });

  test('allows typing in the editor', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('This is a test sentence. Another sentence follows.');
    await expect(textarea).toHaveValue('This is a test sentence. Another sentence follows.');
  });

  test('shows analyze button when text is entered', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('Test text for analysis.');
    await expect(page.locator('button:has-text("Analyze Style")')).toBeEnabled();
  });

  test('disables analyze button when editor is empty', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('');
    await expect(page.locator('button:has-text("Analyze Style")')).toBeDisabled();
  });

  test('runs local analysis and shows findings', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    // Text with repetitive patterns that local analysis will catch
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important. Furthermore, it changes rapidly. However, we must adapt. Therefore, we learn.');

    await page.locator('button:has-text("Analyze Style")').click();

    // Wait for local analysis to complete (should be fast)
    await expect(page.locator('text=findings detected')).toBeVisible({ timeout: 5000 });

    // Should show findings from local analysis
    await expect(page.locator('text=Repeated phrase detected').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows AI interpretation when Pollen is connected', async ({ page }) => {
    // First connect Pollen
    // Token is pre-seeded in beforeEach, so we should already be connected
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    // Wait for OAuth flow (mocked to redirect back immediately)
    // Wait for OAuth flow to complete - the URL is cleaned immediately after token exchange
    // so wait for the connected state instead
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });

    // Should now show connected state
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    // Now run analysis with some text
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    await page.locator('button:has-text("Analyze Style")').click();

    // Wait for analysis to complete
    await expect(page.locator('span:has-text("AI Interpretation")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Your writing shows several patterns typical of LLM-generated text')).toBeVisible();
    await expect(page.locator('text=Key Insights')).toBeVisible();
  });

  test('shows comparison view when rewrite is available', async ({ page }) => {
    // Connect Pollen first
    // Token is pre-seeded in beforeEach, so we should already be connected
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });
    // Wait for OAuth flow to complete - the URL is cleaned immediately after token exchange
    // so wait for the connected state instead
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    // Run analysis
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    await page.locator('button:has-text("Analyze Style")').click();
    await expect(page.locator('span:has-text("AI Interpretation")').first()).toBeVisible({ timeout: 10000 });

    // Comparison view should appear
    await expect(page.locator('text=Original')).toBeVisible();
    await expect(page.locator('text=Rewritten')).toBeVisible();
    await expect(page.locator('button:has-text("Copy Rewrite")')).toBeVisible();
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
  });

  test('copy rewrite button copies to clipboard', async ({ page }) => {
    // Connect and analyze
    // Token is pre-seeded in beforeEach, so we should already be connected
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });
    // Wait for OAuth flow to complete - the URL is cleaned immediately after token exchange
    // so wait for the connected state instead
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs.');

    await page.locator('button:has-text("Analyze Style")').click();
    await expect(page.locator('text=Rewritten')).toBeVisible({ timeout: 10000 });

    // Grant clipboard permission
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.locator('button:has-text("Copy Rewrite")').click();

    // Verify clipboard content (best effort - Playwright has limited clipboard API)
    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    expect(clipboardText.length).toBeGreaterThan(0);
  });

  test('export button downloads JSON file', async ({ page }) => {
    // Connect and analyze
    // Token is pre-seeded in beforeEach, so we should already be connected
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });
    // Wait for OAuth flow to complete - the URL is cleaned immediately after token exchange
    // so wait for the connected state instead
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox jumps.');

    await page.locator('button:has-text("Analyze Style")').click();
    await expect(page.locator('text=Rewritten')).toBeVisible({ timeout: 10000 });

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/style-analysis-\d+\.json/);
  });

  test('continues with local analysis when Pollinations API fails', async ({ page }) => {
    // Mock a failing Pollinations API response
    await page.route('**/gen.pollinations.ai/v1/chat/completions', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Connect and analyze
    // Token is pre-seeded in beforeEach, so we should already be connected
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });
    // Wait for OAuth flow to complete - the URL is cleaned immediately after token exchange
    // so wait for the connected state instead
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    // Use text that will trigger local analysis findings
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    await page.locator('button:has-text("Analyze Style")').click();

    // Local analysis should still complete and show findings
    await expect(page.locator('text=findings detected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Repeated phrase detected').first()).toBeVisible({ timeout: 5000 });
  });

  test('disconnect button works', async ({ page }) => {
    // Token is pre-seeded in beforeEach, so we should already be connected
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });
    // Wait for OAuth flow to complete - the URL is cleaned immediately after token exchange
    // so wait for the connected state instead
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Disconnect'));
      if (btn) btn.click();
    });

    await expect(page.locator('button:has-text("Connect Pollen")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Not connected')).toBeVisible();
  });

  test('shows details panel when "Show details" is clicked', async ({ page }) => {
    await expect(page.locator('text=How it works')).not.toBeVisible();

    await page.locator('button:has-text("Show details")').click();

    await expect(page.locator('text=How it works')).toBeVisible();
    await expect(page.locator('text=Click "Connect Pollen" to authorize via Pollinations Pay OAuth')).toBeVisible();
    await expect(page.locator('text=Pollen Usage')).toBeVisible();
    await expect(page.locator('text=Privacy Note')).toBeVisible();
  });

  test('handles keyboard shortcut Ctrl+Enter', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    await textarea.press('Control+Enter');

    // Should trigger analysis
    await expect(page.locator('text=findings detected')).toBeVisible({ timeout: 5000 });
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('h1')).toContainText('Voice Lens');
    await expect(page.locator('textarea[placeholder*="Write naturally"]')).toBeVisible();

    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    await page.locator('button:has-text("Analyze Style")').click();
    await expect(page.locator('text=findings detected')).toBeVisible({ timeout: 5000 });
  });

  test('shows word counts in comparison view', async ({ page }) => {
    // Token is pre-seeded in beforeEach, so we should already be connected
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });
    // Wait for OAuth flow to complete - the URL is cleaned immediately after token exchange
    // so wait for the connected state instead
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('Short text.');

    await page.locator('button:has-text("Analyze Style")').click();
    await expect(page.locator('text=Rewritten')).toBeVisible({ timeout: 10000 });

    // Check word counts are displayed
    await expect(page.locator('text=2 words')).toBeVisible(); // "Short text." = 2 words
  });

  test('legend shows finding categories', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    // Use text that triggers multiple finding categories
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important. Furthermore, it changes rapidly. However, we must adapt. Therefore, we learn.');

    await page.locator('button:has-text("Analyze Style")').click();
    await expect(page.locator('text=findings detected')).toBeVisible({ timeout: 5000 });

    // Check legend - rendered as lowercase with CSS uppercase transform
    // The legend is in ComparisonView, target the first occurrence which is the legend
    await expect(page.locator('span.uppercase:has-text("repetition")').first()).toBeVisible();
    // Only check for categories that actually appear in findings
    const categories = ['repetition', 'formulaic', 'structure', 'transitions', 'vocabulary'];
    for (const cat of categories) {
      const locator = page.locator(`span.uppercase:has-text("${cat}")`).first();
      if (await locator.count() > 0) {
        await expect(locator).toBeVisible();
      }
    }
  });

  test('footer shows privacy policy link', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=Voice Lens — Local-first style analysis')).toBeVisible();
    await expect(page.locator('a:has-text("Privacy Policy")')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/gen.pollinations.ai/v1/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPollinationsChatResponse),
      });
    });
    await page.route('**/gen.pollinations.ai/v1/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPollinationsModelsResponse),
      });
    });
    await page.goto('/');
  });

  test('has proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Voice Lens');
  });

  test('textarea has accessible label', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await expect(textarea).toHaveAttribute('aria-label', 'Writing area');
  });

  test('buttons have accessible names', async ({ page }) => {
    await expect(page.locator('button:has-text("Analyze Style")')).toBeVisible();
    await expect(page.locator('button:has-text("Connect Pollen")')).toBeVisible();
  });

  test('color is not the only means of conveying information', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Write naturally"]');
    await textarea.fill('The quick brown fox. The quick brown dog.');

    await page.locator('button:has-text("Analyze Style")').click();
    await expect(page.locator('text=findings detected')).toBeVisible({ timeout: 5000 });

    // Findings should have text labels (severity, category) not just colors
    await expect(page.locator('text=repetition').first()).toBeVisible();
  });
});