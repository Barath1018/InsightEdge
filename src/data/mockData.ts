import { BusinessMetrics, SalesData, Alert } from '../types';

// Generate realistic business data for the past 12 months
export const generateMockData = (): SalesData[] => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const baseRevenue = 45000;
  const baseExpenses = 32000;
  
  return months.map((month, index) => {
    // Add seasonal variations and growth trends
    const seasonalMultiplier = 1 + Math.sin((index / 12) * 2 * Math.PI) * 0.2;
    const growthMultiplier = 1 + (index * 0.03); // 3% monthly growth
    const randomVariation = 0.9 + Math.random() * 0.2; // ±10% random variation
    
    const sales = Math.round(baseRevenue * seasonalMultiplier * growthMultiplier * randomVariation);
    const expenses = Math.round(baseExpenses * (0.95 + Math.random() * 0.1) * growthMultiplier);
    const profit = sales - expenses;
    
    return {
      month,
      sales,
      expenses,
      profit
    };
  });
};

export const mockSalesData = generateMockData();

export const calculateMetrics = (data: SalesData[]): BusinessMetrics => {
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const totalRevenue = data.reduce((sum, item) => sum + item.sales, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = (netProfit / totalRevenue) * 100;
  
  const revenueGrowth = previousMonth ? 
    ((currentMonth.sales - previousMonth.sales) / previousMonth.sales) * 100 : 0;
  const expenseGrowth = previousMonth ? 
    ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100 : 0;
  
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueGrowth,
    expenseGrowth
  };
};

export const generateAlerts = (data: SalesData[], metrics: BusinessMetrics): Alert[] => {
  const alerts: Alert[] = [];
  const currentMonth = data[data.length - 1];
  const averageProfit = data.reduce((sum, item) => sum + item.profit, 0) / data.length;
  
  // Low profit alert
  if (currentMonth.profit < averageProfit * 0.7) {
    alerts.push({
      id: '1',
      type: 'warning',
      title: 'Low Profit Alert',
      message: `This month's profit (${formatCurrency(currentMonth.profit)}) is 30% below average. Consider reviewing expenses.`,
      timestamp: new Date()
    });
  }
  
  // High expense growth alert
  if (metrics.expenseGrowth > 15) {
    alerts.push({
      id: '2',
      type: 'error',
      title: 'High Expense Growth',
      message: `Expenses increased by ${metrics.expenseGrowth.toFixed(1)}% this month. Review spending patterns.`,
      timestamp: new Date()
    });
  }
  
  // Positive revenue growth
  if (metrics.revenueGrowth > 10) {
    alerts.push({
      id: '3',
      type: 'success',
      title: 'Strong Revenue Growth',
      message: `Revenue increased by ${metrics.revenueGrowth.toFixed(1)}% this month. Great job!`,
      timestamp: new Date()
    });
  }
  
  return alerts;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};