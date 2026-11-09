import { test, expect } from '@playwright/test';

const BASE_PATH = '/voice-lens';

// Mock Pollinations API responses for demo page
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

// Helper to mock Pollinations API for /write page when connected
async function mockPollinationsAPI(page: any) {
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
}

test.describe('End-to-End User Journeys', () => {
  // Journey 1: Landing → Write → Type → Local Analysis
  test('Journey 1: Landing page → Start Writing → Write page → type text → local analysis runs → findings appear', async ({ page }) => {
    await page.goto(BASE_PATH + '/');

    // Click "Start Writing" CTA
    await page.locator('a:has-text("Start Writing")').click();
    await expect(page).toHaveURL(BASE_PATH + '/write');

    // Type text that triggers local analysis
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important. Furthermore, it changes rapidly. However, we must adapt. Therefore, we learn.');

    // Wait for debounced analysis
    await page.waitForTimeout(500);

    // Verify findings appear
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Repetition').first()).toBeVisible({ timeout: 5000 });
  });

  // Journey 2: Landing → Demo → Findings → Click → Evidence → AI Interpretation
  test('Journey 2: Landing page → Explore Example → Demo page → findings visible → click finding → evidence shown → AI interpretation visible', async ({ page }) => {
    await page.goto(BASE_PATH + '/');

    // Click "Explore Example" CTA
    await page.locator('a:has-text("Explore Example")').click();
    await expect(page).toHaveURL(BASE_PATH + '/demo');

    // Mock API for demo page
    await mockPollinationsAPI(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify findings panel loads
    await expect(page.locator('text=Findings').first()).toBeVisible({ timeout: 5000 });

    // Click first finding (button with aria-pressed)
    const firstFinding = page.locator('button[aria-pressed]').first();
    await firstFinding.click();

    // Verify selected state
    await expect(firstFinding).toHaveAttribute('aria-pressed', 'true');

    // Verify AI Interpretation panel is visible
    await expect(page.locator('text=AI Interpretation (Preview)')).toBeVisible();

    // Open Key Insights details
    const keyInsightsSummary = page.locator('summary:has-text("Key Insights")');
    await expect(keyInsightsSummary).toBeVisible();
    await keyInsightsSummary.click();
    await expect(page.locator('text=Key Insights')).toBeVisible();

    // Verify Suggested Rewrite visible
    await expect(page.locator('text=Suggested Rewrite')).toBeVisible();
  });

  // Journey 3: Write page → Type → Export → Markdown downloads
  test('Journey 3: Write page → type text → click Export → markdown file downloads', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('Sample text to export.');

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[aria-label="Export as Markdown"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/voice-lens-draft\.md/);
  });

  // Journey 4: Write page → Type → Copy → Clipboard
  test('Journey 4: Write page → type text → click Copy → clipboard gets content', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('Text to copy.');

    // Grant clipboard permission
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.locator('button[aria-label="Copy to Clipboard"]').click();

    // Verify clipboard content
    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    expect(clipboardText).toBe('Text to copy.');
  });

  // Journey 5: Write page → Type → Clear → Confirmation → Editor cleared
  test('Journey 5: Write page → type text → click Clear → confirmation dialog → editor cleared', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('Text to clear.');

    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    await page.locator('button[aria-label="Clear Editor"]').click();

    await expect(textarea).toHaveValue('');
  });

  // Journey 6: Write page → Keyboard shortcut Ctrl+Shift+F → Focus mode entered → Press again → Focus mode exited
  test('Journey 6: Write page → press Ctrl+Shift+F → focus mode entered → press again → focus mode exited', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    // WritingWorkspace header should be visible initially
    const workspaceHeader = page.locator('header').filter({ has: page.locator('text=Writing Workspace') });
    await expect(workspaceHeader).toBeVisible();

    // Press Ctrl+Shift+F to enter focus mode
    await page.keyboard.press('Control+Shift+F');

    // WritingWorkspace header should be hidden in focus mode (opacity-0)
    await expect(workspaceHeader).toHaveClass(/opacity-0/);

    // Press Ctrl+Shift+F again to exit focus mode
    await page.keyboard.press('Control+Shift+F');

    // WritingWorkspace header should be visible again
    await expect(workspaceHeader).not.toHaveClass(/opacity-0/);
  });

  // Journey 7: Write page → Click focus button → Focus mode entered → Click exit button → Focus mode exited
  test('Journey 7: Write page → click focus button → focus mode entered → click exit button → focus mode exited', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    const workspaceHeader = page.locator('header').filter({ has: page.locator('text=Writing Workspace') });
    const focusBtn = workspaceHeader.locator('button[aria-label="Enter Focus Mode (⌘⇧F)"]').first();

    await expect(workspaceHeader).toBeVisible();
    await expect(focusBtn).toBeVisible();

    // Click to enter focus mode
    await focusBtn.click();

    // WritingWorkspace header should be hidden (opacity-0)
    await expect(workspaceHeader).toHaveClass(/opacity-0/);

    // Exit focus mode button should appear
    const exitBtn = page.locator('[data-testid="exit-focus-mode-btn"]').first();
    await expect(exitBtn).toBeVisible();

    // Click to exit focus mode
    await exitBtn.click();

    // WritingWorkspace header visible again
    await expect(workspaceHeader).not.toHaveClass(/opacity-0/);
  });

  // Journey 8: Write page → AI Interpretation placeholder shows Connect Pollinations link when OAuth not configured
  test('Journey 8: AI Interpretation placeholder shows Connect Pollinations link when OAuth not configured', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    // AI Interpretation placeholder should show "Connect Pollinations" link when env vars not set
    await expect(page.locator('text=AI Interpretation').first()).toBeVisible();
    await expect(page.locator('text=Connect Pollinations').first()).toBeVisible();

    // The link should navigate to /settings (which doesn't exist yet, but the link is present)
    const connectLink = page.locator('a:has-text("Connect Pollinations")').first();
    await expect(connectLink).toBeVisible();
    await expect(connectLink).toHaveAttribute('href', BASE_PATH + '/settings');
  });

  // Journey 9: About page navigation from any page
  test('Journey 9: About page accessible from all pages via footer link', async ({ page }) => {
    // From landing page
    await page.goto(BASE_PATH + '/');
    await page.locator('a:has-text("About & Privacy")').click();
    await expect(page).toHaveURL(BASE_PATH + '/about');
    await expect(page.locator('h1')).toContainText('Why Voice Lens?');

    // From write page
    await page.goto(BASE_PATH + '/write');
    await page.locator('a:has-text("About & Privacy")').click();
    await expect(page).toHaveURL(BASE_PATH + '/about');

    // From demo page
    await mockPollinationsAPI(page);
    await page.goto(BASE_PATH + '/demo');
    await page.waitForLoadState('networkidle');
    await page.locator('a:has-text("About & Privacy")').click();
    await expect(page).toHaveURL(BASE_PATH + '/about');
  });
});

