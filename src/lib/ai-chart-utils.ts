import { ChartConfig } from '@/components/dashboard/interactive-chart-builder';

export interface AiMapping {
  columns?: { revenue?: string|null; expenses?: string|null; profit?: string|null; date?: string|null };
  charts?: { salesTitle?: string; profitTitle?: string };
}

export function applyAiMappingToChartConfig(prev: ChartConfig, aiMapping?: AiMapping): ChartConfig {
  if (!aiMapping) return prev;
  const preferredX = aiMapping.columns?.date || '';
  const yCandidates = [aiMapping.columns?.revenue, aiMapping.columns?.expenses, aiMapping.columns?.profit].filter(Boolean) as string[];
  const yAxis = yCandidates.length > 0 ? [yCandidates[0]] : [];
  const suggestedTitle = aiMapping.charts?.salesTitle || prev.title;

  return {
    ...prev,
    xAxis: prev.xAxis || preferredX || prev.xAxis,
    yAxis: (prev.yAxis && prev.yAxis.length > 0) ? prev.yAxis : yAxis,
    title: suggestedTitle || prev.title,
    type: prev.type || (yAxis.length > 0 ? 'line' : prev.type),
  };
}

export default applyAiMappingToChartConfig;
