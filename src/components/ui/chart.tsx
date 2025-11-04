"use client";

import * as React from 'react';
import * as Recharts from 'recharts';

// Minimal types to satisfy existing imports
export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string; icon?: React.ComponentType }>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);
function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error('useChart must be used inside ChartContainer');
  return ctx;
}

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { config: ChartConfig }>(
  ({ config, className, children, ...rest }, ref) => {
    // Derive CSS variables for any config entries whose color looks like an hsl(var(--chart-x)) token.
    const styleVars: React.CSSProperties = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value?.color) {
        // Provide a stable custom prop (--color-<key>) so downstream components can reference it.
        (styleVars as any)[`--color-${key}`] = value.color;
      }
    });
    return (
      <ChartContext.Provider value={{ config }}>
        <div ref={ref} className={className} style={styleVars} {...rest}>{children}</div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

// Directly re-export primitive components we rely on elsewhere
const ChartTooltip = Recharts.Tooltip;
const ChartLegend = Recharts.Legend;

// Very small tooltip content; relies on Recharts default when omitted
const ChartTooltipContent = React.forwardRef<HTMLDivElement, any>(({ payload, label }, ref) => {
  if (!payload?.length) return null;
  return (
    <div ref={ref} className="rounded border bg-background p-2 text-xs shadow">
      {label && <div className="font-medium mb-1">{label}</div>}
      <ul className="space-y-0.5">
        {payload.map((item: any, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: item.color || 'var(--foreground)' }} />
            <span>{item.name}:</span>
            <span className="font-mono">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});
ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartLegendContent = React.forwardRef<HTMLDivElement, any>(({ payload }, ref) => {
  const { config } = useChart();
  if (!Array.isArray(payload) || payload.length === 0) return null;
  return (
    <div ref={ref} className="flex flex-wrap items-center gap-3 pt-2 text-xs">
      {payload.map((item: any, i: number) => {
        const key = item.dataKey || item.value || i;
        const cfg = config[key as string];
        return (
          <div key={key} className="flex items-center gap-1.5">
            {cfg?.icon ? (
              <cfg.icon />
            ) : (
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: item.color }} />
            )}
            <span>{cfg?.label || item.value || key}</span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = 'ChartLegendContent';

// Stub (legacy export compatibility)
const ChartStyle = () => null;

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