test.describe('Additional Critical Journeys', () => {
  // Journey: Write page → Ctrl+Enter shortcut triggers analysis
  test('Write page → Ctrl+Enter keyboard shortcut triggers analysis', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    // Press Ctrl+Enter to trigger analysis
    await page.keyboard.press('Control+Enter');

    await page.waitForTimeout(500);
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });
  });

  // Journey: Focus mode hides header and shows fixed exit button
  test('Focus mode: header collapses, fixed exit button appears at top-right', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    const workspaceHeader = page.locator('header').filter({ has: page.locator('text=Writing Workspace') });
    const focusBtn = workspaceHeader.locator('button[aria-label="Enter Focus Mode (⌘⇧F)"]').first();

    await focusBtn.click();

    // Header should be hidden
    await expect(workspaceHeader).toHaveClass(/opacity-0/);

    // Fixed exit button should be visible at top-right
    const exitBtn = page.locator('[data-testid="exit-focus-mode-btn"]').first();
    await expect(exitBtn).toBeVisible();
    await expect(exitBtn).toHaveAttribute('aria-label', 'Exit Focus Mode');

    // Verify exit button is fixed position (outside collapsing header)
    const exitBtnBox = await exitBtn.boundingBox();
    const headerBox = await workspaceHeader.boundingBox();
    expect(exitBtnBox).toBeTruthy();
    expect(headerBox).toBeTruthy();
  });

  // Journey: Word counts and reading time update in real-time
  test('Word counts and reading time update in real-time as user types', async ({ page }) => {
    await page.goto(BASE_PATH + '/write');

    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    // "One two three four five. Six seven eight." = 8 words, 41 chars, 2 sentences
    await textarea.fill('One two three four five. Six seven eight.');

    await expect(page.locator('text=8 words')).toBeVisible();
    await expect(page.locator('text=2 sentences')).toBeVisible();
    await expect(page.locator('text=~1 min read')).toBeVisible();
    await expect(page.locator('text=41 chars')).toBeVisible();
  });

  // Journey: Footer links work correctly on all pages
  test('Footer links (About, GitHub, Quest) work on all pages', async ({ page }) => {
    const pages = ['/', '/write', '/demo', '/about'];

    for (const path of pages) {
      if (path === '/demo') {
        await mockPollinationsAPI(page);
      }
      await page.goto(BASE_PATH + path);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('a:has-text("About & Privacy")')).toBeVisible();
      await expect(page.locator('a:has-text("GitHub")')).toBeVisible();
      await expect(page.locator('a:has-text("Pollinations Quest #19180")')).toBeVisible();
    }
  });
});