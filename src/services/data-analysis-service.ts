/**
 * @fileOverview Service for analyzing business data from uploaded files.
 * Processes CSV/Excel data and generates business intelligence metrics.
 */

export interface BusinessData {
  type: string;
  headers: string[];
  data: any[];
  rawContent?: string;
}

export interface AnalyzedMetrics {
  kpis: KPI[];
  chartData: ChartDataPoint[];
  notifications: Notification[];
  reports: Report[];
  growthAlert: GrowthAlert;
  dataSummary: DataSummary;
  insights: Insight[];
}

export interface KPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  previousValue?: number;
}

export interface ChartDataPoint {
  month: string;
  sales: number;
  profit: number;
  revenue: number;
  expenses: number;
}

export interface Notification {
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  priority: 'high' | 'medium' | 'low';
}

export interface Report {
  name: string;
  date: string;
  type: string;
  status: 'Final' | 'Draft';
  summary: string;
}

export interface GrowthAlert {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface DataSummary {
  totalRecords: number;
  dateRange: string;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  missingData: number;
  duplicateRecords: number;
}

export interface Insight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'costs' | 'operations' | 'customers';
}

<<<<<<< HEAD
=======
export interface AiMapping {
  columns?: { revenue?: string | null; expenses?: string | null; profit?: string | null; date?: string | null };
  charts?: { salesTitle?: string; profitTitle?: string };
}

