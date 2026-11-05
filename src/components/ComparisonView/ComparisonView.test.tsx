import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComparisonView } from './ComparisonView';
import type { Finding } from '../../lib/types';

const mockFindings: Finding[] = [
  {
    id: '1',
    category: 'repetition',
    severity: 'medium',
    title: 'Repeated phrase',
    description: 'Test',
    evidence: ['the quick brown'],
    suggestion: 'Vary',
  },
  {
    id: '2',
    category: 'formulaic',
    severity: 'high',
    title: 'Formulaic opener',
    description: 'Test',
    evidence: ["In today's world"],
    suggestion: 'Change',
  },
];

describe('ComparisonView', () => {
  const defaultProps = {
    originalText: 'Original text here.',
    rewrittenText: undefined,
    findings: mockFindings,
    onCopyRewrite: vi.fn(),
    onExport: vi.fn(),
    hasRewrite: false,
  };

  it('shows empty state when no rewrite available', () => {
    render(<ComparisonView {...defaultProps} />);
    expect(screen.getByText('No rewrite available')).toBeInTheDocument();
    expect(screen.getByText('Connect your Pollen account and run an analysis to generate a rewritten version.')).toBeInTheDocument();
  });

  it('shows legend in empty state', () => {
    render(<ComparisonView {...defaultProps} />);
    expect(screen.getByText('Repetition')).toBeInTheDocument();
    expect(screen.getByText('Formulaic')).toBeInTheDocument();
    expect(screen.getByText('Structure')).toBeInTheDocument();
    expect(screen.getByText('Transitions')).toBeInTheDocument();
    expect(screen.getByText('Vocabulary')).toBeInTheDocument();
  });

  it('renders side-by-side comparison when hasRewrite is true', () => {
    render(<ComparisonView {...defaultProps} rewrittenText="Rewritten text here." hasRewrite={true} />);

    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Rewritten')).toBeInTheDocument();
    expect(screen.getByText('Original text here.')).toBeInTheDocument();
    expect(screen.getByText('Rewritten text here.')).toBeInTheDocument();
  });

  it('shows word counts for both panels', () => {
    render(<ComparisonView {...defaultProps} rewrittenText="This is rewritten text." hasRewrite={true} />);

    expect(screen.getByText('3 words')).toBeInTheDocument(); // Original: "Original text here."
    expect(screen.getByText('4 words')).toBeInTheDocument(); // Rewritten: "This is rewritten text."
  });

  it('shows legend in comparison view', () => {
    render(<ComparisonView {...defaultProps} rewrittenText="Rewritten." hasRewrite={true} />);
    expect(screen.getByText('Repetition')).toBeInTheDocument();
    expect(screen.getByText('Formulaic')).toBeInTheDocument();
  });

  it('shows copy and export buttons', () => {
    render(<ComparisonView {...defaultProps} rewrittenText="Rewritten." hasRewrite={true} />);

    expect(screen.getByRole('button', { name: /copy rewrite/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('calls onCopyRewrite when copy button clicked', () => {
    render(<ComparisonView {...defaultProps} rewrittenText="Rewritten." hasRewrite={true} />);
    fireEvent.click(screen.getByRole('button', { name: /copy rewrite/i }));
    expect(defaultProps.onCopyRewrite).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when export button clicked', () => {
    render(<ComparisonView {...defaultProps} rewrittenText="Rewritten." hasRewrite={true} />);
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(defaultProps.onExport).toHaveBeenCalledTimes(1);
  });

  it('shows tip text', () => {
    render(<ComparisonView {...defaultProps} rewrittenText="Rewritten." hasRewrite={true} />);
    expect(screen.getByText('Tip: Review the rewrite and adapt it to your voice')).toBeInTheDocument();
  });

  it('highlights findings in original text', () => {
    render(<ComparisonView
      {...defaultProps}
      originalText="the quick brown fox jumps"
      rewrittenText="Rewritten."
      hasRewrite={true}
    />);

    // The original text panel should show the highlighted text
    expect(screen.getByText('the quick brown')).toBeInTheDocument();
  });

  it('does not highlight in rewritten text panel', () => {
    render(<ComparisonView
      {...defaultProps}
      originalText="the quick brown fox"
      rewrittenText="Rewritten text."
      hasRewrite={true}
    />);

    // The rewritten panel should show plain text
    const rewrittenPanel = screen.getByText('Rewritten text.').parentElement;
    // Should not have highlight classes
    expect(rewrittenPanel?.querySelector('.highlight-repetition')).not.toBeInTheDocument();
  });
});