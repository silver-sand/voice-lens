"use client";

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TextEditor } from './components/TextEditor/TextEditor';
import { AnalysisPanel } from './components/AnalysisPanel/AnalysisPanel';
import { ComparisonView } from './components/ComparisonView/ComparisonView';
import { BYOPSection } from './components/BYOPSection/BYOPSection';
import { useTextAnalysis } from './hooks/useTextAnalysis';
import { usePollinationsAuth } from './hooks/usePollinationsAuth';

export function App() {
  const {
    text,
    isAnalyzing,
    error: analysisError,
    progress,
    result,
    analyze: runAnalysis,
    setText,
  } = useTextAnalysis();

  const { isConnected } = usePollinationsAuth();

  const rewrittenText = result?.suggestedRewrite;
  const showComparison = !!result?.suggestedRewrite;
  const findings = result?.findings ?? [];
  const interpretation = result?.interpretation;

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;
    await runAnalysis();
  }, [text, runAnalysis]);

  const handleCopyRewrite = useCallback(() => {
    if (rewrittenText) {
      navigator.clipboard.writeText(rewrittenText);
    }
  }, [rewrittenText]);

  const handleExport = useCallback(() => {
    if (!result || !rewrittenText) return;

    const exportData = {
      originalText: text,
      rewrittenText,
      findings: result.findings,
      interpretation: result.interpretation,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `style-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, rewrittenText, text]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-2 rounded-lg bg-primary/10"
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2-2m2 2l-2-2m0 6h4m-2 2l2 2m-2-2l-2-2M3 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Voice Lens</h1>
                <p className="text-xs text-muted-foreground">Style analysis for thoughtful writers</p>
              </div>
            </div>

            <BYOPSection />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 flex flex-col min-h-[calc(100vh-200px)]"
          >
            <TextEditor
              text={text}
              onChange={setText}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              findings={findings}
              placeholder={isConnected
                ? 'Write naturally. Press Ctrl/Cmd+Enter to analyze your style.'
                : 'Write naturally. Connect Pollen to unlock AI interpretation and rewrites.'}
            />

            {analysisError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-destructive">Analysis failed</p>
                    <p className="text-sm text-muted-foreground mt-1">{analysisError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {progress && isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10"
              >
                <div className="flex items-center gap-3 text-sm text-primary">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  <span>{progress}</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right panel: Analysis + Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 min-h-[calc(100vh-200px)]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <AnalysisPanel
                findings={findings}
                interpretation={interpretation}
                isAnalyzing={isAnalyzing}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {(showComparison || rewrittenText) && (
                <motion.div
                  key="comparison"
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="flex-1 min-h-[400px]"
                >
                  <ComparisonView
                    originalText={text}
                    rewrittenText={rewrittenText}
                    findings={findings}
                    onCopyRewrite={handleCopyRewrite}
                    onExport={handleExport}
                    hasRewrite={!!rewrittenText}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              Voice Lens — Local-first style analysis. Your text never leaves this browser unless you explicitly analyze with Pollinations.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/pollinations/pollinations"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Pollinations Quest #19180
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}