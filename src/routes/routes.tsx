import { Switch, Route, Link } from "wouter";
import { useMemo } from "react";
import { PageLayout } from "../components/layout";
import { LandingPage } from "../pages/LandingPage";
import { DemoPage } from "../pages/DemoPage";
import { WritingWorkspace } from "../pages/WritingWorkspace";
import { AboutPage } from "../pages/AboutPage";

// Base path for GitHub Pages
const BASE_PATH = '/voice-lens';

/**
 * Wrapper to handle base path for GitHub Pages
 * All internal links should use the prefixed paths
 */
export function useBasePath() {
  return BASE_PATH;
}

/**
 * Create a properly prefixed path
 */
export function createPath(path: string): string {
  if (path === '/') return BASE_PATH + '/';
  return BASE_PATH + path;
}

/**
 * Route definitions with base path handling
 */
export function Routes() {
  return (
    <Switch>
      <Route path={createPath('/')}>
        <PageLayout>
          <LandingPage />
        </PageLayout>
      </Route>
      <Route path={createPath('/demo')}>
        <PageLayout>
          <DemoPage />
        </PageLayout>
      </Route>
      <Route path={createPath('/write')}>
        <PageLayout showHeader={false}>
          <WritingWorkspace />
        </PageLayout>
      </Route>
      <Route path={createPath('/about')}>
        <PageLayout>
          <AboutPage />
        </PageLayout>
      </Route>
      {/* Fallback - redirect to landing */}
      <Route path="*">
        <PageLayout>
          <LandingPage />
        </PageLayout>
      </Route>
    </Switch>
  );
}

/**
 * Link component that automatically handles base path
 */
export function BaseLink({
  to,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'a'> & { to: string }) {
  const href = useMemo(() => createPath(to), [to]);
  return <Link href={href} {...props}>{children}</Link>;
}