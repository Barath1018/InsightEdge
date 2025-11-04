'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface MonthlySalesPerformanceChartProps {
  data: { month: string; sales: number }[];
}

export function MonthlySalesPerformanceChart({ data }: MonthlySalesPerformanceChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${(value as number) / 1000}k`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {/* Fallback to provided config color via CSS var OR direct hsl token */}
            <Bar dataKey="sales" fill="var(--color-sales, hsl(var(--chart-1)))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
