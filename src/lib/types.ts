export interface Finding {
  id: string;
  category: 'repetition' | 'formulaic' | 'sentence' | 'transition' | 'vocabulary' | 'passive' | 'hedging';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  message?: string; // Alias for description, used by demo
  evidence: string[];
  suggestion?: string;
  rewrite?: string;
  startOffset?: number; // Character offset in original text (for highlighting)
  endOffset?: number;
}

// Convenience type for demo findings (subset with required fields)
export interface DemoFinding {
  id: string;
  category: 'repetition' | 'formulaic' | 'sentence' | 'transition' | 'vocabulary';
  severity: 'high' | 'medium' | 'low';
  message: string;
  evidence: string;
  suggestion: string;
  startOffset: number;
  endOffset: number;
}

export interface InterpretationResponse {
  explanation: string;
  rewrite: string;
  keyInsights: string[];
  confidence: number;
}

export interface AnalysisResult {
  findings: Finding[];
  summary: {
    totalFindings: number;
    readabilityScore: number;
    wordCount: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
    uniqueWordRatio: number;
  };
  suggestedRewrite?: string;
  interpretation?: InterpretationResponse;
}

export interface PollinationsMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PollinationsChatRequest {
  model: string;
  messages: PollinationsMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface PollinationsChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: PollinationsMessage;
    finish_reason: string;
  }[];
}

export interface BYOPState {
  isConnected: boolean;
  accessToken: string | null;
  error: string | null;
}

export interface AnalysisState {
  text: string;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  progress: number;
}