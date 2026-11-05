import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalysisPanel } from './AnalysisPanel';
import type { Finding, InterpretationResponse } from '../../lib/types';

const mockFindings: Finding[] = [
  {
    id: '1',
    category: 'repetition',
    severity: 'medium',
    title: 'Repeated phrase',
    description: 'The phrase "the quick brown" appears multiple times',
    evidence: ['the quick brown fox', 'the quick brown dog'],
    suggestion: 'Vary your phrasing',
  },
  {
    id: '2',
    category: 'formulaic',
    severity: 'high',
    title: 'Formulaic opener',
    description: 'Uses "In today\'s world" which is a common LLM pattern',
    evidence: ["In today's world"],
    suggestion: 'Open with a specific observation',
  },
  {
    id: '3',
    category: 'sentence',
    severity: 'low',
    title: 'Uniform sentence length',
    description: 'Sentences have very similar word counts',
    evidence: ['Sentence one.', 'Sentence two.', 'Sentence three.'],
  },
];

const mockInterpretation: InterpretationResponse = {
  explanation: 'Your writing shows several patterns typical of LLM-generated text, including formulaic openers and repetitive phrasing.',
  keyInsights: [
    'Consider varying your sentence openings',
    'Replace formulaic transitions with more natural connectors',
  ],
  rewrite: 'A more natural version of your text would avoid these patterns.',
  confidence: 0.85,
};

describe('AnalysisPanel', () => {
  it('renders empty state when no findings, interpretation, or analyzing', () => {
    render(<AnalysisPanel findings={[]} isAnalyzing={false} />);
    expect(screen.getByText('No analysis yet')).toBeInTheDocument();
    expect(screen.getByText('Write some text and click "Analyze Style" to see findings here.')).toBeInTheDocument();
  });

  it('shows analyzing spinner when isAnalyzing is true', () => {
    render(<AnalysisPanel findings={[]} isAnalyzing={true} />);
    expect(screen.getByText('Analyzing with Pollinations...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // the spinner
  });

  it('renders findings with correct severity badges', () => {
    render(<AnalysisPanel findings={mockFindings} isAnalyzing={false} />);

    // Check all findings are rendered
    expect(screen.getByText('Repeated phrase')).toBeInTheDocument();
    expect(screen.getByText('Formulaic opener')).toBeInTheDocument();
    expect(screen.getByText('Uniform sentence length')).toBeInTheDocument();

    // Check severity badges
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();

    // Check category labels
    expect(screen.getByText('repetition')).toBeInTheDocument();
    expect(screen.getByText('formulaic')).toBeInTheDocument();
    expect(screen.getByText('sentence')).toBeInTheDocument();
  });

  it('shows evidence snippets for findings', () => {
    render(<AnalysisPanel findings={mockFindings} isAnalyzing={false} />);
    expect(screen.getByText('the quick brown fox')).toBeInTheDocument();
    expect(screen.getByText('the quick brown dog')).toBeInTheDocument();
    expect(screen.getByText("In today's world")).toBeInTheDocument();
  });

  it('shows suggestion when available', () => {
    render(<AnalysisPanel findings={mockFindings} isAnalyzing={false} />);
    expect(screen.getByText('Vary your phrasing')).toBeInTheDocument();
    expect(screen.getByText('Open with a specific observation')).toBeInTheDocument();
  });

  it('shows "+N more occurrences" when evidence exceeds 3', () => {
    const findingsWithManyEvidence: Finding[] = [
      {
        id: '1',
        category: 'repetition',
        severity: 'medium',
        title: 'Repeated phrase',
        description: 'Test',
        evidence: ['one', 'two', 'three', 'four', 'five'],
        suggestion: 'Vary',
      },
    ];

    render(<AnalysisPanel findings={findingsWithManyEvidence} isAnalyzing={false} />);
    expect(screen.getByText('+2 more occurrences')).toBeInTheDocument();
  });

  it('renders AI interpretation card when interpretation exists', () => {
    render(<AnalysisPanel findings={mockFindings} interpretation={mockInterpretation} isAnalyzing={false} />);

    expect(screen.getByText('AI Interpretation')).toBeInTheDocument();
    expect(screen.getByText('Your writing shows several patterns typical of LLM-generated text, including formulaic openers and repetitive phrasing.')).toBeInTheDocument();
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText('Consider varying your sentence openings')).toBeInTheDocument();
    expect(screen.getByText('Replace formulaic transitions with more natural connectors')).toBeInTheDocument();
  });

  it('shows "No analysis yet" initially when no findings, interpretation, or analyzing', () => {
    render(<AnalysisPanel findings={[]} isAnalyzing={false} />);
    expect(screen.getByText('No analysis yet')).toBeInTheDocument();
    expect(screen.getByText('Write some text and click "Analyze Style" to see findings here.')).toBeInTheDocument();
  });

  it('shows "No style issues detected" when analysis completed with empty findings', () => {
    // When interpretation exists but no findings, it shows "No style issues detected"
    render(<AnalysisPanel findings={[]} interpretation={{ explanation: '', keyInsights: [], rewrite: '', confidence: 0 }} isAnalyzing={false} />);
    expect(screen.getByTestId('no-issues-state')).toBeInTheDocument();
    expect(screen.getByText('No style issues detected')).toBeInTheDocument();
    expect(screen.getByText('Your writing looks clean and varied.')).toBeInTheDocument();
  });

  it('renders severity-specific styling classes', () => {
    const { container } = render(<AnalysisPanel findings={mockFindings} isAnalyzing={false} />);

    // High severity should have red border
    const highCard = container.querySelector('[class*="border-l-red-500"]');
    expect(highCard).toBeInTheDocument();

    // Medium severity should have yellow border
    const mediumCard = container.querySelector('[class*="border-l-yellow-500"]');
    expect(mediumCard).toBeInTheDocument();

    // Low severity should have blue border
    const lowCard = container.querySelector('[class*="border-l-blue-500"]');
    expect(lowCard).toBeInTheDocument();
  });

  it('shows interpretation without key insights when empty', () => {
    const interpretationNoInsights: InterpretationResponse = {
      explanation: 'Simple analysis.',
      keyInsights: [],
      rewrite: '',
      confidence: 0.5,
    };

    render(<AnalysisPanel findings={[]} interpretation={interpretationNoInsights} isAnalyzing={false} />);
    expect(screen.getByText('AI Interpretation')).toBeInTheDocument();
    expect(screen.getByText('Simple analysis.')).toBeInTheDocument();
    expect(screen.queryByText('Key Insights')).not.toBeInTheDocument();
  });
});