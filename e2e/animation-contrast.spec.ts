import { test, expect } from '@playwright/test';

const BASE_PATH = '/voice-lens';

/**
 * Contrast verification test for pulse-highlight animation
 * Measures computed contrast at 0%, 50%, and 100% keyframes for each category
 */
test.describe('Animation Contrast Verification - pulse-highlight', () => {
  test('Verify contrast ratios at animation keyframes for all highlight categories', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(BASE_PATH + '/');
    await page.waitForLoadState('networkidle');

    // Wait for initial render
    await page.waitForTimeout(500);

    // Get all highlight spans from the Hero component
    const highlightSpans = await page.locator('section[aria-labelledby="hero-heading"] span[data-finding-id]').all();

    console.log(`Found ${highlightSpans.length} highlighted spans`);

    const categories = ['formulaic', 'transition', 'repetition', 'sentence', 'vocabulary'];
    const results: Array<{
      category: string;
      keyframe: string;
      backgroundColor: string;
      color: string;
      contrastRatio: number;
      passes: boolean;
    }> = [];

    // Test at different animation progress points
    // We'll use the reduced motion media query to freeze at specific points
    // and compute the actual rendered colors

    for (const span of highlightSpans) {
      const findingId = await span.getAttribute('data-finding-id');
      if (!findingId) continue;

      // Get the category from the highlight class
      const className = await span.getAttribute('class') || '';
      let category = '';
      for (const cat of categories) {
        if (className.includes(`highlight-${cat}`)) {
          category = cat;
          break;
        }
      }

      if (!category) continue;

      // Test at animation start (0%) - wait for animation to begin
      await page.waitForTimeout(100);

      const stylesAtStart = await span.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
        };
      });

      // Test at animation midpoint (50%) - the pulse animation is 2s, so wait ~1s
      // We need to catch it at the right moment. Let's use a different approach:
      // Force the animation to a specific state using animation-play-state
      await page.evaluate(() => {
        const style = document.createElement('style');
        style.textContent = `
          .animate-pulse-highlight {
            animation-play-state: paused !important;
          }
        `;
        document.head.appendChild(style);
      });

      // Now manually set the animation progress to 50%
      await page.evaluate((cat) => {
        const spans = document.querySelectorAll(`.highlight-${cat}.animate-pulse-highlight`);
        spans.forEach((span, idx) => {
          // Set animation delay to negative value to jump to 50%
          // Animation is 2s, so -1s delay = 50% progress
          (span as HTMLElement).style.animationDelay = '-1s';
        });
      }, category);

      await page.waitForTimeout(100);

      const stylesAtMid = await span.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
        };
      });

      // Test at animation end (100%) - set delay to -2s (or just let it complete)
      await page.evaluate((cat) => {
        const spans = document.querySelectorAll(`.highlight-${cat}.animate-pulse-highlight`);
        spans.forEach((span) => {
          (span as HTMLElement).style.animationDelay = '-2s';
        });
      }, category);

      await page.waitForTimeout(100);

      const stylesAtEnd = await span.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
        };
      });

      // Remove the test style
      await page.evaluate(() => {
        const style = document.querySelector('style[data-test="animation-pause"]');
        if (style) style.remove();
      });

      // Calculate contrast ratios
      const calculateContrast = (fg: string, bg: string): number => {
        // Parse RGB values
        const parseColor = (color: string): [number, number, number] => {
          const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
          }
          // Handle rgb() format
          const match2 = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match2) {
            return [parseInt(match2[1]), parseInt(match2[2]), parseInt(match2[3])];
          }
          return [0, 0, 0];
        };

        const [r1, g1, b1] = parseColor(fg);
        const [r2, g2, b2] = parseColor(bg);

        // Calculate relative luminance
        const luminance = (r: number, g: number, b: number) => {
          const srgb = [r, g, b].map(v => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
        };

        const L1 = luminance(r1, g1, b1);
        const L2 = luminance(r2, g2, b2);

        const lighter = Math.max(L1, L2);
        const darker = Math.min(L1, L2);

        return (lighter + 0.05) / (darker + 0.05);
      };

      const contrastStart = calculateContrast(stylesAtStart.color, stylesAtStart.backgroundColor);
      const contrastMid = calculateContrast(stylesAtMid.color, stylesAtMid.backgroundColor);
      const contrastEnd = calculateContrast(stylesAtEnd.color, stylesAtEnd.backgroundColor);

      results.push(
        { category, keyframe: '0%', ...stylesAtStart, contrastRatio: contrastStart, passes: contrastStart >= 4.5 },
        { category, keyframe: '50%', ...stylesAtMid, contrastRatio: contrastMid, passes: contrastMid >= 4.5 },
        { category, keyframe: '100%', ...stylesAtEnd, contrastRatio: contrastEnd, passes: contrastEnd >= 4.5 }
      );

      console.log(`\n${category} (${findingId}):`);
      console.log(`  0%: bg=${stylesAtStart.backgroundColor}, fg=${stylesAtStart.color}, contrast=${contrastStart.toFixed(2)}:1 ${contrastStart >= 4.5 ? '✅' : '❌'}`);
      console.log(`  50%: bg=${stylesAtMid.backgroundColor}, fg=${stylesAtMid.color}, contrast=${contrastMid.toFixed(2)}:1 ${contrastMid >= 4.5 ? '✅' : '❌'}`);
      console.log(`  100%: bg=${stylesAtEnd.backgroundColor}, fg=${stylesAtEnd.color}, contrast=${contrastEnd.toFixed(2)}:1 ${contrastEnd >= 4.5 ? '✅' : '❌'}`);
    }

    // Report summary
    console.log('\n=== CONTRAST VERIFICATION SUMMARY ===');
    const failures = results.filter(r => !r.passes);
    if (failures.length > 0) {
      console.log(`\n❌ ${failures.length} CONTRAST VIOLATIONS FOUND:`);
      for (const f of failures) {
        console.log(`  ${f.category} at ${f.keyframe}: ${f.contrastRatio.toFixed(2)}:1 (required 4.5:1)`);
        console.log(`    bg: ${f.backgroundColor}, fg: ${f.color}`);
      }
    } else {
      console.log('\n✅ ALL CONTRAST CHECKS PASS (>= 4.5:1)');
    }

    // Also verify category-specific colors are maintained at 50%
    console.log('\n=== CATEGORY COLOR PRESERVATION AT 50% ===');
    const midResults = results.filter(r => r.keyframe === '50%');
    const uniqueBgColors = new Set(midResults.map(r => r.backgroundColor));
    console.log(`Unique background colors at 50%: ${uniqueBgColors.size} (expected: ${categories.length} for category-specific)`);
    if (uniqueBgColors.size === 1) {
      console.log('❌ ALL CATEGORIES USE SAME COLOR AT 50% - category highlighting lost during pulse!');
    } else {
      console.log('✅ Category-specific colors preserved at midpoint');
    }

    // Assert no violations
    expect(failures.length).toBe(0);
  });
});