"use client";

import { ComparisonPanel } from './ComparisonPanel';
import type { Finding } from '../../lib/types';

interface ComparisonViewProps {
  originalText: string;
  rewrittenText: string | undefined;
  findings: Finding[];
  onCopyRewrite: () => void;
  onExport: () => void;
  hasRewrite: boolean;
}

export function ComparisonView({
  originalText,
  rewrittenText,
  findings,
  onCopyRewrite,
  onExport,
  hasRewrite,
}: ComparisonViewProps) {
  return (
    <ComparisonPanel
      originalText={originalText}
      rewrittenText={rewrittenText}
      findings={findings}
      hasRewrite={hasRewrite}
      onCopyRewrite={onCopyRewrite}
      onExport={onExport}
    />
  );
}