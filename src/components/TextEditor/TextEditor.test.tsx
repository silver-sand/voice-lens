import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEditor } from './TextEditor';
import { FocusModeProvider } from '../../providers/FocusModeProvider';
import type { Finding } from '../../lib/types';

const mockFindings: Finding[] = [
  {
    id: '1',
    category: 'repetition',
    severity: 'medium',
    title: 'Repeated phrase',
    description: 'The phrase "the quick brown" appears multiple times',
    evidence: ['the quick brown'],
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
];

// Wrapper to provide FocusMode context
function renderWithProviders(ui: React.ReactElement) {
  return render(<FocusModeProvider>{ui}</FocusModeProvider>);
}

describe('TextEditor', () => {
  const defaultProps = {
    text: '',
    onChange: vi.fn(),
    onAnalyze: vi.fn(),
    isAnalyzing: false,
    findings: [],
    disabled: false,
    placeholder: 'Start writing...',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea with placeholder', () => {
    renderWithProviders(<TextEditor {...defaultProps} />);
    expect(screen.getByPlaceholderText('Start writing...')).toBeInTheDocument();
  });

  it('calls onChange when text is typed', () => {
    renderWithProviders(<TextEditor {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('Hello world');
  });

  it('displays current text value', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Existing text" />);
    expect(screen.getByDisplayValue('Existing text')).toBeInTheDocument();
  });

  it('shows analyze button', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" />);
    expect(screen.getByRole('button', { name: /analyze style/i })).toBeInTheDocument();
  });

  it('disables analyze button when text is empty', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="" />);
    expect(screen.getByRole('button', { name: /analyze style/i })).toBeDisabled();
  });

  it('disables analyze button when isAnalyzing is true', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" isAnalyzing={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });

  it('calls onAnalyze when analyze button is clicked', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" />);
    fireEvent.click(screen.getByRole('button', { name: /analyze style/i }));
    expect(defaultProps.onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isAnalyzing', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" isAnalyzing={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeInTheDocument();
  });

  it('shows finding count when findings exist', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" findings={mockFindings} />);
    expect(screen.getByText('2 findings detected')).toBeInTheDocument();
  });

  it('shows singular finding text', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" findings={[mockFindings[0]]} />);
    expect(screen.getByText('1 finding detected')).toBeInTheDocument();
  });

  it('shows keyboard shortcut hint', () => {
    renderWithProviders(<TextEditor {...defaultProps} />);
    expect(screen.getByText('Ctrl/Cmd + Enter')).toBeInTheDocument();
  });

  it('calls onAnalyze on Ctrl+Enter', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(defaultProps.onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('calls onAnalyze on Cmd+Enter (Mac)', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    expect(defaultProps.onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('does not call onAnalyze on Enter alone', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(defaultProps.onAnalyze).not.toHaveBeenCalled();
  });

  it('disables textarea when disabled prop is true', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" disabled={true} />);
    expect(screen.getByPlaceholderText('Start writing...')).toBeDisabled();
  });

  it('disables textarea when isAnalyzing', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="Some text" isAnalyzing={true} />);
    expect(screen.getByPlaceholderText('Start writing...')).toBeDisabled();
  });

  it('renders highlight overlay with findings', () => {
    renderWithProviders(<TextEditor {...defaultProps} text="the quick brown fox" findings={mockFindings} />);
    // The highlight overlay should contain the highlighted segments
    expect(screen.getByText('the quick brown')).toBeInTheDocument();
  });
});