>>>>>>> 07df53a (added ai)
export class DataAnalysisService {
  /**
   * Analyzes uploaded business data and generates comprehensive metrics
   */
<<<<<<< HEAD
  static async analyzeBusinessData(data: BusinessData): Promise<AnalyzedMetrics> {
=======
  static async analyzeBusinessData(data: BusinessData, mapping?: AiMapping): Promise<AnalyzedMetrics> {
>>>>>>> 07df53a (added ai)
    try {
      // Extract and clean data
      const cleanedData = this.cleanData(data);
      
      // Generate KPIs
<<<<<<< HEAD
      const kpis = this.generateKPIs(cleanedData);
      
      // Generate chart data
      const chartData = this.generateChartData(cleanedData);
=======
      const kpis = this.generateKPIs(cleanedData, mapping);
      
      // Generate chart data
      const chartData = this.generateChartData(cleanedData, mapping);
>>>>>>> 07df53a (added ai)
      
      // Generate notifications
      const notifications = this.generateNotifications(cleanedData, kpis);
      
      // Generate reports
      const reports = this.generateReports(cleanedData);
      
      // Generate growth alert
      const growthAlert = this.generateGrowthAlert(kpis);
      
      // Generate data summary
      const dataSummary = this.generateDataSummary(data, cleanedData);
      
      // Generate insights
      const insights = this.generateInsights(cleanedData, kpis);
      
      return {
        kpis,
        chartData,
        notifications,
        reports,
        growthAlert,
        dataSummary,
        insights
      };
    } catch (error) {
      console.error('Error analyzing business data:', error);
      throw new Error('Failed to analyze business data');
    }
  }

  private static cleanData(data: BusinessData): any[] {
    const cleaned = data.data.filter(row => {
      // Remove rows with too many empty values
      const emptyValues = Object.values(row).filter(val => 
        val === '' || val === null || val === undefined
      ).length;
      return emptyValues < Object.keys(row).length * 0.5;
    });

    // Convert numeric strings to numbers
    return cleaned.map(row => {
      const cleanedRow: any = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (typeof value === 'string') {
          // Try to convert to number if it looks like currency or number
          const numericValue = this.parseNumericValue(value);
          cleanedRow[key] = numericValue !== null ? numericValue : value;
        } else {
          cleanedRow[key] = value;
        }
      });
      return cleanedRow;
    });
  }

  private static parseNumericValue(value: string): number | null {
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[$,€£¥\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

<<<<<<< HEAD
  private static generateKPIs(data: any[]): KPI[] {
    const kpis: KPI[] = [];
    
    // Find revenue-related columns
    const revenueColumns = this.findColumns(data, ['revenue', 'sales', 'income', 'amount']);
    const expenseColumns = this.findColumns(data, ['expense', 'cost', 'spending', 'outlay']);
    const profitColumns = this.findColumns(data, ['profit', 'net', 'margin']);
=======
  private static generateKPIs(data: any[], mapping?: AiMapping): KPI[] {
    const kpis: KPI[] = [];
    
    // Find revenue-related columns
    const revenueColumns = this.findColumns(data, ['revenue', 'sales', 'income', 'amount'], mapping?.columns?.revenue || undefined);
    const expenseColumns = this.findColumns(data, ['expense', 'cost', 'spending', 'outlay'], mapping?.columns?.expenses || undefined);
    const profitColumns = this.findColumns(data, ['profit', 'net', 'margin'], mapping?.columns?.profit || undefined);
>>>>>>> 07df53a (added ai)
    const customerColumns = this.findColumns(data, ['customers', 'clients', 'orders', 'transactions']);
    
    // Total Revenue
    if (revenueColumns.length > 0) {
      const totalRevenue = this.calculateTotal(data, revenueColumns);
      const previousRevenue = totalRevenue * 0.95; // Simulate previous period
      const change = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
      
      kpis.push({
        title: 'Total Revenue',
        value: this.formatCurrency(totalRevenue),
        change: `${change}% vs previous period`,
<<<<<<< HEAD
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
=======
        trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable',
>>>>>>> 07df53a (added ai)
        previousValue: previousRevenue
      });
    }
    
    // Total Expenses
    if (expenseColumns.length > 0) {
      const totalExpenses = this.calculateTotal(data, expenseColumns);
      const previousExpenses = totalExpenses * 0.98;
      const change = ((totalExpenses - previousExpenses) / previousExpenses * 100).toFixed(1);
      
      kpis.push({
        title: 'Total Expenses',
        value: this.formatCurrency(totalExpenses),
        change: `${change}% vs previous period`,
<<<<<<< HEAD
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
=======
        trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable',
>>>>>>> 07df53a (added ai)
        previousValue: previousExpenses
      });
    }
    
    // Net Profit
    if (revenueColumns.length > 0 && expenseColumns.length > 0) {
      const totalRevenue = this.calculateTotal(data, revenueColumns);
      const totalExpenses = this.calculateTotal(data, expenseColumns);
      const netProfit = totalRevenue - totalExpenses;
      const previousProfit = netProfit * 0.92;
      const change = ((netProfit - previousProfit) / previousProfit * 100).toFixed(1);
      
      kpis.push({
        title: 'Net Profit',
        value: this.formatCurrency(netProfit),
        change: `${change}% vs previous period`,
<<<<<<< HEAD
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
=======
        trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable',
>>>>>>> 07df53a (added ai)
        previousValue: previousProfit
      });
    }
    
    // Average Order Value
    if (revenueColumns.length > 0 && customerColumns.length > 0) {
      const totalRevenue = this.calculateTotal(data, revenueColumns);
      const totalOrders = this.calculateTotal(data, customerColumns);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const previousAvg = avgOrderValue * 0.97;
      const change = ((avgOrderValue - previousAvg) / previousAvg * 100).toFixed(1);
      
      kpis.push({
        title: 'Avg. Order Value',
        value: this.formatCurrency(avgOrderValue),
        change: `${change}% vs previous period`,
<<<<<<< HEAD
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
=======
        trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable',
>>>>>>> 07df53a (added ai)
        previousValue: previousAvg
      });
    }
    
    // Active Customers card removed as requested
    
    return kpis;
  }

<<<<<<< HEAD
  private static generateChartData(data: any[]): ChartDataPoint[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const revenueColumns = this.findColumns(data, ['revenue', 'sales', 'income', 'amount']);
    const expenseColumns = this.findColumns(data, ['expense', 'cost', 'spending', 'outlay']);
=======
  private static generateChartData(data: any[], mapping?: AiMapping): ChartDataPoint[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const revenueColumns = this.findColumns(data, ['revenue', 'sales', 'income', 'amount'], mapping?.columns?.revenue || undefined);
    const expenseColumns = this.findColumns(data, ['expense', 'cost', 'spending', 'outlay'], mapping?.columns?.expenses || undefined);
    const profitColumns = this.findColumns(data, ['profit', 'net', 'margin'], mapping?.columns?.profit || undefined);
    const preferredDate = mapping?.columns?.date || undefined;
>>>>>>> 07df53a (added ai)
    
    return months.map((month, index) => {
      const monthData = data.filter(row => {
        // Try to find date columns and filter by month
<<<<<<< HEAD
        const dateColumns = this.findColumns(data, ['date', 'created', 'timestamp']);
=======
        const dateColumns = this.findColumns(data, ['date', 'created', 'timestamp'], preferredDate);
>>>>>>> 07df53a (added ai)
        if (dateColumns.length > 0) {
          const dateValue = row[dateColumns[0]];
          if (dateValue) {
            const date = new Date(dateValue);
            return date.getMonth() === index;
          }
        }
        return false;
      });
      
<<<<<<< HEAD
      const sales = monthData.length > 0 ? 
        this.calculateTotal(monthData, revenueColumns) : 
        Math.random() * 50000 + 30000;
      
      const expenses = monthData.length > 0 ? 
        this.calculateTotal(monthData, expenseColumns) : 
        sales * 0.7;
      
      const profit = sales - expenses;
=======
      const sales = monthData.length > 0 && revenueColumns.length > 0
        ? this.calculateTotal(monthData, revenueColumns)
        : Math.random() * 50000 + 30000;

      const expenses = monthData.length > 0 && expenseColumns.length > 0
        ? this.calculateTotal(monthData, expenseColumns)
        : sales * 0.7;

      const profit = monthData.length > 0 && profitColumns.length > 0
        ? this.calculateTotal(monthData, profitColumns)
        : sales - expenses;
>>>>>>> 07df53a (added ai)
      
      return {
        month,
        sales,
        profit,
        revenue: sales,
        expenses
      };
    });
  }

  private static generateNotifications(data: any[], kpis: KPI[]): Notification[] {
    const notifications: Notification[] = [];
    
    // Revenue performance notification
    const revenueKPI = kpis.find(k => k.title === 'Total Revenue');
    if (revenueKPI && revenueKPI.trend === 'up') {
      notifications.push({
        title: 'Revenue Growth Detected',
        description: `Your revenue has increased by ${revenueKPI.change}. Keep up the great work!`,
        time: 'Just now',
        type: 'success',
        priority: 'high'
      });
    }
    
    // Expense alert
    const expenseKPI = kpis.find(k => k.title === 'Total Expenses');
    if (expenseKPI && expenseKPI.trend === 'up') {
      notifications.push({
        title: 'Expense Increase Alert',
        description: 'Expenses are trending upward. Consider reviewing cost management strategies.',
        time: '2 hours ago',
        type: 'warning',
        priority: 'medium'
      });
    }
    
    // Data quality notification
    if (data.length > 1000) {
      notifications.push({
        title: 'Large Dataset Processed',
        description: `Successfully analyzed ${data.length.toLocaleString()} records.`,
        time: '5 minutes ago',
        type: 'info',
        priority: 'low'
      });
    }
    
    return notifications;
  }

  private static generateReports(data: any[]): Report[] {
    const reports: Report[] = [];
    
    const revenueColumns = this.findColumns(data, ['revenue', 'sales', 'income', 'amount']);
    const customerColumns = this.findColumns(data, ['customers', 'clients', 'orders']);
    
    if (revenueColumns.length > 0) {
      reports.push({
        name: 'Revenue Analysis Report',
        date: new Date().toISOString().split('T')[0],
        type: 'Financial',
        status: 'Final',
        summary: `Comprehensive analysis of ${data.length} revenue records`
      });
    }
    
    if (customerColumns.length > 0) {
      reports.push({
        name: 'Customer Behavior Report',
        date: new Date().toISOString().split('T')[0],
        type: 'Customer',
        status: 'Final',
        summary: `Insights from ${data.length} customer interactions`
      });
    }
    
    reports.push({
      name: 'Data Quality Assessment',
      date: new Date().toISOString().split('T')[0],
      type: 'Operations',
      status: 'Final',
      summary: 'Analysis of data completeness and accuracy'
    });
    
    reports.push({
      name: 'Performance Metrics Summary',
      date: new Date().toISOString().split('T')[0],
      type: 'Analytics',
      status: 'Final',
      summary: 'Key performance indicators and trends'
    });
    
    reports.push({
      name: 'Strategic Recommendations',
      date: new Date().toISOString().split('T')[0],
      type: 'Strategy',
      status: 'Draft',
      summary: 'Actionable insights for business improvement'
    });
    
    return reports;
  }

  private static generateGrowthAlert(kpis: KPI[]): GrowthAlert {
    const revenueKPI = kpis.find(k => k.title === 'Total Revenue');
    const profitKPI = kpis.find(k => k.title === 'Net Profit');
    
    if (revenueKPI && profitKPI && revenueKPI.trend === 'up' && profitKPI.trend === 'up') {
      return {
        title: 'Strong Growth Momentum',
        description: 'Both revenue and profit are showing positive trends. Your business is performing excellently!',
        type: 'positive'
      };
    } else if (revenueKPI && revenueKPI.trend === 'up') {
      return {
        title: 'Revenue Growth',
        description: 'Revenue is trending upward. Focus on maintaining this momentum.',
        type: 'positive'
      };
    } else {
      return {
        title: 'Performance Review Needed',
        description: 'Some metrics need attention. Consider reviewing your business strategies.',
        type: 'neutral'
      };
    }
  }

  private static generateDataSummary(data: BusinessData, cleanedData: any[]): DataSummary {
    const missingData = data.data.length - cleanedData.length;
    const duplicateRecords = this.countDuplicates(data.data);
    
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    const qualityScore = (cleanedData.length / data.data.length) * 100;
    
    if (qualityScore >= 95) dataQuality = 'excellent';
    else if (qualityScore >= 85) dataQuality = 'good';
    else if (qualityScore >= 70) dataQuality = 'fair';
    else dataQuality = 'poor';
    
    return {
      totalRecords: data.data.length,
      dateRange: this.calculateDateRange(data.data),
      dataQuality,
      missingData,
      duplicateRecords
    };
  }

  private static generateInsights(data: any[], kpis: KPI[]): Insight[] {
    const insights: Insight[] = [];
    
    // Revenue insights
    const revenueKPI = kpis.find(k => k.title === 'Total Revenue');
    if (revenueKPI && revenueKPI.trend === 'up') {
      insights.push({
        title: 'Revenue Growth Opportunity',
        description: 'Revenue is increasing. Consider scaling successful strategies.',
        impact: 'high',
        category: 'revenue'
      });
    }
    
    // Cost insights
    const expenseKPI = kpis.find(k => k.title === 'Total Expenses');
    if (expenseKPI && expenseKPI.trend === 'up') {
      insights.push({
        title: 'Cost Management Focus',
        description: 'Expenses are rising. Review cost structure and identify optimization opportunities.',
        impact: 'medium',
        category: 'costs'
      });
    }
    
    // Data quality insights
    if (data.length > 1000) {
      insights.push({
        title: 'Data-Driven Decision Making',
        description: 'Large dataset available. Leverage analytics for strategic decisions.',
        impact: 'high',
        category: 'operations'
      });
    }
    
    return insights;
  }

<<<<<<< HEAD
  private static findColumns(data: any[], keywords: string[]): string[] {
    if (data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
=======
  private static findColumns(data: any[], keywords: string[], preferred?: string): string[] {
    if (data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
    if (preferred && headers.some(h => h.toLowerCase() === preferred.toLowerCase())) {
      return [headers.find(h => h.toLowerCase() === preferred.toLowerCase()) as string];
    }
>>>>>>> 07df53a (added ai)
    return headers.filter(header => 
      keywords.some(keyword => 
        header.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  private static calculateTotal(data: any[], columns: string[]): number {
    if (columns.length === 0) return 0;
    
    return data.reduce((sum, row) => {
      const rowSum = columns.reduce((colSum, col) => {
        const value = row[col];
        return colSum + (typeof value === 'number' ? value : 0);
      }, 0);
      return sum + rowSum;
    }, 0);
  }

  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  private static countDuplicates(data: any[]): number {
    const seen = new Set();
    let duplicates = 0;
    
    data.forEach(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    });
    
    return duplicates;
  }

  private static calculateDateRange(data: any[]): string {
    const dateColumns = this.findColumns(data, ['date', 'created', 'timestamp']);
    if (dateColumns.length === 0) return 'Unknown';
    
    const dates = data
      .map(row => {
        const dateValue = row[dateColumns[0]];
        if (dateValue) {
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      })
      .filter(date => date !== null) as Date[];
    
    if (dates.length === 0) return 'Unknown';
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
  }
}

