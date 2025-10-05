import { NextRequest, NextResponse } from 'next/server';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

type AskBody = {
  query: string;
  dataset?: { headers: string[]; data: any[] };
};

type StructuredResponse = {
  answer: string;
  insights?: Array<{
    title: string;
    description: string;
    type?: 'trend' | 'anomaly' | 'recommendation' | 'correlation' | 'forecast' | string;
    impact?: 'high' | 'medium' | 'low' | string;
    confidence?: number;
    actionItems?: string[];
  }>;
  suggestedQueries?: string[];
};

function tryParseStructured(text: string): StructuredResponse | null {
  // Try direct JSON.parse first
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === 'object') return obj as StructuredResponse;
  } catch {}
  // Attempt to extract JSON substring between first { and last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const slice = text.slice(first, last + 1);
    try {
      const obj = JSON.parse(slice);
      if (obj && typeof obj === 'object') return obj as StructuredResponse;
    } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing GOOGLE_AI_API_KEY' }, { status: 400 });
  }

  const body = (await req.json()) as AskBody;
  const { query, dataset } = body;

  const limitedData = dataset
    ? {
        headers: dataset.headers.slice(0, 50),
        data: dataset.data.slice(0, 500).map((row) => {
          const obj: Record<string, any> = {};
          for (const k of Object.keys(row)) {
            const v = row[k];
            if (
              typeof v === 'number' ||
              typeof v === 'string' ||
              v === null ||
              v === undefined
            ) {
              obj[k] = v;
            }
          }
          return obj;
        }),
      }
    : undefined;

  const instruction = `You are an analytics copilot for a business dashboard.
You are given a user question and an optional dataset (headers + sample rows).
If the question can be answered from the dataset, use it and be specific; otherwise provide a helpful general answer.
CRITICAL: Respond ONLY as a single JSON object with this exact shape and no extra text:
{
  "answer": string,
  "insights": [
    { "title": string, "description": string, "type": "trend|anomaly|recommendation|correlation|forecast", "impact": "high|medium|low", "confidence": number, "actionItems": string[] }
  ],
  "suggestedQueries": string[]
}
Do not include markdown fences or commentary. Keep insights concise (1-3 items).`;

  const userPromptLines = [
    `Question: ${query}`,
  ];
  if (limitedData) {
    userPromptLines.push(`Dataset headers: ${JSON.stringify(limitedData.headers)}`);
    userPromptLines.push(`Sample rows (capped): ${JSON.stringify(limitedData.data)}`);
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: instruction },
                { text: userPromptLines.join('\n') },
              ],
            },
          ],
          // Ask for JSON if supported by the model/gateway; ignored if unsupported
          generationConfig: {
            response_mime_type: 'application/json'
          }
        }),
      }
    );

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: 'Gemini request failed', details: t }, { status: 500 });
    }

    const json = await res.json();
    const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse structured JSON; fallback to plain answer
    const structured = text ? tryParseStructured(text) : null;
    if (structured && typeof structured.answer === 'string') {
      // Sanitize minimal shape
      return NextResponse.json({
        answer: structured.answer,
        insights: Array.isArray(structured.insights) ? structured.insights : [],
        suggestedQueries: Array.isArray(structured.suggestedQueries) ? structured.suggestedQueries : [],
      } as StructuredResponse);
    }

    // Backward compatibility: return text if model didn't return JSON
    return NextResponse.json({ answer: text || 'No response', insights: [], suggestedQueries: [] } satisfies StructuredResponse);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
