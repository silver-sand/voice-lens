import type { PollinationsChatRequest, PollinationsChatResponse, Finding } from '../../lib/types';

const POLLINATIONS_API_URL = 'https://gen.pollinations.ai/v1/chat/completions';
const DEFAULT_MODEL = 'openai';

interface InterpretationRequest {
  text: string;
  findings: Finding[];
}

interface InterpretationResponse {
  explanation: string;
  rewrite: string;
  keyInsights: string[];
  confidence: number;
}

function getAccessToken(): string | null {
  return sessionStorage.getItem('pollinationsAccessToken');
}

function buildInterpretationPrompt(request: InterpretationRequest): string {
  const { text, findings } = request;
  const findingsSummary = findings.map(f =>
    `- ${f.title} (${f.category}, ${f.severity}): ${f.description} Evidence: ${f.evidence.join('; ')}`
  ).join('\n');

  return `You are an expert writing coach analyzing a piece of text for stylistic patterns commonly associated with LLM-generated prose.

IMPORTANT: You are NOT detecting whether this text was written by AI. You are analyzing writing style characteristics that happen to be common in LLM outputs but can also appear in human writing.

Here is the user's text:
---
${text}
---

Here are the objectively measurable style findings from deterministic analysis:
${findingsSummary}

Your task:
1. Explain the stylistic significance of these patterns in 2-3 sentences.
2. Provide a rewritten version that addresses these patterns while preserving the original meaning, tone, and voice.
3. List 3 key insights about the writing style.

Return ONLY valid JSON in this exact format:
{
  "explanation": "string",
  "rewrite": "string",
  "keyInsights": ["string", "string", "string"],
  "confidence": 0.85
}

The rewrite should:
- Keep the same meaning and intent
- Preserve the author's voice
- Reduce formulaic phrases, repetition, and monotonous structures
- Use more varied sentence lengths and openings
- Replace generic transitions with more precise connectors
- Feel more human and engaging`;
}

export async function interpretWithPollinations(
  text: string,
  findings: Finding[]
): Promise<InterpretationResponse> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('Not connected to Pollinations. Please connect your Pollen account.');
  }

  const prompt = buildInterpretationPrompt({ text, findings });

  const request: PollinationsChatRequest = {
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a precise writing coach. Return only valid JSON matching the specified schema.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  };

  const response = await fetch(POLLINATIONS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pollinations API error: ${response.status} - ${errorText}`);
  }

  const data: PollinationsChatResponse = await response.json();
  const content = data.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('Empty response from Pollinations');
  }

  // Extract JSON from potential markdown code blocks
  // Try multiple strategies: markdown code block first, then first balanced JSON object
  let jsonString = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1];
  } else {
    // Find the first complete JSON object by tracking braces
    let braceCount = 0;
    let startIndex = -1;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') {
        if (braceCount === 0) startIndex = i;
        braceCount++;
      } else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          jsonString = content.slice(startIndex, i + 1);
          break;
        }
      }
    }
  }

  try {
    const parsed = JSON.parse(jsonString) as InterpretationResponse;

    // Validate required fields
    if (!parsed.explanation || !parsed.rewrite || !Array.isArray(parsed.keyInsights) || typeof parsed.confidence !== 'number') {
      throw new Error('Invalid response structure');
    }

    return parsed;
  } catch (e) {
    throw new Error(`Failed to parse Pollinations response: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export function isConnected(): boolean {
  return !!getAccessToken();
}

export function disconnect(): void {
  sessionStorage.removeItem('pollinationsAccessToken');
}