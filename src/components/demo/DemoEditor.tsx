"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import type { DemoFinding } from "../../lib/types";

interface DemoEditorProps {
  text: string;
  findings: DemoFinding[];
  selectedFindingId: string | null;
  reducedMotion: boolean;
}

interface DemoEditorRef {
  scrollToFinding: (findingId: string) => void;
}

export const DemoEditor = forwardRef<DemoEditorRef, DemoEditorProps>(
  ({ text, findings, selectedFindingId, reducedMotion }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightLayerRef = useRef<HTMLDivElement>(null);

    // Expose scrollToFinding method
    useImperativeHandle(ref, () => ({
      scrollToFinding: (findingId: string) => {
        const finding = findings.find(f => f.id === findingId);
        if (finding && textareaRef.current) {
          const beforeText = text.slice(0, finding.startOffset);
          const lines = beforeText.split('\n');
          const lineNumber = lines.length;
          const lineHeight = 28.8; // 1.8 * 16px
          const scrollTop = (lineNumber - 1) * lineHeight;
          textareaRef.current.scrollTop = scrollTop;

          // Trigger pulse highlight
          textareaRef.current.dispatchEvent(new CustomEvent('highlight-finding', {
            detail: { findingId, startOffset: finding.startOffset, endOffset: finding.endOffset }
          }));
        }
      },
    }));

    // Handle highlight-finding event from parent
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const handleHighlight = () => {
        // The highlight is handled by the overlay layer
        // We just need to ensure the selection is visible
      };

      textarea.addEventListener('highlight-finding', handleHighlight as EventListener);
      return () => textarea.removeEventListener('highlight-finding', handleHighlight as EventListener);
    }, []);

    // Sync scroll between textarea and highlight overlay
    useEffect(() => {
      const textarea = textareaRef.current;
      const overlay = highlightLayerRef.current;
      if (!textarea || !overlay) return;

      const handleScroll = () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
      };

      textarea.addEventListener('scroll', handleScroll, { passive: true });
      return () => textarea.removeEventListener('scroll', handleScroll);
    }, []);

    // Build highlight segments
    const segments = buildHighlightSegments(text, findings);

    return (
      <div
        className="relative bg-surface border border-border rounded-xl overflow-hidden h-[500px] sm:h-[600px] flex flex-col"
        data-testid="demo-editor-container"
      >
        <div className="px-4 py-3 border-b border-border bg-surface-elevated/50 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Sample Text (Read-Only)</span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>{text.split(/\s+/).filter(Boolean).length} words</span>
            <span>{text.length} chars</span>
            <span>{text.match(/[.!?]+(?:\s|$)/g)?.length || 1} sentences</span>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {/* Highlight Overlay Layer */}
          <div
            ref={highlightLayerRef}
            className="absolute inset-0 p-4 pointer-events-none font-mono leading-relaxed whitespace-pre-wrap overflow-hidden"
            style={{ fontSize: '1rem', lineHeight: '1.8', fontFamily: 'var(--font-mono)' }}
            aria-hidden="true"
          >
            {segments.map((segment, index) => {
              const isSelected = selectedFindingId === segment.findingId;
              const highlightClass = segment.category ? getHighlightClass(segment.category) : '';
              const isAnimated = !reducedMotion && segment.category; // animate all highlights on load

              return (
                <span
                  key={index}
                  className={`
                    ${highlightClass}
                    ${isSelected && !reducedMotion ? 'animate-pulse-highlight' : ''}
                    ${isAnimated && !reducedMotion ? 'animate-fade-in' : ''}
                    transition-all duration-500
                  `}
                  style={{
                    animationDelay: !reducedMotion && segment.category ? `${index * 120}ms` : '0ms',
                    opacity: isAnimated && !reducedMotion ? 1 : 0,
                    transform: isAnimated && !reducedMotion ? 'translateY(0)' : 'translateY(4px)',
                  }}
                >
                  {segment.text}
                </span>
              );
            })}
          </div>

          {/* Actual Textarea (readonly, transparent) */}
          <textarea
            ref={textareaRef}
            readOnly
            value={text}
            className="absolute inset-0 p-4 font-mono leading-relaxed whitespace-pre-wrap bg-transparent text-transparent caret-transparent selection:bg-primary/20 resize-none border-none outline-none"
            style={{ fontSize: '1rem', lineHeight: '1.8', fontFamily: 'var(--font-mono)' }}
            aria-label="Sample text with highlighted findings"
            tabIndex={0}
            onSelect={(e) => {
              // Prevent text selection from interfering with highlights
              const target = e.target as HTMLTextAreaElement;
              target.setSelectionRange(0, 0);
            }}
          />
        </div>
      </div>
    );
  }
);

DemoEditor.displayName = 'DemoEditor';

function buildHighlightSegments(text: string, findings: DemoFinding[]): Array<{
  text: string;
  category?: DemoFinding['category'];
  findingId?: string;
}> {
  if (!findings.length) return [{ text }];

  const sortedFindings = [...findings].sort((a, b) => a.startOffset - b.startOffset);
  const segments: Array<{
    text: string;
    category?: DemoFinding['category'];
    findingId?: string;
  }> = [];
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

function getHighlightClass(category: DemoFinding['category']): string {
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
}