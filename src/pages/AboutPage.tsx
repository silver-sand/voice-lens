"use client";

import { BaseLink } from "../routes";
import {
  Shield,
  Zap,
  Code2,
  Brain,
  Users,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Local-First Analysis",
    description:
      "Seven deterministic analyzers run entirely in your browser. No text leaves your device unless you explicitly connect an AI provider.",
    highlight: "Zero server round-trips",
  },
  {
    icon: Shield,
    title: "Privacy by Default",
    description:
      "Your writing stays on your device. OAuth connections to Pollinations are optional, explicit, and revocable at any time.",
    highlight: "No accounts required",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Sub-millisecond analysis as you type. Formulaic phrases, weak transitions, repetition, sentence variety, and vocabulary gaps highlighted in real time.",
    highlight: "No loading states",
  },
  {
    icon: Code2,
    title: "Transparent AI",
    description:
      "When you connect Pollinations, every AI suggestion shows its reasoning, confidence score, and the exact evidence it references. Accept, reject, or undo in one click.",
    highlight: "Explainable suggestions",
  },
  {
    icon: Users,
    title: "Built for Writers",
    description:
      "Designed with editorial workflows in mind — focus mode, reading-time estimates, word-count targets, keyboard shortcuts, and a distraction-free canvas.",
    highlight: "Editorial tooling",
  },
  {
    icon: Globe,
    title: "Open Source",
    description:
      "MIT licensed. Self-hostable. Extensible analyzer architecture. Built with React 19, TypeScript, Tailwind v4, and motion.dev.",
    highlight: "Community-driven",
  },
];

const principles = [
  {
    title: "Writing is thinking",
    description:
      "The tool should clarify your thoughts, not replace them. Every feature serves the writer's agency.",
  },
  {
    title: "Local-first is a right",
    description:
      "Your words belong to you. Analysis happens on your device. Cloud features are opt-in, transparent, and revocable.",
  },
  {
    title: "Speed enables flow",
    description:
      "Feedback must arrive before the thought completes. Sub-16ms frame budgets, instant interactions, zero perceived latency.",
  },
  {
    title: "Honesty over magic",
    description:
      "AI suggestions show their work — reasoning, evidence, confidence. You decide what to accept. No black boxes.",
  },
];

export function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Hero */}
      <header className="text-center mb-20 sm:mb-28">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
          Why Voice Lens?
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Most writing tools either correct grammar or generate text. Voice Lens does neither — it
          reveals the patterns in your writing so you can make intentional choices about voice,
          clarity, and rhythm.
        </p>
      </header>

      {/* Core Principles */}
      <section className="mb-24" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="sr-only">
          Core Principles
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, _i) => (
            <article
              key={principle.title}
              className="group p-6 bg-surface border border-border rounded-xl hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {principle.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-24" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="space-y-6">
          {features.map((feature, _i) => (
            <article
              key={feature.title}
              className="flex gap-6 p-6 bg-surface border border-border rounded-xl group hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0 self-center" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-24" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" className="sr-only">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-display text-2xl font-bold">
              1
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Write or Paste
            </h3>
            <p className="text-sm text-muted-foreground">
              Start with a blank page or paste existing text. No account, no setup.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-display text-2xl font-bold">
              2
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              See Patterns Instantly
            </h3>
            <p className="text-sm text-muted-foreground">
              Seven local analyzers highlight formulaic phrases, weak transitions, repetition,
              sentence monotony, and vocabulary gaps in real time.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-display text-2xl font-bold">
              3
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Refine with Intent
            </h3>
            <p className="text-sm text-muted-foreground">
              Click findings to locate evidence. Optionally connect Pollinations for AI
              interpretations with reasoning, confidence, and one-click rewrites.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="mb-16" aria-labelledby="tech-heading">
        <h2 id="tech-heading" className="font-display text-2xl sm:text-3xl font-semibold text-center text-foreground mb-10">
          Technical Foundation
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface border border-border rounded-xl">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Stack
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>React 19 + TypeScript</li>
              <li>Vite 6 (build)</li>
              <li>Tailwind CSS v4 (styling)</li>
              <li>CSS animations (no JS animation library)</li>
              <li>wouter (routing, 1.5kb)</li>
              <li>Vitest + Playwright (testing)</li>
            </ul>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Local Analyzers
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Formulaic phrase detection</li>
              <li>Transition weakness scoring</li>
              <li>Repetition proximity analysis</li>
              <li>Sentence variety (length/structure)</li>
              <li>Vocabulary diversity (TTR, rare words)</li>
              <li>Passive voice detection</li>
              <li>Hedging language identification</li>
            </ul>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Optional AI (Pollinations)
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>OAuth 2.0 PKCE (S256)</li>
              <li>Interpretation + confidence</li>
              <li>Key insights extraction</li>
              <li>Suggested rewrite with undo</li>
              <li>Token stored in sessionStorage</li>
              <li>Revocable anytime</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="sr-only">
          Get Started
        </h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
          Ready to see your writing patterns? Try the live demo — no setup, no account,
          completely local.
        </p>
        <BaseLink
          to="/demo"
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Try the Demo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </BaseLink>
      </section>
    </div>
  );
}