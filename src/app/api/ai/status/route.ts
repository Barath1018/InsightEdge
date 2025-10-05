import { NextResponse } from 'next/server';

export async function GET() {
  const enabled = Boolean(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return NextResponse.json({ enabled, model });
}
