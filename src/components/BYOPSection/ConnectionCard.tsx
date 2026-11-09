"use client";

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ConnectionCardProps {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  isConfigured: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionCard({
  isConnected,
  isLoading,
  error,
  accessToken,
  isConfigured,
  onConnect,
  onDisconnect,
}: ConnectionCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pollen Connection
        </h2>

        {!isConnected ? (
          <Button
            onClick={onConnect}
            disabled={isLoading || !isConfigured}
            size="sm"
            className="gap-2"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className={cn(
                    'w-4 h-4 border-2 border-current border-t-transparent rounded-full',
                    !reducedMotion && 'animate-spin'
                  )}
                  aria-hidden="true"
                />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect Pollen
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onDisconnect}
            variant="ghost"
            size="sm"
            className="gap-2 text-destructive hover:bg-destructive/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Disconnect
          </Button>
        )}
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-down"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        isConnected
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          : 'bg-muted/50 border-border'
      )}>
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-muted-foreground/30'
          )}
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className={cn('font-medium', isConnected ? 'text-green-700 dark:text-green-400' : 'text-foreground')}>
            {isConnected ? 'Connected' : 'Not connected'}
          </p>
          <p className="text-muted-foreground">
            {isConnected
              ? 'Your Pollen account is linked. AI interpretation enabled.'
              : 'Connect to enable AI-powered style interpretation and rewrites.'}
          </p>
        </div>
        {isConnected && accessToken && (
          <span className="font-mono text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            {accessToken.slice(0, 8)}...{accessToken.slice(-4)}
          </span>
        )}
      </div>
    </div>
  );
}