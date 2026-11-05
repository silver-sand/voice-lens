import { useState, useEffect, useCallback, useRef } from 'react';
import { generatePKCE, buildAuthUrl, exchangeCodeForToken, getStoredToken, clearStoredToken } from '../lib/pollinations/auth';

export function usePollinationsAuth() {
  // Initialize state from sessionStorage to avoid setState in effect
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
  const [isConnected, setIsConnected] = useState(() => !!getStoredToken());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCallbackRef = useRef<((code: string, state: string) => Promise<void>) | null>(null);

  const handleCallback = useCallback(async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await exchangeCodeForToken(code, state);
      setAccessToken(token);
      setIsConnected(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsConnected(false);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Keep ref in sync
  useEffect(() => {
    handleCallbackRef.current = handleCallback;
  }, [handleCallback]);

  // Handle OAuth callback on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`OAuth error: ${errorParam}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state && handleCallbackRef.current) {
      handleCallbackRef.current(code, state);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { codeChallenge, state } = await generatePKCE();
      const authUrl = buildAuthUrl(codeChallenge, state);
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate authentication');
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    clearStoredToken();
    setAccessToken(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    accessToken,
    connect,
    disconnect,
  };
}