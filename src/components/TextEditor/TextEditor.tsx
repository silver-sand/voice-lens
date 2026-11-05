"use client";

import { useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { Finding } from '../../lib/types';
import { buildHighlightedSegments, type HighlightSegment } from '../../lib/highlighting';

interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  findings: Finding[];
  disabled?: boolean;
  placeholder?: string;
}

export function TextEditor({
  text,
  onChange,
  onAnalyze,
  isAnalyzing,
  findings,
  disabled = false,
  placeholder = 'Start writing...',
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

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
      <div className="relative">
        {/* Highlight overlay */}
        <div
          ref={highlightRef}
          className={cn(
            'absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words',
            'px-4 py-3 text-base leading-relaxed font-mono',
            'bg-transparent'
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
            'editor-area w-full min-h-[300px] max-h-[600px]',
            'px-4 py-3 text-base leading-relaxed',
            'bg-transparent',
            'border-2 rounded-xl',
            'border-border',
            'placeholder:text-muted-foreground/50',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-y'
          )}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isAnalyzing}
          placeholder={placeholder}
          spellCheck={true}
          aria-label="Writing area"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onAnalyze}
          disabled={disabled || isAnalyzing || !text.trim()}
          size="lg"
          className="gap-2"
        >
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  aria-label="Analyzing"
                />
                <span>Analyzing...</span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analyze Style</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {findings.length > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-muted-foreground flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse-dot" />
            {findings.length} finding{findings.length !== 1 ? 's' : ''} detected
          </motion.span>
        )}

        <div className="flex-1" />

        <kbd className="px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
          Ctrl/Cmd + Enter
        </kbd>
      </div>
    </div>
  );
}