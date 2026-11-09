"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface FocusModeContextValue {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  setIsFocusMode: (value: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('voice-lens:focus-mode');
    if (stored !== null) {
      setIsFocusMode(stored === 'true');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('voice-lens:focus-mode', String(isFocusMode));
  }, [isFocusMode, mounted]);

  const toggleFocusMode = () => setIsFocusMode((prev) => !prev);

  const value: FocusModeContextValue = {
    isFocusMode,
    toggleFocusMode,
    setIsFocusMode,
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}