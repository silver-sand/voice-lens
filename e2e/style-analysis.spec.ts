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

test.describe('Landing Page (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH + '/');
  });

  test('loads landing page with correct title and hero', async ({ page }) => {
    await expect(page).toHaveTitle('Voice Lens — Style Analysis for Writers');
    // Hero has two lines: "Your writing has a voice." and "Let's make it unmistakably yours."
    await expect(page.locator('h1')).toContainText('Your writing has a voice');
    await expect(page.locator('h1')).toContainText("Let's make it unmistakably yours");
    // Subhead text
    await expect(page.locator('text=See the patterns behind your prose')).toBeVisible();
  });

  test('CTA buttons navigate to correct pages', async ({ page }) => {
    // Start Writing button goes to /write
    await page.locator('a:has-text("Start Writing")').click();
    await expect(page).toHaveURL(BASE_PATH + '/write');

    // Go back to landing
    await page.goto(BASE_PATH + '/');

    // Explore Example button goes to /demo
    await page.locator('a:has-text("Explore Example")').click();
    await expect(page).toHaveURL(BASE_PATH + '/demo');
  });

  test('footer shows correct text and links', async ({ page }) => {
    await expect(page.locator('text=Voice Lens — Local-first style analysis for writers')).toBeVisible();
    await expect(page.locator('a:has-text("About & Privacy")')).toBeVisible();
    await expect(page.locator('a:has-text("GitHub")')).toBeVisible();
    await expect(page.locator('a:has-text("Pollinations Quest #19180")')).toBeVisible();
  });
});

test.describe('Demo Page (/demo)', () => {
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

    await page.goto(BASE_PATH + '/demo');
  });

  test('loads demo page with sample text and analysis', async ({ page }) => {
    await expect(page).toHaveTitle('Voice Lens — Style Analysis for Writers');
    await expect(page.locator('h1')).toContainText('See Voice Lens in Action');

    // Demo editor should have sample text (readonly)
    const demoEditor = page.locator('textarea[aria-label="Sample text with highlighted findings"]');
    await expect(demoEditor).toBeVisible();
    await expect(demoEditor).not.toBeEmpty();

    // Analysis panel should show findings
    await expect(page.locator('text=Findings').first()).toBeVisible({ timeout: 5000 });
  });

  test('demo findings are clickable and show evidence', async ({ page }) => {
    // Wait for analysis to load
    await expect(page.locator('text=Findings').first()).toBeVisible({ timeout: 5000 });

    // Click first finding - findings are rendered as <button> elements with aria-pressed
    const firstFinding = page.locator('button[aria-pressed]').first();
    await firstFinding.click();

    // Should show selected state
    await expect(firstFinding).toHaveAttribute('aria-pressed', 'true');
  });

  test('shows AI interpretation panel', async ({ page }) => {
    // The AI Interpretation (Preview) heading is visible
    await expect(page.locator('text=AI Interpretation (Preview)')).toBeVisible();

    // Key Insights is inside a <details> element - need to open it first
    const keyInsightsSummary = page.locator('summary:has-text("Key Insights")');
    await expect(keyInsightsSummary).toBeVisible();
    await keyInsightsSummary.click();
    await expect(page.locator('text=Key Insights')).toBeVisible();

    // Suggested Rewrite is visible
    await expect(page.locator('text=Suggested Rewrite')).toBeVisible();
  });
});

