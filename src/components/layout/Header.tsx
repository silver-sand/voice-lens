"use client";

import { useEffect, useState } from "react";
import { Menu, Sun, Moon, Monitor, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";
import { useFocusMode } from "../../providers/FocusModeProvider";

interface HeaderProps {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  isFocusMode?: boolean;
  onFocusModeToggle?: () => void;
}

export function Header({
  isConnected = false,
  onConnect,
  onDisconnect,
  isFocusMode = false,
  onFocusModeToggle,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, cycleTheme } = useTheme();
  const { isFocusMode: ctxFocusMode, toggleFocusMode: ctxToggleFocusMode } = useFocusMode();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50" aria-hidden="true">
        <div className="h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />
      </header>
    );
  }

  const themeIcons = {
    light: <Sun className="h-5 w-5" aria-hidden="true" />,
    dark: <Moon className="h-5 w-5" aria-hidden="true" />,
    system: <Monitor className="h-5 w-5" aria-hidden="true" />,
  };

  const effectiveFocusMode = isFocusMode !== undefined ? isFocusMode : ctxFocusMode;
  const effectiveFocusModeToggle = onFocusModeToggle || ctxToggleFocusMode;

  return (
    <header
      className={`
        h-16 border-b border-border/50 sticky top-0 z-50 transition-all duration-200
        ${isScrolled
          ? 'bg-background/80 backdrop-blur-sm shadow-subtle'
          : 'bg-transparent'
        }
        ${effectiveFocusMode ? 'h-10 border-b-0 bg-transparent shadow-none' : ''}
      `}
      role="banner"
    >
      <div className="h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo & Tagline */}
        <div className="flex items-center gap-3 min-w-0" aria-hidden={effectiveFocusMode}>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            Voice Lens
          </span>
          {!effectiveFocusMode && (
            <span className="hidden sm:inline-block text-sm text-muted-foreground font-normal">
              Style analysis for writers
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          {(onConnect || onDisconnect) && (
            <div className="flex items-center gap-2" aria-hidden={effectiveFocusMode}>
              <span
                className={`
                  px-2.5 py-1 text-xs font-medium rounded-full
                  ${isConnected
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted text-muted-foreground border border-border'
                  }
                `}
                aria-live="polite"
              >
                {isConnected ? 'Connected' : 'Not connected'}
              </span>
              {isConnected && onDisconnect ? (
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="px-3 py-1.5 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                  aria-label="Disconnect from Pollinations"
                >
                  Disconnect
                </button>
              ) : !isConnected && onConnect ? (
                <button
                  type="button"
                  onClick={onConnect}
                  className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  aria-label="Connect to Pollinations for AI interpretation"
                >
                  Connect Pollen
                </button>
              ) : null}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={cycleTheme}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={`Current theme: ${theme}. Click to cycle.`}
            aria-pressed={theme !== 'system'}
          >
            {themeIcons[theme]}
          </button>

          {/* Focus Mode Toggle */}
          <button
            type="button"
            onClick={effectiveFocusModeToggle}
            className={`
              p-2 rounded-md transition-colors
              ${effectiveFocusMode
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
            aria-label={effectiveFocusMode ? 'Exit focus mode (⌘⇧F)' : 'Enter focus mode (⌘⇧F)'}
            aria-pressed={effectiveFocusMode}
            title={effectiveFocusMode ? 'Exit focus mode (⌘⇧F)' : 'Enter focus mode (⌘⇧F)'}
          >
            {effectiveFocusMode ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right animate-fade-in">
                  <div className="rounded-xl border bg-surface p-2 shadow-elevated">
                    <button
                      type="button"
                      onClick={() => {
                        window.open('https://github.com/silver-sand/voice-lens', '_blank', 'noopener,noreferrer');
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      GitHub Repository
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.open('/voice-lens/about', '_self');
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      About & Privacy
                    </button>
                    <hr className="my-2 border-border" />
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      Voice Lens — Pollinations Quest #19180
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}