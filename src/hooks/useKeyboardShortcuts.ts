"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Ctrl+Enter in textarea
        if (
          target.tagName === 'TEXTAREA' &&
          (event.ctrlKey || event.metaKey) &&
          event.key === 'Enter'
        ) {
          // Let it through
        } else {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = (shortcut.ctrlKey ?? false) === (event.ctrlKey || event.metaKey);
        const shiftMatch = (shortcut.shiftKey ?? false) === event.shiftKey;
        const altMatch = (shortcut.altKey ?? false) === event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Convenience hook for common shortcuts
export function useGlobalShortcuts(actions: {
  onFocusModeToggle?: () => void;
  onAnalyze?: () => void;
  onEscape?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.onFocusModeToggle) {
    shortcuts.push({
      key: 'f',
      handler: actions.onFocusModeToggle,
      description: 'Toggle focus mode',
    });
  }

  if (actions.onAnalyze) {
    shortcuts.push({
      key: 'Enter',
      ctrlKey: true,
      handler: actions.onAnalyze,
      description: 'Analyze style',
    });
  }

  if (actions.onEscape) {
    shortcuts.push({
      key: 'Escape',
      handler: actions.onEscape,
      description: 'Close dialogs / exit focus mode',
    });
  }

  useKeyboardShortcuts(shortcuts);
}