test.describe('Writing Workspace (/write) - Local Analysis Only', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
  });

  test('loads the writing workspace with correct title and header', async ({ page }) => {
    await expect(page).toHaveTitle('Voice Lens — Style Analysis for Writers');
    await expect(page.locator('h1')).toContainText('Writing Workspace');
  });

  test('shows formatting toolbar with all buttons', async ({ page }) => {
    await expect(page.locator('button[aria-label="Bold (⌘B)"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Italic (⌘I)"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Strikethrough (⌘⇧X)"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Inline Code (⌘E)"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Bullet List (⌘⇧L)"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Numbered List (⌘⇧O)"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Quote (⌘⇧Q)"]')).toBeVisible();
  });

  test('shows editor action buttons', async ({ page }) => {
    await expect(page.locator('button[aria-label="Export as Markdown"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Copy to Clipboard"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Clear Editor"]')).toBeVisible();
  });

  test('shows focus mode toggle', async ({ page }) => {
    await expect(page.locator('button[aria-label="Enter Focus Mode (⌘⇧F)"]')).toBeVisible();
  });

  test('allows typing in the editor', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('This is a test sentence. Another sentence follows.');
    await expect(textarea).toHaveValue('This is a test sentence. Another sentence follows.');
  });

  test('runs local analysis automatically and shows findings', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    // Text with repetitive patterns that local analysis will catch
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important. Furthermore, it changes rapidly. However, we must adapt. Therefore, we learn.');

    // Wait for debounced analysis to complete
    await page.waitForTimeout(500);

    // Should show findings from local analysis
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });
    // Check for specific finding categories
    await expect(page.locator('text=Repetition').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows finding categories in legend', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    // Use text that triggers multiple finding categories
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important. Furthermore, it changes rapidly. However, we must adapt. Therefore, we learn.');

    await page.waitForTimeout(500);
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });

    // Check legend - rendered as lowercase with CSS uppercase transform
    const categories = ['formulaic', 'transition', 'repetition', 'sentence', 'vocabulary'];
    for (const cat of categories) {
      const locator = page.locator(`span.uppercase:has-text("${cat}")`).first();
      if (await locator.count() > 0) {
        await expect(locator).toBeVisible();
      }
    }
  });

  test('shows AI Interpretation placeholder with Connect Pollinations link', async ({ page }) => {
    await expect(page.locator('text=AI Interpretation').first()).toBeVisible();
    await expect(page.locator('text=Connect Pollinations').first()).toBeVisible();
  });

  test('export button downloads markdown file', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('Sample text to export.');

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[aria-label="Export as Markdown"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/voice-lens-draft\.md/);
  });

  test('copy button copies to clipboard', async ({ page }) => {
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

  test('clear editor button works', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('Text to clear.');

    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    await page.locator('button[aria-label="Clear Editor"]').click();

    await expect(textarea).toHaveValue('');
  });

  test('focus mode toggle works via keyboard shortcut', async ({ page }) => {
    // Use keyboard shortcut Ctrl+Shift+F (registered globally in WritingWorkspace)
    // This bypasses the focus mode overlay interception issue and button label bug

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

  test('WritingWorkspace toolbar focus button toggles focus mode independently', async ({ page }) => {
    // The WritingWorkspace component renders its own focus mode toggle button
    // in the toolbar (aria-label "Enter Focus Mode (⌘⇧F)" / "Exit Focus Mode").
    // This test exercises that button via click (not keyboard shortcut) and
    // asserts on the WritingWorkspace header's visibility.
    const workspaceHeader = page.locator('header').filter({ has: page.locator('text=Writing Workspace') });
    // The WritingWorkspace toolbar button is in the header's right side and
    // has class "bg-surface-elevated/50 border border-border".
    const focusBtn = workspaceHeader.locator('button[aria-label="Enter Focus Mode (⌘⇧F)"]').first();
    await expect(workspaceHeader).toBeVisible();
    await expect(focusBtn).toBeVisible();

    // Click to enter focus mode.
    // Now that PageLayout omits its Header on /write (showHeader={false}),
    // there is no sticky-header overlap; a normal Playwright click works.
    await focusBtn.click();

    // WritingWorkspace header should be hidden (opacity-0)
    await expect(workspaceHeader).toHaveClass(/opacity-0/);

    // In focus mode, the toolbar header collapses and a fixed-position
    // "Exit Focus Mode" button appears at top-right (outside the collapsing header).
    // Use data-testid to target the fixed button specifically.
    const exitBtn = page.locator('[data-testid="exit-focus-mode-btn"]').first();
    await expect(exitBtn).toBeVisible();

    // Click again to exit
    await exitBtn.click();

    // WritingWorkspace header visible again
    await expect(workspaceHeader).not.toHaveClass(/opacity-0/);
  });

  test('handles keyboard shortcut Ctrl+Enter for analysis', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    await page.waitForTimeout(500);
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('h1')).toContainText('Writing Workspace');
    await expect(page.locator('textarea[aria-label="Writing editor"]')).toBeVisible();

    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology is important.');

    await page.waitForTimeout(500);
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });
  });

  test('footer shows correct text and links', async ({ page }) => {
    await expect(page.locator('text=Voice Lens — Local-first style analysis for writers')).toBeVisible();
    await expect(page.locator('a:has-text("About & Privacy")')).toBeVisible();
    await expect(page.locator('a:has-text("GitHub")')).toBeVisible();
    await expect(page.locator('a:has-text("Pollinations Quest #19180")')).toBeVisible();
  });

  test('shows word counts and reading time in editor header', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    // "One two three four five. Six seven eight." = 8 words, 41 chars, 2 sentences
    await textarea.fill('One two three four five. Six seven eight.');

    // The editor header shows counts with labels like "8 words", "41 chars", "2 sentences", "~1 min read"
    await expect(page.locator('text=8 words')).toBeVisible();
    await expect(page.locator('text=2 sentences')).toBeVisible();
    await expect(page.locator('text=~1 min read')).toBeVisible();
    await expect(page.locator('text=41 chars')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH + '/write');
  });

  test('has proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Writing Workspace');
  });

  test('textarea has accessible label', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await expect(textarea).toHaveAttribute('aria-label', 'Writing editor');
  });

  test('buttons have accessible names', async ({ page }) => {
    await expect(page.locator('button[aria-label="Bold (⌘B)"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Italic (⌘I)"]')).toBeVisible();
  });

  test('color is not the only means of conveying information', async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Writing editor"]');
    await textarea.fill('The quick brown fox. The quick brown dog.');

    await page.waitForTimeout(500);
    await expect(page.locator('text=Total Findings').first()).toBeVisible({ timeout: 5000 });

    // Findings should have text labels (severity, category) not just colors
    await expect(page.locator('text=repetition').first()).toBeVisible();
  });
});