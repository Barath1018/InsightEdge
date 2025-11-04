'use client';

import { Pie, PieChart, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { category: 'Electronics', sales: 27500, fill: 'var(--color-electronics)' },
  { category: 'Clothing', sales: 18200, fill: 'var(--color-clothing)' },
  { category: 'Home Goods', sales: 12500, fill: 'var(--color-home-goods)' },
  { category: 'Toys', sales: 9800, fill: 'var(--color-toys)' },
  { category: 'Books', sales: 6300, fill: 'var(--color-books)' },
];

const chartConfig = {
  sales: {
    label: 'Sales',
  },
  electronics: {
    label: 'Electronics',
    color: 'hsl(var(--chart-1))',
  },
  clothing: {
    label: 'Clothing',
    color: 'hsl(var(--chart-2))',
  },
  'home-goods': {
    label: 'Home Goods',
    color: 'hsl(var(--chart-3))',
  },
  toys: {
    label: 'Toys',
    color: 'hsl(var(--chart-4))',
  },
  books: {
    label: 'Books',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export function SalesByCategoryChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="sales"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        />
        <ChartLegend
          content={(legendProps: any) => (
            <ChartLegendContent {...legendProps} nameKey="category" />
          )}
          className="-translate-y-[2px] flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
