"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks";
import { DEMO_CONFIG } from "../../lib/sampleText";

interface HighlightSegment {
  text: string;
  category?: 'formulaic' | 'transition' | 'repetition' | 'sentence' | 'vocabulary';
  findingId?: string;
}

function parseTextForHighlights(text: string, findings: typeof DEMO_CONFIG.findings): HighlightSegment[] {
  if (!findings.length) return [{ text }];

  const sortedFindings = [...findings].sort((a, b) => a.startOffset - b.startOffset);
  const segments: HighlightSegment[] = [];
  let lastEnd = 0;

  for (const finding of sortedFindings) {
    if (finding.startOffset > lastEnd) {
      segments.push({ text: text.slice(lastEnd, finding.startOffset) });
    }
    segments.push({
      text: finding.evidence,
      category: finding.category,
      findingId: finding.id,
    });
    lastEnd = finding.endOffset;
  }

  if (lastEnd < text.length) {
    segments.push({ text: text.slice(lastEnd) });
  }

  return segments;
}

export function Hero() {
  const reducedMotion = useReducedMotion();
  const [animatedSegments, setAnimatedSegments] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      // Show all immediately
      const segments = parseTextForHighlights(DEMO_CONFIG.text, DEMO_CONFIG.findings);
      setAnimatedSegments(new Set(segments.map((_, i) => String(i))));
      return;
    }

    const segments = parseTextForHighlights(DEMO_CONFIG.text, DEMO_CONFIG.findings);
    const timeoutIds: number[] = [];

    segments.forEach((_, index) => {
      const delay = index * DEMO_CONFIG.highlightStaggerDelay;
      const id = window.setTimeout(() => {
        setAnimatedSegments((prev) => new Set([...prev, String(index)]));
      }, delay);
      timeoutIds.push(id);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [reducedMotion]);

  const segments = parseTextForHighlights(DEMO_CONFIG.text, DEMO_CONFIG.findings);

  const getHighlightClass = (category?: string) => {
    switch (category) {
      case 'formulaic':
        return 'highlight-formulaic';
      case 'transition':
        return 'highlight-transition';
      case 'repetition':
        return 'highlight-repetition';
      case 'sentence':
        return 'highlight-sentence';
      case 'vocabulary':
        return 'highlight-vocabulary';
      default:
        return '';
    }
  };

  // Category-specific pulse colors for the animation
  // Use light tints (85-88% lightness) matching the base highlight colors
  // 0% and 100% use the base highlight color (0.9 opacity) to maintain contrast
  // 50% uses a lighter tint (0.5 opacity) for the pulse effect
  const getPulseStyles = (category?: string) => {
    if (!category) return {};
    switch (category) {
      case 'formulaic':
        return {
          '--pulse-start': 'hsl(10 65% 85% / 0.9)',
          '--pulse-mid': 'hsl(10 65% 85% / 0.5)',
          '--pulse-end': 'hsl(10 65% 85% / 0.9)',
        };
      case 'transition':
        return {
          '--pulse-start': 'hsl(270 50% 85% / 0.9)',
          '--pulse-mid': 'hsl(270 50% 85% / 0.5)',
          '--pulse-end': 'hsl(270 50% 85% / 0.9)',
        };
      case 'repetition':
        return {
          '--pulse-start': 'hsl(30 55% 88% / 0.9)',
          '--pulse-mid': 'hsl(30 55% 88% / 0.5)',
          '--pulse-end': 'hsl(30 55% 88% / 0.9)',
        };
      case 'sentence':
        return {
          '--pulse-start': 'hsl(145 35% 85% / 0.9)',
          '--pulse-mid': 'hsl(145 35% 85% / 0.5)',
          '--pulse-end': 'hsl(145 35% 85% / 0.9)',
        };
      case 'vocabulary':
        return {
          '--pulse-start': 'hsl(160 60% 85% / 0.9)',
          '--pulse-mid': 'hsl(160 60% 85% / 0.5)',
          '--pulse-end': 'hsl(160 60% 85% / 0.9)',
        };
      default:
        return {};
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative py-16 sm:py-24 lg:py-32 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 opacity-30" aria-hidden="true">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1
          id="hero-heading"
          className="font-display text-hero font-semibold tracking-tight text-foreground animate-fade-in mb-6"
          style={{ lineHeight: 1.1 }}
        >
          Your writing has a voice.
          <br />
          <span className="text-primary">Let&apos;s make it unmistakably yours.</span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          See the patterns behind your prose. Discover what feels repetitive, what feels formulaic,
          and where your writing can become more distinctly yours.
        </p>

        {/* Interactive Sample */}
        <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-soft max-w-3xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Interactive Sample
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" aria-hidden="true" />
                Live analysis
              </span>
            </div>

            <div
              className="font-mono text-base leading-relaxed text-left whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', lineHeight: '1.8' }}
              role="region"
              aria-label="Sample text with highlighted findings"
            >
              {segments.map((segment, index) => {
                const isAnimated = animatedSegments.has(String(index));
                const highlightClass = segment.category ? getHighlightClass(segment.category) : '';
                const shouldAnimate = isAnimated && segment.category;

                return (
                  <span
                    key={index}
                    className={`
                      ${highlightClass}
                      ${shouldAnimate ? 'animate-pulse-highlight' : ''}
                      ${segment.category ? 'transition-all duration-500' : ''}
                    `}
                    style={{
                      opacity: segment.category ? (isAnimated ? 1 : 0) : 1,
                      transform: segment.category ? (isAnimated ? 'translateY(0)' : 'translateY(4px)') : 'none',
                      ...(shouldAnimate ? getPulseStyles(segment.category) : {}),
                    }}
                    data-finding-id={segment.findingId}
                  >
                    {segment.text}
                  </span>
                );
              })}
            </div>

            {/* Finding Legend */}
            <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center justify-center gap-3">
              {DEMO_CONFIG.categoryOrder.map((cat) => (
                <span
                  key={cat}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border
                    ${cat === 'formulaic' ? 'bg-destructive/25 text-foreground border-destructive/60' : ''}
                    ${cat === 'transition' ? 'bg-[hsl(270_50%_50%)/25] text-foreground border-[hsl(270_50%_50%)/60]' : ''}
                    ${cat === 'repetition' ? 'bg-accent/25 text-foreground border-accent/60' : ''}
                    ${cat === 'sentence' ? 'bg-primary/25 text-foreground border-primary/60' : ''}
                    ${cat === 'vocabulary' ? 'bg-[hsl(160_60%_45%)/25] text-foreground border-[hsl(160_60%_45%)/60]' : ''}
                  `}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: cat === 'formulaic' ? 'hsl(var(--destructive))' :
                                     cat === 'transition' ? 'hsl(270 50% 50%)' :
                                     cat === 'repetition' ? 'hsl(var(--accent))' :
                                     cat === 'sentence' ? 'hsl(var(--primary))' :
                                     'hsl(160 60% 45%)',
                    }}
                    aria-hidden="true"
                  />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Caption */}
          <p className="mt-4 text-sm text-muted-foreground text-center">
            This is a live demonstration. Click findings in the workspace to explore evidence.
          </p>
        </div>
      </div>
    </section>
  );
}