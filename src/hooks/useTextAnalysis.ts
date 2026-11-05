import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeText, computeSummary } from '../lib/analysis/localAnalysis';
import { interpretWithPollinations } from '../lib/pollinations/api';
import type { AnalysisResult, AnalysisState, InterpretationResponse } from '../lib/types';

export function useTextAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    text: '',
    isAnalyzing: false,
    result: null,
    error: null,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollinationsAbortRef = useRef<AbortController | null>(null);
  const textRef = useRef(state.text);
  const isAnalyzingRef = useRef(state.isAnalyzing);
  // Track request generation to handle rapid re-analysis
  const requestGenerationRef = useRef(0);

  // Keep textRef in sync with state.text
  useEffect(() => {
    textRef.current = state.text;
  }, [state.text]);

  // Keep isAnalyzingRef in sync with state.isAnalyzing
  useEffect(() => {
    isAnalyzingRef.current = state.isAnalyzing;
  }, [state.isAnalyzing]);

  const setText = useCallback((text: string) => {
    setState(prev => ({ ...prev, text, result: null, error: null }));
  }, []);

  const analyze = useCallback(async () => {
    // Read current state directly to avoid stale closure
    // textRef.current and isAnalyzingRef.current are kept in sync via useEffect
    if (isAnalyzingRef.current) return;
    if (!textRef.current.trim()) return;

    // Cancel any in-flight requests and increment generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pollinationsAbortRef.current) {
      pollinationsAbortRef.current.abort();
    }

    const currentGeneration = ++requestGenerationRef.current;

    abortControllerRef.current = new AbortController();
    pollinationsAbortRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      progress: 0,
      result: null,
    }));

    try {
      // Step 1: Local deterministic analysis (fast, ~50ms)
      setState(prev => ({ ...prev, progress: 20 }));
      const currentText = textRef.current;
      const localResult = analyzeText(currentText);

      // Check if this request was superseded
      if (currentGeneration !== requestGenerationRef.current) {
        return;
      }

      // Step 2: Build summary from local findings
      setState(prev => ({ ...prev, progress: 50 }));
      const summary = computeSummary(currentText, localResult.findings);

      // Check if this request was superseded
      if (currentGeneration !== requestGenerationRef.current) {
        return;
      }

      // Step 3: AI interpretation via Pollinations (if connected)
      let interpretation: InterpretationResponse | undefined;
      const { getStoredToken } = await import('../lib/pollinations/auth');
      if (getStoredToken()) {
        setState(prev => ({ ...prev, progress: 70 }));
        try {
          interpretation = await interpretWithPollinations(currentText, localResult.findings);
        } catch (err) {
          console.warn('Pollinations interpretation failed:', err);
          // Continue without AI interpretation
        }
      }

      // Check if this request was superseded
      if (currentGeneration !== requestGenerationRef.current) {
        return;
      }

      setState(prev => ({ ...prev, progress: 90 }));

      // Step 4: Combine results
      const result: AnalysisResult = {
        findings: localResult.findings,
        summary,
        suggestedRewrite: interpretation?.rewrite,
        interpretation,
      };

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        result,
        progress: 100,
      }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignore aborted requests
        return;
      }
      // Only set error if this is still the current generation
      if (currentGeneration === requestGenerationRef.current) {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: err instanceof Error ? err.message : 'Analysis failed',
        }));
      }
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (pollinationsAbortRef.current) {
      pollinationsAbortRef.current.abort();
      pollinationsAbortRef.current = null;
    }
    // Increment generation to invalidate any in-flight requests
    requestGenerationRef.current += 1;
    setState(prev => ({ ...prev, isAnalyzing: false, progress: 0 }));
  }, []);

  const clear = useCallback(() => {
    cancel();
    setState({
      text: '',
      isAnalyzing: false,
      result: null,
      error: null,
      progress: 0,
    });
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (pollinationsAbortRef.current) pollinationsAbortRef.current.abort();
    };
  }, []);

  return {
    ...state,
    setText,
    analyze,
    cancel,
    clear,
  };
}