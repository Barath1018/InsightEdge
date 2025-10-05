import { NextRequest, NextResponse } from 'next/server';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

type InferBody = {
  headers: string[];
  sampleRows: any[];
};

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing GOOGLE_AI_API_KEY' }, { status: 400 });
  }

  const { headers, sampleRows } = (await req.json()) as InferBody;

  const prompt = `You are mapping dataset columns to business metrics for a dashboard. 
Given headers and sample rows, pick best-fit columns for: revenue/sales, expenses/costs, and profit (if explicit). 
Also propose two concise chart titles (<= 4 words) suitable for monthly time series: one for sales/revenue and one for profit. 
If a date column exists, mention it. If no profit column, indicate profit should be computed as revenue - expenses.
Return strict JSON with keys: {
  "columns": { "revenue": string|null, "expenses": string|null, "profit": string|null, "date": string|null },
  "charts": { "salesTitle": string, "profitTitle": string }
}`;

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
                { text: prompt + `\n\nHeaders: ${JSON.stringify(headers)}\nSample: ${JSON.stringify(sampleRows.slice(0, 50))}` },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: 'Gemini request failed', details: t }, { status: 500 });
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { parsed = {}; }
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
