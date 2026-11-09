"use client";

import { Shield, Zap, Eye, Database } from "lucide-react";

const indicators = [
  {
    icon: Shield,
    title: 'Local-First',
    description: 'All analysis runs in your browser. Your text never leaves your device unless you connect Pollen.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Deterministic local analysis completes in milliseconds. No waiting for API responses.',
  },
  {
    icon: Eye,
    title: 'Optional AI',
    description: 'Connect Pollinations for AI interpretation and rewrites. Fully optional — works great without it.',
  },
  {
    icon: Database,
    title: 'No Account Needed',
    description: 'Start writing immediately. No sign-up, no tracking, no data collection.',
  },
] as const;

export function TrustIndicators() {
  return (
    <section
      className="py-16 sm:py-20 bg-surface-elevated/50"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="trust-heading" className="sr-only">
          Why Voice Lens
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((item, index) => (
            <article
              key={item.title}
              className="group p-6 bg-surface border border-border rounded-xl transition-all duration-300 hover:border-primary/30 hover:shadow-soft"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}