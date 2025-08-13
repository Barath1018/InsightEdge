import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gray: '#6b7280',
  light: '#f3f4f6',
};

export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          family: 'Inter',
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#111827',
      bodyColor: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      font: {
        family: 'Inter',
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11,
        },
        color: '#6b7280',
      },
    },
    y: {
      grid: {
        color: '#f3f4f6',
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11,
        },
        color: '#6b7280',
        callback: function(value: any) {
          return '$' + value.toLocaleString();
        },
      },
    },
  },
};