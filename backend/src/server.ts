import express from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import normalizeGeminiResponse from './vendor/lib/ai-response-adapter';
import { AIInsightsService } from './vendor/services/ai-insights-service';
import { DataAnalysisService } from './vendor/services/data-analysis-service';

dotenv.config();

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const app = express();
app.use(express.json({ limit: '2mb' }));

const AskBodySchema = z.object({
  query: z.string(),
  dataset: z.object({ headers: z.array(z.string()), data: z.array(z.any()) }).optional(),
});

const ResponseSchema = z.object({
  kpis: z.array(z.object({ title: z.string(), value: z.string(), change: z.string().optional(), trend: z.enum(['up', 'down', 'stable']).optional(), previousValue: z.number().optional() })),
  insights: z.array(z.string()),
  charts: z.array(z.object({ type: z.enum(['line', 'bar', 'pie', 'scatter']), title: z.string(), xAxis: z.string(), yAxis: z.array(z.string()) })),
});

function capDataset(dataset: any) {
  return dataset
    ? {
        headers: dataset.headers.slice(0, 50),
        data: dataset.data.slice(0, 500).map((row: any) => {
          const obj: Record<string, any> = {};
          for (const k of Object.keys(row)) {
            const v = row[k];
            if (typeof v === 'number' || typeof v === 'string' || v === null || v === undefined) {
              obj[k] = v;
            }
          }
          return obj;
        }),
      }
    : undefined;
}

const synthesizeCharts = (chartData: any[] | undefined, limitedData: any | undefined) => {
  const charts: Array<{ type: 'line' | 'bar' | 'pie' | 'scatter'; title: string; xAxis: string; yAxis: string[] }> = [];
  if (!chartData || chartData.length === 0) return charts;

  const sample = chartData[0];
  const keys = Object.keys(sample).filter(k => k !== 'month' && k !== 'date' && k !== 'label');
  const xAxis = 'month' in sample ? 'month' : 'date' in sample ? 'date' : (limitedData?.headers?.[0] ?? 'x');

  const preferred = ['revenue', 'sales', 'profit', 'expenses'];
  for (const p of preferred) {
    if (keys.includes(p)) {
      charts.push({ type: 'line', title: `${p[0].toUpperCase() + p.slice(1)} over time`, xAxis, yAxis: [p] });
    }
  }

  if (charts.length === 0 && keys.length > 0) {
    charts.push({ type: 'line', title: 'Metrics over time', xAxis, yAxis: keys.slice(0, 2) });
  }

  return charts;
};

app.post('/api/ai/ask', async (req, res) => {
  const parse = AskBodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid body', details: parse.error.format() });

  const { query, dataset } = parse.data;
  const limitedData = capDataset(dataset);

  const instruction = `You are an analytics copilot for a business dashboard.
You are given a user question and an optional dataset (headers + sample rows).
If the question can be answered from the dataset, use it and be specific; otherwise provide a helpful general answer.
CRITICAL: Respond ONLY as a single JSON object containing kpis (array), insights (array of strings), and charts (array of chart suggestions).
Example structure (values are illustrative only; do NOT copy them—compute from the dataset or provide reasonable estimates when needed):
{
  "kpis": [{"title":"Total Revenue","value":"$<number>","change":"+<percent>%","trend":"up"}],
  "insights": ["Revenue increased in Q3 due to ..."],
  "charts": [{"type":"line","title":"Revenue over time","xAxis":"date","yAxis":["revenue"]}]
}
Do not include markdown fences or extra commentary. Keep responses concise.`;

  const userPromptLines = [`Question: ${query}`];
  if (limitedData) {
    userPromptLines.push(`Dataset headers: ${JSON.stringify(limitedData.headers)}`);
    userPromptLines.push(`Sample rows (capped): ${JSON.stringify(limitedData.data)}`);
  }

  // If Gemini configured, try it first
  if (API_KEY) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: instruction }, { text: userPromptLines.join('\n') }] }],
          generationConfig: { response_mime_type: 'application/json' }
        })
      });

      if (r.ok) {
        const json = await r.json();
        const normalized = normalizeGeminiResponse(json);
        try {
          const parsed = ResponseSchema.parse({ kpis: normalized.kpis, insights: normalized.insights, charts: normalized.charts });
          return res.json(parsed);
        } catch (valErr: any) {
          console.warn('Invalid shape from Gemini, falling back to local', valErr);
        }
      } else {
        console.warn('Gemini request failed, falling back to local', await r.text());
      }
    } catch (e: any) {
      console.warn('Gemini call error, falling back to local', e?.message || e);
    }
  }

  // Local fallback
  try {
    let kpis: any[] = [];
    let charts: any[] = [];

    if (limitedData) {
      try {
        const analyzed = await DataAnalysisService.analyzeBusinessData({ type: 'uploaded', headers: limitedData.headers, data: limitedData.data });
        kpis = analyzed.kpis || [];
        charts = synthesizeCharts(analyzed.chartData as any[], limitedData);
      } catch (inner) {
        console.warn('DataAnalysisService failed during fallback:', inner);
      }
    }

    const nl = await AIInsightsService.processNaturalLanguageQuery(query, limitedData?.data ?? []);
    const insights = (nl.response || []).map(r => (r.title ? `${r.title}: ${r.description}` : r.description));

    const parsed = ResponseSchema.parse({ kpis, insights, charts });
    return res.json(parsed);
  } catch (e: any) {
    console.error('Local AI fallback failed:', e);
    return res.status(500).json({ error: e?.message || 'Unknown error during local AI fallback' });
  }
});

app.listen(port, () => console.log(`InsightEdge backend listening on https://insightedge.onrender.com`));
