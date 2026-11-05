import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEditor } from './TextEditor';
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
    render(<TextEditor {...defaultProps} />);
    expect(screen.getByPlaceholderText('Start writing...')).toBeInTheDocument();
  });

  it('calls onChange when text is typed', () => {
    render(<TextEditor {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('Hello world');
  });

  it('displays current text value', () => {
    render(<TextEditor {...defaultProps} text="Existing text" />);
    expect(screen.getByDisplayValue('Existing text')).toBeInTheDocument();
  });

  it('shows analyze button', () => {
    render(<TextEditor {...defaultProps} text="Some text" />);
    expect(screen.getByRole('button', { name: /analyze style/i })).toBeInTheDocument();
  });

  it('disables analyze button when text is empty', () => {
    render(<TextEditor {...defaultProps} text="" />);
    expect(screen.getByRole('button', { name: /analyze style/i })).toBeDisabled();
  });

  it('disables analyze button when isAnalyzing is true', () => {
    render(<TextEditor {...defaultProps} text="Some text" isAnalyzing={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });

  it('calls onAnalyze when analyze button is clicked', () => {
    render(<TextEditor {...defaultProps} text="Some text" />);
    fireEvent.click(screen.getByRole('button', { name: /analyze style/i }));
    expect(defaultProps.onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isAnalyzing', () => {
    render(<TextEditor {...defaultProps} text="Some text" isAnalyzing={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeInTheDocument();
  });

  it('shows finding count when findings exist', () => {
    render(<TextEditor {...defaultProps} text="Some text" findings={mockFindings} />);
    expect(screen.getByText('2 findings detected')).toBeInTheDocument();
  });

  it('shows singular finding text', () => {
    render(<TextEditor {...defaultProps} text="Some text" findings={[mockFindings[0]]} />);
    expect(screen.getByText('1 finding detected')).toBeInTheDocument();
  });

  it('shows keyboard shortcut hint', () => {
    render(<TextEditor {...defaultProps} />);
    expect(screen.getByText('Ctrl/Cmd + Enter')).toBeInTheDocument();
  });

  it('calls onAnalyze on Ctrl+Enter', () => {
    render(<TextEditor {...defaultProps} text="Some text" />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(defaultProps.onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('calls onAnalyze on Cmd+Enter (Mac)', () => {
    render(<TextEditor {...defaultProps} text="Some text" />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    expect(defaultProps.onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('does not call onAnalyze on Enter alone', () => {
    render(<TextEditor {...defaultProps} text="Some text" />);
    const textarea = screen.getByPlaceholderText('Start writing...');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(defaultProps.onAnalyze).not.toHaveBeenCalled();
  });

  it('disables textarea when disabled prop is true', () => {
    render(<TextEditor {...defaultProps} text="Some text" disabled={true} />);
    expect(screen.getByPlaceholderText('Start writing...')).toBeDisabled();
  });

  it('disables textarea when isAnalyzing', () => {
    render(<TextEditor {...defaultProps} text="Some text" isAnalyzing={true} />);
    expect(screen.getByPlaceholderText('Start writing...')).toBeDisabled();
  });

  it('renders highlight overlay with findings', () => {
    render(<TextEditor {...defaultProps} text="the quick brown fox" findings={mockFindings} />);
    // The highlight overlay should contain the highlighted segments
    expect(screen.getByText('the quick brown')).toBeInTheDocument();
  });
});