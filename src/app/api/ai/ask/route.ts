import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import normalizeGeminiResponse from '@/lib/ai-response-adapter';
import { AIInsightsService } from '@/services/ai-insights-service';
import { DataAnalysisService } from '@/services/data-analysis-service';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const DEFAULT_MODEL = 'gemini-1.5-flash';
const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const AskBodySchema = z.object({
  query: z.string(),
  dataset: z.object({ headers: z.array(z.string()), data: z.array(z.any()) }).optional(),
});

type AskBody = z.infer<typeof AskBodySchema>;

const ResponseSchema = z.object({
  kpis: z.array(z.object({ title: z.string(), value: z.string(), change: z.string().optional(), trend: z.enum(['up', 'down', 'stable']).optional(), previousValue: z.number().optional() })),
  insights: z.array(z.string()),
  charts: z.array(z.object({ type: z.enum(['line', 'bar', 'pie', 'scatter']), title: z.string(), xAxis: z.string(), yAxis: z.array(z.string()) })),
  answer: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AskBody;
  const { query, dataset } = body;
  // Build a capped dataset sample (same logic used when calling Gemini)
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

Special requirements for month-extreme questions:
- If the question asks "which/what month has the highest/lowest <metric>" (e.g., sales, revenue, profit), compute from the dataset and answer explicitly with the month and the numeric value (format currency when appropriate). Example answer: "May has the highest sales ($85,000)."

CRITICAL OUTPUT CONTRACT: Respond ONLY as a single JSON object containing exactly these fields:
- answer: short plain-English answer to the question
- kpis: array of KPIs (objects with title, value, optional change/trend)
- insights: array of short strings with insights
- charts: array of chart suggestions (type, title, xAxis, yAxis)

Example (illustrative only):
{
  "answer": "Revenue grew 8% last quarter driven by ...",
  "kpis": [{"title":"Total Revenue","value":"$<number>","change":"+<percent>%","trend":"up"}],
  "insights": ["Revenue increased in Q3 due to ..."],
  "charts": [{"type":"line","title":"Revenue over time","xAxis":"date","yAxis":["revenue"]}]
}
Do not include markdown fences or any extra commentary. Keep responses concise.`;

  const userPromptLines = [
    `Question: ${query}`,
  ];
  if (limitedData) {
    userPromptLines.push(`Dataset headers: ${JSON.stringify(limitedData.headers)}`);
    userPromptLines.push(`Sample rows (capped): ${JSON.stringify(limitedData.data)}`);
  }

  // (Fast path moved after Gemini so Gemini gets first attempt; fast path remains as fallback.)

  // Helper to synthesize charts suggestions from DataAnalysisService chart data
  const synthesizeCharts = (chartData: any[] | undefined) => {
    const charts: Array<{ type: 'line' | 'bar' | 'pie' | 'scatter'; title: string; xAxis: string; yAxis: string[] }> = [];
    if (!chartData || chartData.length === 0) return charts;

    const sample = chartData[0];
    const keys = Object.keys(sample).filter(k => k !== 'month' && k !== 'date' && k !== 'label');
    const xAxis = 'month' in sample ? 'month' : 'date' in sample ? 'date' : (limitedData?.headers?.[0] ?? 'x');

    // Preference: revenue/sales/profit/expenses
    const preferred = ['revenue', 'sales', 'profit', 'expenses'];
    for (const p of preferred) {
      if (keys.includes(p)) {
        charts.push({ type: 'line', title: `${p[0].toUpperCase() + p.slice(1)} over time`, xAxis, yAxis: [p] });
      }
    }

    // If none matched, create a generic line chart with up to 2 numeric series
    if (charts.length === 0 && keys.length > 0) {
      charts.push({ type: 'line', title: 'Metrics over time', xAxis, yAxis: keys.slice(0, 2) });
    }

    return charts;
  };

  // Helper: sanitize model name from env (accept values like "googleai/gemini-2.5-flash")
  const sanitizeModel = (m: string) => {
    const name = m.includes('/') ? m.split('/').pop()! : m;
    return name || DEFAULT_MODEL;
  };

  // If Gemini is configured, prefer it but fall back to retry/default/local on failure
  if (API_KEY) {
    try {
      const modelName = sanitizeModel(MODEL);
      const tryCall = async (model: string) => fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
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

      let res = await tryCall(modelName);
      // Retry once with default known-good model if the configured one fails
      if (!res.ok) {
        console.warn(`Gemini request failed for model ${modelName} (${res.status}). Retrying with ${DEFAULT_MODEL}...`);
        res = await tryCall(DEFAULT_MODEL);
      }

      if (!res.ok) {
        // fallthrough to local fallback
        console.warn('Gemini request failed, falling back to local insights');
      } else {
        const json = await res.json();
        // Normalize using adapter (handles many possible shapes and raw text)
        const normalized = normalizeGeminiResponse(json);

        // Validate normalized shape
        try {
          const parsed = ResponseSchema.parse({ kpis: normalized.kpis, insights: normalized.insights, charts: normalized.charts, answer: normalized.answer });
          return NextResponse.json(parsed);
        } catch (valErr: any) {
          // If validation fails, fall back to local insights but include debug info in logs
          console.warn('Invalid AI response shape from Gemini, falling back to local insights', String(valErr));
        }
      }
    } catch (e: any) {
      console.warn('Gemini call threw, falling back to local insights:', e?.message || e);
    }
  }

  // 2) Deterministic month-extreme fallback (if Gemini unavailable or failed)
  try {
    const q = query.toLowerCase();
    // Support broader phrasing like "has high sales" and "month with highest sales"
    const monthMaxRe = /(which|what)\s+month\s+(?:has|with)\s+(?:the\s+)?(highest|most|max(?:imum)?|top|greatest|peak|best|high(?:est)?)\s+(sales?|revenue|profit)s?/i;
    const monthMinRe = /(which|what)\s+month\s+(?:has|with)\s+(?:the\s+)?(lowest|least|min(?:imum)?|worst|low(?:est)?)\s+(sales?|revenue|profit)s?/i;
    if ((monthMaxRe.test(q) || monthMinRe.test(q)) && dataset) {
      const analyzed = await DataAnalysisService.analyzeBusinessData({ type: 'uploaded', headers: dataset.headers, data: dataset.data });
      const series = analyzed.chartData as Array<{ month: string; sales: number; revenue: number; profit: number; expenses: number }>;
      if (series && series.length) {
        const metricKey = q.includes('profit') ? 'profit' : 'sales';
        const pick = (arr: typeof series, key: keyof typeof series[number], fn: (a:number,b:number)=>boolean) =>
          arr.reduce((best, cur) => (best == null || fn(cur[key] as number, (best[key] as number)) ? cur : best), undefined as any);
        const target = monthMaxRe.test(q)
          ? pick(series, metricKey as any, (a,b)=>a> b)
          : pick(series, metricKey as any, (a,b)=>a< b);
        if (target) {
          const value = target[metricKey as keyof typeof target] as number;
          const answer = `${target.month} has the ${monthMaxRe.test(q) ? 'highest' : 'lowest'} ${metricKey} (${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value)}).`;
          const charts = [{ type: 'line' as const, title: `${metricKey[0].toUpperCase()+metricKey.slice(1)} over time`, xAxis: 'month', yAxis: [metricKey] }];
          const kpis = [{ title: `${monthMaxRe.test(q) ? 'Top' : 'Lowest'} ${metricKey} month`, value: answer.replace(/.*\((.*)\).*/,'$1') }];
          const insights = [answer];
          const parsed = ResponseSchema.parse({ kpis, insights, charts, answer });
          return NextResponse.json(parsed);
        }
      }
    }
  } catch (fastErr) {
    console.warn('Fast-path month intent failed, continuing to local:', fastErr);
  }

  // Local fallback: use DataAnalysisService and AIInsightsService to synthesize the canonical response
  try {
    let kpis: any[] = [];
    let charts: any[] = [];

    if (limitedData) {
      try {
        const analyzed = await DataAnalysisService.analyzeBusinessData({ type: 'uploaded', headers: limitedData.headers, data: limitedData.data });
        kpis = analyzed.kpis || [];
        charts = synthesizeCharts(analyzed.chartData as any[]);
      } catch (inner) {
        console.warn('DataAnalysisService failed during fallback:', inner);
      }
    }

    // Natural language processing for insights
  const nl = await AIInsightsService.processNaturalLanguageQuery(query, limitedData?.data ?? []);
  const insights = (nl.response || []).map((r) => (r.title ? `${r.title}: ${r.description}` : r.description));
  const answer = nl.answer || (insights.length ? `Top insights: ${insights.slice(0, 2).join('; ')}` : undefined);

  const parsed = ResponseSchema.parse({ kpis, insights, charts, answer });
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error during local AI fallback' }, { status: 500 });
  }
}
