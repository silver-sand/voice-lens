"use client";

import { useRef, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { Finding } from '../../lib/types';
import { buildHighlightedSegments, type HighlightSegment } from '../../lib/highlighting';
import { WordCount } from './WordCount';
import { ReadabilityScore } from './ReadabilityScore';
import { useFocusMode } from '../../providers/FocusModeProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  findings: Finding[];
  disabled?: boolean;
  placeholder?: string;
  showToolbar?: boolean;
  showHeader?: boolean;
}

export function TextEditor({
  text,
  onChange,
  onAnalyze,
  isAnalyzing,
  findings,
  disabled = false,
  placeholder = 'Start writing...',
  showToolbar = true,
  showHeader = true,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const { isFocusMode } = useFocusMode();
  const reducedMotion = useReducedMotion();

  // Build highlighted text segments - memoized to avoid recomputation
  const highlightedSegments = useMemo<HighlightSegment[]>(
    () => buildHighlightedSegments(text, findings),
    [text, findings]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onAnalyze();
    }
  }, [onAnalyze]);

  return (
    <div className="relative flex flex-col gap-3">
      {/* Header with WordCount and ReadabilityScore */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated/50">
          <span className="text-sm font-medium text-foreground">Editor</span>
          <div className="flex items-center gap-4">
            <ReadabilityScore text={text} />
            <div className="w-px h-6 bg-border" aria-hidden="true" />
            <WordCount text={text} />
          </div>
        </div>
      )}

      <div className="relative flex-1">
        {/* Highlight overlay */}
        <div
          ref={highlightRef}
          className={cn(
            'absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words',
            'px-4 py-3 leading-relaxed font-mono',
            'bg-transparent',
            'text-base'
          )}
          aria-hidden="true"
        >
          {highlightedSegments.map((segment, i) => (
            <span
              key={i}
              className={cn(
                segment.className,
                'rounded-[2px] px-[1px] -ml-[1px]'
              )}
            >
              {segment.text}
            </span>
          ))}
        </div>

        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          className={cn(
            'editor-area w-full min-h-[500px] max-h-[700px]',
            'px-4 py-3 leading-relaxed',
            'bg-transparent',
            'border-2 rounded-xl',
            'border-border',
            'placeholder:text-muted-foreground/50',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-y',
            'font-mono',
            'text-base'
          )}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isAnalyzing}
          placeholder={placeholder}
          spellCheck={true}
          aria-label="Writing area"
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            fontFamily: 'var(--font-mono)',
          }}
        />
      </div>

      {showToolbar && !isFocusMode && (
        <div className="flex items-center gap-3">
          <Button
            onClick={onAnalyze}
            disabled={disabled || isAnalyzing || !text.trim()}
            size="lg"
            className="gap-2"
          >
            {isAnalyzing ? (
              <div className={cn('flex items-center gap-2', !reducedMotion && 'animate-fade-in')}>
                <span
                  className={cn(
                    'w-4 h-4 border-2 border-current border-t-transparent rounded-full',
                    !reducedMotion && 'animate-spin'
                  )}
                  aria-label="Analyzing"
                />
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className={cn('flex items-center gap-2', !reducedMotion && 'animate-slide-in-right')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analyze Style</span>
              </div>
            )}
          </Button>

          {findings.length > 0 && (
            <span className={cn(
              'text-sm text-muted-foreground flex items-center gap-1',
              !reducedMotion && 'animate-fade-in'
            )}>
              <span className={cn(
                'w-2 h-2 rounded-full bg-yellow-500',
                !reducedMotion && 'animate-pulse-dot'
              )} />
              {findings.length} finding{findings.length !== 1 ? 's' : ''} detected
            </span>
          )}

          <div className="flex-1" />

          <kbd className="px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
            Ctrl/Cmd + Enter
          </kbd>
        </div>
      )}
    </div>
  );
}