import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from '../../types';
import { commonChartOptions, chartColors } from './ChartConfig';

interface SalesChartProps {
  data: ChartData;
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Monthly Sales Performance',
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
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: index === 0 ? chartColors.primary : chartColors.secondary,
      borderRadius: 6,
      borderSkipped: false,
    })),
  };

  return (
    <div className="card h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;