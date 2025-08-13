export interface BusinessMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    tension?: number;
  }[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

export interface SalesData {
  month: string;
  sales: number;
  expenses: number;
  profit: number;
}