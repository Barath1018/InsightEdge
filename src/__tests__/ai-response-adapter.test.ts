import { describe, it, expect } from 'vitest';
import normalizeGeminiResponse from '../lib/ai-response-adapter';

describe('normalizeGeminiResponse', () => {
  it('returns normalized shape for already structured input', () => {
    const input = {
      kpis: [{ title: 'Total Revenue', value: '$1000', change: '+5%', trend: 'up' }],
      insights: ['Revenue increased in Q3'],
      charts: [{ type: 'line', title: 'Revenue', xAxis: 'date', yAxis: ['revenue'] }]
    };
    const out = normalizeGeminiResponse(input);
    expect(out.kpis.length).toBe(1);
    expect(out.insights[0]).toContain('Revenue');
    expect(out.charts[0].type).toBe('line');
  });

  it('parses JSON embedded inside an answer string', () => {
    const input = {
      answer: "Here's the result:\n{\n  \"kpis\": [{ \"title\": \"Orders\", \"value\": \"150\" }],\n  \"insights\": [\"Orders jumped\"],\n  \"charts\": [{ \"type\": \"bar\", \"title\": \"Orders by Date\", \"xAxis\": \"date\", \"yAxis\": [\"orders\"] }]\n}"
    };
    const out = normalizeGeminiResponse(input);
    expect(out.kpis[0].title).toBe('Orders');
    expect(out.charts[0].type).toBe('bar');
  });

  it('handles alternate field names like suggestedCharts', () => {
    const input = {
      suggestedCharts: [{ name: 'Revenue Trend', x: 'date', y: 'revenue' }],
      suggestedQueries: ['Show top products']
    };
    const out = normalizeGeminiResponse(input);
    expect(out.charts.length).toBeGreaterThan(0);
    expect(out.insights).toBeDefined();
  });
});
