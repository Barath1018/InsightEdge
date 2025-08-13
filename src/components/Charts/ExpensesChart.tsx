import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { commonChartOptions, chartColors } from './ChartConfig';

interface ExpensesChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

const ExpensesChart: React.FC<ExpensesChartProps> = ({ data }) => {
  const colors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.warning,
    chartColors.error,
    chartColors.gray,
  ];

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: colors.slice(0, data.labels.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Expense Breakdown',
        font: {
          family: 'Inter',
          size: 16,
          weight: '600',
        },
        color: '#111827',
        padding: {
          bottom: 20,
        },
      },
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            family: 'Inter',
            size: 12,
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => ({
                text: `${label}: $${data.datasets[0].data[i].toLocaleString()}`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].backgroundColor[i],
                lineWidth: 0,
                pointStyle: 'circle',
                index: i,
              }));
            }
            return [];
          },
        },
      },
    },
    scales: undefined,
  };

  return (
    <div className="card h-96">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default ExpensesChart;