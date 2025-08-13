import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData } from '../../types';
import { commonChartOptions, chartColors } from './ChartConfig';

interface ProfitChartProps {
  data: ChartData;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Profit Trend Analysis',
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
    },
  };

  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      borderColor: chartColors.secondary,
      backgroundColor: chartColors.secondary + '20',
      pointBackgroundColor: chartColors.secondary,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
    })),
  };

  return (
    <div className="card h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProfitChart;