"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface DetailsPanelProps {
  showDetails: boolean;
  onToggleDetails: () => void;
}

export function DetailsPanel({ showDetails, onToggleDetails }: DetailsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [showContent, setShowContent] = useState(showDetails);

  // Sync internal state with prop
  useEffect(() => {
    setIsExpanded(showDetails);
    if (showDetails) {
      setShowContent(true);
    }
  }, [showDetails]);

  // Delay hiding content until animation completes
  useEffect(() => {
    if (!isExpanded) {
      const timer = setTimeout(() => {
        setShowContent(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <div className="space-y-3 text-sm">
      {showContent && (
        <div
          id="details"
          className={cn(
            'space-y-3 pt-2 border-t border-border overflow-hidden transition-all duration-300 ease-out',
            isExpanded ? 'animate-height-expand' : 'animate-height-collapse'
          )}
        >
          <section aria-labelledby="how-it-works-heading">
            <h3 id="how-it-works-heading" className="font-medium text-foreground mb-2">
              How it works
            </h3>
            <ul className="space-y-1 text-muted-foreground text-sm" role="list">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" aria-hidden="true" />
                <span>Click "Connect Pollen" to authorize via Pollinations Pay OAuth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" aria-hidden="true" />
                <span>You'll be redirected to Pollinations to approve the connection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" aria-hidden="true" />
                <span>After approval, you'll return here with AI features enabled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" aria-hidden="true" />
                <span>Each analysis uses your Pollen balance — no developer keys involved</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="pollen-usage-heading" className="p-3 rounded-lg bg-muted/50 border border-border">
            <h3 id="pollen-usage-heading" className="font-medium text-foreground mb-1">Pollen Usage</h3>
            <p className="text-sm text-muted-foreground">
              Each style analysis consumes a small amount of Pollen from your balance.
              The exact cost depends on the model and token count.
              You can check your balance at{' '}
              <a
                href="https://enter.pollinations.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                enter.pollinations.ai
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="privacy-note-heading" className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <h3 id="privacy-note-heading" className="font-medium text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Privacy Note
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your writing is sent to Pollinations for analysis only when you explicitly click "Analyze Style".
              We never store your text. Tokens are kept in session storage only.
            </p>
          </section>
        </div>
      )}

      <Button
        onClick={onToggleDetails}
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 p-2"
        aria-expanded={isExpanded}
        aria-controls="details"
      >
        {isExpanded ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Hide details
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Show details
          </>
        )}
      </Button>
    </div>
  );
}