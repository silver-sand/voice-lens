"use client";

import { BaseLink } from "../routes";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Hero } from "../components/landing/Hero";
import { TrustIndicators } from "../components/landing/TrustIndicators";

export function LandingPage() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <section className="py-16 sm:py-24" aria-labelledby="cta-heading">
        <div className="text-center">
          <h2 id="cta-heading" className="sr-only">
            Ready to start?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            No account required. No setup. Just start writing and see what Voice Lens reveals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <BaseLink
              to="/write"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Start Writing
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </BaseLink>
            <BaseLink
              to="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-surface-elevated text-foreground border border-border rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Explore Example
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </BaseLink>
          </div>
        </div>
      </section>
    </>
  );
}