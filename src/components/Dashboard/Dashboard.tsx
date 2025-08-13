import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Percent, ShoppingCart, Receipt, Tag } from 'lucide-react';
import MetricCard from '../Metrics/MetricCard';
import SalesChart from '../Charts/SalesChart';
import ProfitChart from '../Charts/ProfitChart';
import ExpensesChart from '../Charts/ExpensesChart';
import AlertBanner from '../Alerts/AlertBanner';
import RecentTransactions from '../Transactions/RecentTransactions';
import { mockSalesData, calculateMetrics, generateAlerts } from '../../data/mockData';
import { ChartData, Alert } from '../../types';

const Dashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const metrics = calculateMetrics(mockSalesData);

  useEffect(() => {
    const generatedAlerts = generateAlerts(mockSalesData, metrics);
    setAlerts(generatedAlerts);
  }, []);

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  // Prepare chart data
  const salesChartData: ChartData = {
    labels: mockSalesData.map(item => item.month),
    datasets: [
      {
        label: 'Sales',
        data: mockSalesData.map(item => item.sales),
      },
    ],
  };

  const profitChartData: ChartData = {
    labels: mockSalesData.map(item => item.month),
    datasets: [
      {
        label: 'Profit',
        data: mockSalesData.map(item => item.profit),
      },
    ],
  };

  const expensesData = {
    labels: ['Operations', 'Marketing', 'Salaries', 'Rent', 'Utilities'],
    values: [15000, 8000, 12000, 5000, 2000],
  };

  return (
    <div className="p-8 space-y-8">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map(alert => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={handleDismissAlert}
            />
          ))}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          change={metrics.revenueGrowth * 1000}
          icon={ShoppingCart}
          type="currency"
          variant="success"
        />
        <MetricCard
          title="Total Expenses"
          value={metrics.totalExpenses}
          change={metrics.expenseGrowth * 800}
          icon={Receipt}
          type="currency"
          variant="error"
        />
        <MetricCard
          title="Net Profit"
          value={metrics.netProfit}
          change={metrics.revenueGrowth * 500}
          icon={TrendingUp}
          type="currency"
          variant="primary"
        />
        <MetricCard
          title="Avg. Order Value"
          value={87.5}
          change={2.4}
          icon={Tag}
          type="percentage"
          variant="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SalesChart data={salesChartData} />
        <ProfitChart data={profitChartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        
        <ExpensesChart data={expensesData} />
      </div>
    </div>
  );
};

export default Dashboard;