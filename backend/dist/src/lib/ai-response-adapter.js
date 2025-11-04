"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeGeminiResponse = normalizeGeminiResponse;
const zod_1 = require("zod");
const KPI_SCHEMA = zod_1.z.object({
    title: zod_1.z.string(),
    value: zod_1.z.string(),
    change: zod_1.z.string().optional(),
    trend: zod_1.z.enum(['up', 'down', 'stable']).optional(),
    previousValue: zod_1.z.number().optional(),
});
const CHART_SCHEMA = zod_1.z.object({
    type: zod_1.z.enum(['line', 'bar', 'pie', 'scatter']),
    title: zod_1.z.string(),
    xAxis: zod_1.z.string(),
    yAxis: zod_1.z.array(zod_1.z.string()),
});
const NormalizedSchema = zod_1.z.object({
    kpis: zod_1.z.array(KPI_SCHEMA),
    insights: zod_1.z.array(zod_1.z.string()),
    charts: zod_1.z.array(CHART_SCHEMA),
});
function tryParseJsonFromText(text) {
    try {
        return JSON.parse(text);
    }
    catch { }
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
        const slice = text.slice(first, last + 1);
        try {
            return JSON.parse(slice);
        }
        catch { }
    }
    return null;
}
function normalizeGeminiResponse(raw) {
    // If raw already matches the normalized schema, return it
    try {
        const parsed = NormalizedSchema.parse(raw);
        return { ...parsed, raw };
    }
    catch { }
    // Try common field names
    const candidates = { kpis: [], insights: [], charts: [] };
    // If raw has an 'answer' string, try to extract JSON from it
    if (raw && typeof raw.answer === 'string') {
        const fromAnswer = tryParseJsonFromText(raw.answer);
        if (fromAnswer)
            raw = { ...raw, ...fromAnswer };
    }
    // If raw has 'insights' as strings or objects
    if (Array.isArray(raw?.insights)) {
        candidates.insights = raw.insights.map((i) => (typeof i === 'string' ? i : i.description || i.title || JSON.stringify(i)));
    }
    // KPIs
    if (Array.isArray(raw?.kpis)) {
        candidates.kpis = raw.kpis.map((k) => ({
            title: k.title || k.name || 'KPI',
            value: (k.value !== undefined && k.value !== null) ? String(k.value) : 'N/A',
            change: k.change ? String(k.change) : undefined,
            trend: k.trend && ['up', 'down', 'stable'].includes(k.trend) ? k.trend : undefined,
            previousValue: typeof k.previousValue === 'number' ? k.previousValue : undefined,
        }));
    }
    // Charts: look for 'charts', 'suggestedCharts', or 'suggested_charts'
    const chartsRaw = raw?.charts || raw?.suggestedCharts || raw?.suggested_charts || [];
    if (Array.isArray(chartsRaw)) {
        candidates.charts = chartsRaw.map((c) => ({
            type: (c.type && ['line', 'bar', 'pie', 'scatter'].includes(c.type)) ? c.type : 'line',
            title: c.title || c.name || 'Suggested Chart',
            xAxis: c.xAxis || c.x || (Array.isArray(raw?.headers) ? raw.headers[0] || '' : ''),
            yAxis: Array.isArray(c.yAxis) ? c.yAxis : (c.y ? [c.y] : (Array.isArray(raw?.headers) ? raw.headers.slice(1, 2) : [])),
        }));
    }
    // If still empty, attempt to extract JSON from raw text fields
    if ((candidates.kpis?.length || 0) === 0 && (candidates.insights?.length || 0) === 0 && (candidates.charts?.length || 0) === 0) {
        // Try raw as string or nested text
        const textSources = [];
        if (typeof raw === 'string')
            textSources.push(raw);
        if (typeof raw?.text === 'string')
            textSources.push(raw.text);
        if (typeof raw?.content === 'string')
            textSources.push(raw.content);
        if (Array.isArray(raw?.candidates)) {
            raw.candidates.forEach((c) => {
                if (typeof c?.content?.parts?.[0]?.text === 'string')
                    textSources.push(c.content.parts[0].text);
            });
        }
        for (const t of textSources) {
            const j = tryParseJsonFromText(t);
            if (j) {
                // Merge and attempt parsing again
                if (Array.isArray(j.kpis))
                    candidates.kpis = j.kpis.map((k) => ({ title: k.title || 'KPI', value: String(k.value || 'N/A') }));
                if (Array.isArray(j.insights))
                    candidates.insights = j.insights.map((s) => (typeof s === 'string' ? s : s.description || s.title || JSON.stringify(s)));
                if (Array.isArray(j.charts))
                    candidates.charts = j.charts.map((c) => ({ type: c.type || 'line', title: c.title || 'Chart', xAxis: c.xAxis || '', yAxis: Array.isArray(c.yAxis) ? c.yAxis : (c.y ? [c.y] : []) }));
                break;
            }
        }
    }
    // Ensure defaults
    const normalized = {
        kpis: candidates.kpis || [],
        insights: candidates.insights || [],
        charts: candidates.charts || [],
        raw,
    };
    // Validate final shape (zod will throw if invalid)
    try {
        NormalizedSchema.parse({ kpis: normalized.kpis, insights: normalized.insights, charts: normalized.charts });
    }
    catch (e) {
        // If validation fails, fall back to empty arrays but include raw
        return { kpis: [], insights: [], charts: [], raw };
    }
    return normalized;
}
exports.default = normalizeGeminiResponse;
