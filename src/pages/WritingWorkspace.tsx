"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useReducedMotion } from "../hooks";
import { useFocusMode } from "../providers/FocusModeProvider";
import { useWordCount } from "../hooks/useWordCount";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { analyzeText } from "../lib/analysis/localAnalysis";
import { BaseLink } from "../routes";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Maximize,
  Minimize,
  Minimize2,
  Download,
  Copy,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Brain,
  CheckCircle,
} from "lucide-react";
import type { Finding, AnalysisResult } from "../lib/types";
import { cn } from "../lib/utils";

interface ToolbarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
  children: React.ReactNode;
  active?: boolean;
}

function ToolbarButton({ onClick, disabled, "aria-label": ariaLabel, children, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`
        p-2 rounded-lg transition-all duration-200 flex items-center justify-center
        ${active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"}
        ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}
      `}
    >
      {children}
    </button>
  );
}

interface FindingCardProps {
  finding: Finding;
  isSelected: boolean;
  onSelect: () => void;
  onAccept?: () => void;
  onDismiss?: () => void;
  showActions?: boolean;
}

function FindingCard({
  finding,
  isSelected,
  onSelect,
  onAccept,
  onDismiss,
  showActions = true,
}: FindingCardProps) {
  const severityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-accent/10 text-accent border-accent/20",
    low: "bg-primary/10 text-primary border-primary/20",
  };

  const categoryLabels = {
    formulaic: "Formulaic",
    transition: "Transition",
    repetition: "Repetition",
    sentence: "Sentence",
    vocabulary: "Vocabulary",
    passive: "Passive Voice",
    hedging: "Hedging",
  };

  return (
    <button
      type="button"
      className={`
        group relative p-3 sm:p-4 rounded-lg border transition-all duration-200 cursor-pointer w-full text-left
        ${severityColors[finding.severity]}
        ${isSelected ? "ring-2 ring-offset-2 ring-offset-surface ring-primary" : "hover:border-primary/30"}
      `}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center flex-col">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                finding.severity === "high"
                  ? "hsl(var(--destructive))"
                  : finding.severity === "medium"
                  ? "hsl(var(--accent))"
                  : "hsl(var(--primary))",
            }}
            aria-hidden="true"
          />
          <span className="text-[10px] font-medium text-foreground mt-0.5 uppercase tracking-wider">
            {finding.severity.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {categoryLabels[finding.category] || finding.category}
            </span>
            <span className="text-xs text-muted-foreground/70">•</span>
            <span className="text-xs font-medium capitalize text-foreground">
              {finding.severity}
            </span>
          </div>

          <p className="text-sm text-foreground mb-2">{finding.message || finding.description}</p>

          <div className="flex items-center gap-2 text-xs">
            <code className="bg-background/50 px-2 py-0.5 rounded font-mono text-primary/90 max-w-full truncate block">
              "{finding.evidence[0] || ""}"
            </code>
          </div>
        </div>
      </div>

      {showActions && finding.suggestion && (
        <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-2">
          {onAccept && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Accept suggestion"
            >
              Accept
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Dismiss suggestion"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </button>
  );
}

export function WritingWorkspace() {
  const reducedMotion = useReducedMotion();
  const { isFocusMode, toggleFocusMode } = useFocusMode();
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const findingsContainerRef = useRef<HTMLDivElement>(null);

  const { words, characters, sentences, readingTime } = useWordCount(text);

  // Debounced analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== lastAnalyzedText && text.trim().length > 0) {
        setIsAnalyzing(true);
        const result = analyzeText(text);
        setAnalysis(result);
        setLastAnalyzedText(text);
        setIsAnalyzing(false);
      } else if (text.trim().length === 0) {
        setAnalysis(null);
        setLastAnalyzedText("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [text]);

  // Handle finding selection - scroll to evidence in editor
  const handleFindingSelect = useCallback(
    (findingId: string | null) => {
      setSelectedFindingId(findingId);
      if (findingId && textareaRef.current && analysis) {
        const finding = analysis.findings.find((f) => f.id === findingId);
        if (finding && finding.startOffset !== undefined) {
          const beforeText = text.slice(0, finding.startOffset);
          const lines = beforeText.split("\n");
          const lineNumber = lines.length;
          const lineHeight = 28.8; // 1.8 * 16px
          const scrollTop = (lineNumber - 1) * lineHeight;
          textareaRef.current.scrollTop = scrollTop;

          // Pulse highlight via custom event
          textareaRef.current.dispatchEvent(
            new CustomEvent("highlight-finding", {
              detail: { findingId, startOffset: finding.startOffset, endOffset: finding.endOffset },
            })
          );
        }
      }
    },
    [analysis, text]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "b",
      ctrlKey: true,
      handler: () => document.execCommand("bold"),
      preventDefault: true,
      description: "Bold",
    },
    {
      key: "i",
      ctrlKey: true,
      handler: () => document.execCommand("italic"),
      preventDefault: true,
      description: "Italic",
    },
    {
      key: "x",
      ctrlKey: true,
      shiftKey: true,
      handler: () => document.execCommand("strikethrough"),
      preventDefault: true,
      description: "Strikethrough",
    },
    {
      key: "e",
      ctrlKey: true,
      handler: () => document.execCommand("code"),
      preventDefault: true,
      description: "Inline Code",
    },
    {
      key: "l",
      ctrlKey: true,
      shiftKey: true,
      handler: () => document.execCommand("insertUnorderedList"),
      preventDefault: true,
      description: "Bullet List",
    },
    {
      key: "o",
      ctrlKey: true,
      shiftKey: true,
      handler: () => document.execCommand("insertOrderedList"),
      preventDefault: true,
      description: "Numbered List",
    },
    {
      key: "q",
      ctrlKey: true,
      shiftKey: true,
      handler: () => document.execCommand("formatBlock", false, "blockquote"),
      preventDefault: true,
      description: "Quote",
    },
    {
      key: "f",
      ctrlKey: true,
      shiftKey: true,
      handler: () => toggleFocusMode(),
      preventDefault: true,
      description: "Toggle Focus Mode",
    },
    {
      key: "Escape",
      handler: () => handleFindingSelect(null),
      description: "Clear Selection",
    },
  ]);

  // Format document
  const formatDocument = (command: string) => {
    document.execCommand(command);
    textareaRef.current?.focus();
  };

  // Export as markdown
  const exportMarkdown = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voice-lens-draft.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
  };

  // Clear editor
  const clearEditor = () => {
    if (confirm("Clear all text? This cannot be undone.")) {
      setText("");
      setAnalysis(null);
      setLastAnalyzedText("");
      setSelectedFindingId(null);
    }
  };

  const findings = analysis?.findings || [];
  const groupedFindings = [
    "formulaic",
    "transition",
    "repetition",
    "sentence",
    "vocabulary",
    "passive",
    "hedging",
  ]
    .map((category) => ({
      category,
      findings: findings.filter((f) => f.category === category),
    }))
    .filter((g) => g.findings.length > 0);

  const severityCounts = {
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };

  return (
    <div className={`
      min-h-screen bg-background
      ${isFocusMode ? "focus-mode" : ""}
    `}>
      {/* Header / Toolbar */}
      <header
        className={`
          sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border
          transition-all duration-300
          ${isFocusMode ? "opacity-0 pointer-events-none h-0 overflow-hidden" : ""}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <BaseLink to="/" className="flex items-center gap-2" aria-label="Voice Lens Home">
                <Brain className="h-6 w-6 text-primary" aria-hidden="true" />
                <span className="font-display text-xl font-semibold text-foreground hidden sm:block">
                  Voice Lens
                </span>
              </BaseLink>
              <span className="hidden sm:inline text-muted-foreground/50">/</span>
              <h1 className="font-display text-lg font-medium text-foreground hidden sm:block">
                Writing Workspace
              </h1>
            </div>

            {/* Center: Formatting Toolbar */}
            <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto px-4 pb-1">
              <div className="flex items-center gap-1 bg-surface-elevated/50 border border-border rounded-lg p-1">
                <ToolbarButton
                  onClick={() => formatDocument("bold")}
                  aria-label="Bold (⌘B)"
                  active={document.queryCommandState("bold")}
                >
                  <Bold className="h-4 w-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => formatDocument("italic")}
                  aria-label="Italic (⌘I)"
                  active={document.queryCommandState("italic")}
                >
                  <Italic className="h-4 w-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => formatDocument("strikethrough")}
                  aria-label="Strikethrough (⌘⇧X)"
                  active={document.queryCommandState("strikethrough")}
                >
                  <Strikethrough className="h-4 w-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => formatDocument("code")}
                  aria-label="Inline Code (⌘E)"
                  active={document.queryCommandState("code")}
                >
                  <Code className="h-4 w-4" aria-hidden="true" />
                </ToolbarButton>
                <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />
                <ToolbarButton
                  onClick={() => formatDocument("insertUnorderedList")}
                  aria-label="Bullet List (⌘⇧L)"
                  active={document.queryCommandState("insertUnorderedList")}
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => formatDocument("insertOrderedList")}
                  aria-label="Numbered List (⌘⇧O)"
                  active={document.queryCommandState("insertOrderedList")}
                >
                  <ListOrdered className="h-4 w-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => formatDocument("formatBlock")}
                  aria-label="Quote (⌘⇧Q)"
                  active={document.queryCommandState("formatBlock")}
                >
                  <Quote className="h-4 w-4" aria-hidden="true" />
                </ToolbarButton>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1 bg-surface-elevated/50 border border-border rounded-lg p-1">
                <button
                  type="button"
                  onClick={exportMarkdown}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Export as Markdown"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Copy to Clipboard"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={clearEditor}
                  className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Clear Editor"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={toggleFocusMode}
                className="p-2 rounded-lg bg-surface-elevated/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode (⌘⇧F)"}
                aria-pressed={isFocusMode}
              >
                {isFocusMode ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed-position Exit Focus Mode button - visible only in focus mode, outside collapsing header */}
      {isFocusMode && (
        <button
          type="button"
          onClick={toggleFocusMode}
          className="fixed top-4 right-4 z-50 p-3 rounded-lg bg-surface-elevated/95 backdrop-blur-sm border border-border shadow-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          aria-label="Exit Focus Mode"
          aria-pressed={true}
          data-testid="exit-focus-mode-btn"
        >
          <Minimize2 className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Editor Panel */}
          <div className="lg:col-span-1">
            <div
              className="bg-surface border border-border rounded-xl overflow-hidden h-[600px] sm:h-[700px] flex flex-col"
              data-testid="writing-editor-container"
            >
              <div className="px-4 py-3 border-b border-border bg-surface-elevated/50 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Editor</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span>{words} words</span>
                  <span>{characters} chars</span>
                  <span>{sentences} sentences</span>
                  <span>~{readingTime} min read</span>
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {/* Highlight Overlay Layer */}
                <div
                  className="absolute inset-0 p-4 pointer-events-none font-mono leading-relaxed whitespace-pre-wrap overflow-hidden"
                  style={{ fontSize: "1rem", lineHeight: "1.8", fontFamily: "var(--font-mono)" }}
                  aria-hidden="true"
                >
                  {(() => {
                    if (!findings.length) return <span>{text || " "}</span>;

                    const sortedFindings = [...findings].sort((a, b) => {
                      const aStart = a.startOffset ?? 0;
                      const bStart = b.startOffset ?? 0;
                      return aStart - bStart;
                    });
                    const segments: Array<{
                      text: string;
                      category?: Finding["category"];
                      findingId?: string;
                    }> = [];
                    let lastEnd = 0;

                    for (const finding of sortedFindings) {
                      const startOffset = finding.startOffset ?? 0;
                      const endOffset = finding.endOffset ?? 0;
                      if (startOffset > lastEnd) {
                        segments.push({ text: text.slice(lastEnd, startOffset) });
                      }
                      segments.push({
                        text: finding.evidence[0] || "",
                        category: finding.category,
                        findingId: finding.id,
                      });
                      lastEnd = endOffset;
                    }

                    if (lastEnd < text.length) {
                      segments.push({ text: text.slice(lastEnd) });
                    }

                    return segments.map((segment, index) => {
                      const isSelected = selectedFindingId === segment.findingId;
                      const highlightClass = segment.category ? getHighlightClass(segment.category) : "";
                      const isAnimated = !reducedMotion && segment.category;

                      return (
                        <span
                          key={index}
                          className={`
                            ${highlightClass}
                            ${isSelected && !reducedMotion ? "animate-pulse-highlight" : ""}
                            ${isAnimated && !reducedMotion ? "animate-fade-in" : ""}
                            transition-all duration-500
                          `}
                          style={{
                            animationDelay: !reducedMotion && segment.category ? `${index * 80}ms` : "0ms",
                            opacity: isAnimated && !reducedMotion ? 1 : 0,
                            transform: isAnimated && !reducedMotion ? "translateY(0)" : "translateY(4px)",
                          }}
                        >
                          {segment.text || " "}
                        </span>
                      );
                    });
                  })()}
                </div>

                {/* Actual Textarea */}
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="absolute inset-0 p-4 font-mono leading-relaxed whitespace-pre-wrap bg-transparent text-foreground caret-primary selection:bg-primary/20 resize-none border-none outline-none w-full h-full"
                  style={{ fontSize: "1rem", lineHeight: "1.8", fontFamily: "var(--font-mono)" }}
                  placeholder="Start writing... Analysis appears instantly as you type."
                  aria-label="Writing editor"
                  spellCheck={true}
                  tabIndex={0}
                />
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-1">
            {showAnalysis && (
              <div
                className={cn(
                  "sticky top-20 space-y-6",
                  !reducedMotion && "animate-fade-in"
                )}
                style={{ animationDuration: "300ms" }}
              >
                  {/* Summary Bar */}
                  <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                        Analysis
                        {isAnalyzing && (
                          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label="Analyzing..." />
                        )}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowAnalysis(false)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Hide analysis panel"
                      >
                        <ChevronDown className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-surface-elevated rounded-lg">
                        <p className="font-display text-2xl font-semibold text-foreground">{findings.length}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Findings</p>
                      </div>
                      <div className="p-3 bg-surface-elevated rounded-lg">
                        <p className="font-display text-2xl font-semibold text-destructive">{severityCounts.high}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">High</p>
                      </div>
                      <div className="p-3 bg-surface-elevated rounded-lg">
                        <p className="font-display text-2xl font-semibold text-accent">{severityCounts.medium}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Medium</p>
                      </div>
                      <div className="p-3 bg-surface-elevated rounded-lg">
                        <p className="font-display text-2xl font-semibold text-primary">{severityCounts.low}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Low</p>
                      </div>
                    </div>
                  </div>

                  {/* ARIA Live Region for Analysis Results */}
                  <div
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {analysis && findings.length > 0
                      ? `Analysis complete. ${findings.length} finding${findings.length !== 1 ? 's' : ''} detected. ${severityCounts.high} high, ${severityCounts.medium} medium, ${severityCounts.low} low severity.`
                      : analysis && findings.length === 0 && text.trim().length > 0
                        ? "Analysis complete. No patterns detected. Your writing is clean!"
                        : isAnalyzing
                          ? "Analyzing your writing..."
                          : ""}
                  </div>

                  {/* Findings Groups */}
                  <div
                    className="bg-surface border border-border rounded-xl overflow-hidden"
                    data-testid="writing-findings-panel"
                  >
                    <div className="p-4 sm:p-5 border-b border-border">
                      <h3 className="font-display text-lg font-semibold text-foreground">Findings</h3>
                    </div>

                    {groupedFindings.length > 0 ? (
                      <div ref={findingsContainerRef} className="p-4 sm:p-5 space-y-4 max-h-[500px] overflow-y-auto">
                        {groupedFindings.map(({ category, findings: categoryFindings }) => (
                          <div key={category} className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    category === "formulaic"
                                      ? "hsl(var(--destructive))"
                                      : category === "transition"
                                      ? "hsl(270 50% 50%)"
                                      : category === "repetition"
                                      ? "hsl(var(--accent))"
                                      : category === "sentence"
                                      ? "hsl(var(--primary))"
                                      : category === "vocabulary"
                                      ? "hsl(160 60% 45%)"
                                      : category === "passive"
                                      ? "hsl(45 90% 50%)"
                                      : "hsl(200 60% 50%)",
                                }}
                                aria-hidden="true"
                              />
                              {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryFindings.length})
                            </h4>
                            {categoryFindings.map((finding) => (
                              <FindingCard
                                key={finding.id}
                                finding={finding}
                                isSelected={selectedFindingId === finding.id}
                                onSelect={() => handleFindingSelect(finding.id)}
                                onAccept={() => {
                                  // Apply suggestion - replace the evidence text with suggestion
                                  if (finding.startOffset !== undefined && finding.endOffset !== undefined) {
                                    const beforeText = text.slice(0, finding.startOffset);
                                    const afterText = text.slice(finding.endOffset);
                                    setText(beforeText + finding.suggestion + afterText);
                                    handleFindingSelect(null);
                                  }
                                }}
                                onDismiss={() => {
                                  handleFindingSelect(null);
                                }}
                                showActions={!!finding.suggestion}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 sm:p-12 text-center">
                        <CheckCircle className="h-12 w-12 text-primary/50 mx-auto mb-4" aria-hidden="true" />
                        <p className="text-muted-foreground">
                          {text.trim().length === 0
                            ? "Start writing to see analysis"
                            : "No patterns detected — your writing is clean!"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Interpretation Placeholder */}
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
                      AI Interpretation
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                      Connect Pollinations to get AI-powered explanations, key insights, and suggested rewrites
                      with confidence scores.
                    </p>
                    <BaseLink
                      to="/settings"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Connect Pollinations
                    </BaseLink>
                  </div>
                </div>
              )}

              {!showAnalysis && (
                <button
                  onClick={() => setShowAnalysis(true)}
                  className={cn(
                    "sticky top-20 w-full max-w-sm mx-auto p-3 bg-surface border border-border rounded-xl text-left hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    !reducedMotion && "animate-fade-in"
                  )}
                  aria-label="Show analysis panel"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">Show Analysis</p>
                      <p className="text-xs text-muted-foreground">
                        {findings.length} finding{findings.length !== 1 ? "s" : ""} waiting
                      </p>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground ml-auto" aria-hidden="true" />
                  </div>
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto text-center p-8">
            <p className="text-muted-foreground/50 text-sm">
              Focus Mode — Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">⌘⇧F</kbd> to exit
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getHighlightClass(category: Finding["category"]): string {
  switch (category) {
    case "formulaic":
      return "highlight-formulaic";
    case "transition":
      return "highlight-transition";
    case "repetition":
      return "highlight-repetition";
    case "sentence":
      return "highlight-sentence";
    case "vocabulary":
      return "highlight-vocabulary";
    case "passive":
      return "highlight-passive";
    case "hedging":
      return "highlight-hedging";
    default:
      return "";
  }
}