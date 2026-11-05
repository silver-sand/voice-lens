"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { usePollinationsAuth } from '../../hooks/usePollinationsAuth';

export function BYOPSection() {
  const { isConnected, isLoading, error, connect, disconnect, accessToken } = usePollinationsAuth();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pollen Connection
        </h2>

        {!isConnected ? (
          <Button
            onClick={connect}
            disabled={isLoading}
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect Pollen
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={disconnect}
            variant="ghost"
            size="sm"
            className="gap-2 text-destructive hover:bg-destructive/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Disconnect
          </Button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </motion.div>
      )}

      <div className="space-y-3 text-sm">
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

        <AnimatePresence mode="wait">
          {showDetails && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-2 border-t border-border"
            >
              <div>
                <p className="font-medium text-foreground mb-2">How it works</p>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Click "Connect Pollen" to authorize via Pollinations Pay OAuth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span>You'll be redirected to Pollinations to approve the connection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span>After approval, you'll return here with AI features enabled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Each analysis uses your Pollen balance — no developer keys involved</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="font-medium text-foreground mb-1">Pollen Usage</p>
                <p className="text-sm text-muted-foreground">
                  Each style analysis consumes a small amount of Pollen from your balance.
                  The exact cost depends on the model and token count.
                  You can check your balance at <a href="https://enter.pollinations.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">enter.pollinations.ai</a>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Privacy Note
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your writing is sent to Pollinations for analysis only when you explicitly click "Analyze Style".
                  We never store your text. Tokens are kept in session storage only.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 p-2"
        >
          {showDetails ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Hide details
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show details
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}