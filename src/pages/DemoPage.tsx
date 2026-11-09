"use client";

import { DemoWorkspace } from "../components/demo/DemoWorkspace";
import { BaseLink } from "../routes";
import { ArrowRight } from "lucide-react";

export function DemoPage() {
  return (
    <>
      <header className="mb-12 sm:mb-16 text-center">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-4">
          See Voice Lens in Action
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          No connection required. This is a real analysis of the sample text below —
          click findings to explore evidence, see explanations, and explore suggested improvements.
        </p>
        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" aria-hidden="true" />
          Live Demo — No Setup Needed
        </div>
      </header>

      <DemoWorkspace />

      <section className="mt-16 sm:mt-24 text-center" aria-labelledby="demo-cta-heading">
        <h2 id="demo-cta-heading" className="sr-only">
          Ready to try with your own writing?
        </h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
          The demo uses a fixed sample. Try Voice Lens with your own writing —
          no account, no setup, completely local.
        </p>
        <BaseLink
          to="/write"
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Try with Your Writing
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </BaseLink>
      </section>
    </>
  );
}