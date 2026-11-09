import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t border-border/50 bg-background/50 backdrop-blur-sm"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="text-center sm:text-left">
            Voice Lens — Local-first style analysis for writers
          </p>
          <nav className="flex items-center gap-4" aria-label="Footer navigation">
            <a
              href="/voice-lens/about"
              className="hover:text-foreground transition-colors"
            >
              About & Privacy
            </a>
            <a
              href="https://github.com/silver-sand/voice-lens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              GitHub
            </a>
            <a
              href="https://pollinations.ai/quest/19180"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Pollinations Quest #19180
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}