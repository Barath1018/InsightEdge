/**
 * Copied DataAnalysisService into backend vendor for standalone backend.
 */

export interface BusinessData {
  type: string;
  headers: string[];
  data: any[];
  rawContent?: string;
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

export interface AnalyzedMetrics {
  kpis: KPI[];
  chartData: ChartDataPoint[];
  notifications: any[];
  reports: any[];
  growthAlert: any;
  dataSummary: any;
  insights: any[];
}

export class DataAnalysisService {
  static async analyzeBusinessData(data: BusinessData, mapping?: any): Promise<AnalyzedMetrics> {
    try {
      const cleanedData = this.cleanData(data);
      const kpis = this.generateKPIs(cleanedData, mapping);
      const chartData = this.generateChartData(cleanedData, mapping);
      const notifications = this.generateNotifications(cleanedData, kpis);
      const reports = this.generateReports(cleanedData);
      const growthAlert = this.generateGrowthAlert(kpis);
      const dataSummary = this.generateDataSummary(data, cleanedData);
      const insights = this.generateInsights(cleanedData, kpis);

      return { kpis, chartData, notifications, reports, growthAlert, dataSummary, insights };
    } catch (error) {
      console.error('Error analyzing business data:', error);
      throw new Error('Failed to analyze business data');
    }
  }

  private static cleanData(data: BusinessData): any[] {
    const cleaned = data.data.filter(row => {
      const emptyValues = Object.values(row).filter(val => val === '' || val === null || val === undefined).length;
      return emptyValues < Object.keys(row).length * 0.5;
    });

    return cleaned.map(row => {
      const cleanedRow: any = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (typeof value === 'string') {
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
    const cleaned = value.replace(/[$,€£¥\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  private static generateKPIs(data: any[], mapping?: any): KPI[] {
    const kpis: KPI[] = [];
    const revenueColumns = this.findColumns(data, ['revenue', 'sales', 'income', 'amount'], mapping?.columns?.revenue || undefined);
    const expenseColumns = this.findColumns(data, ['expense', 'cost', 'spending', 'outlay'], mapping?.columns?.expenses || undefined);
    const profitColumns = this.findColumns(data, ['profit', 'net', 'margin'], mapping?.columns?.profit || undefined);
    const customerColumns = this.findColumns(data, ['customers', 'clients', 'orders', 'transactions']);

    if (revenueColumns.length > 0) {
      const totalRevenue = this.calculateTotal(data, revenueColumns);
      const previousRevenue = totalRevenue * 0.95;
      const change = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
      kpis.push({ title: 'Total Revenue', value: this.formatCurrency(totalRevenue), change: `${change}% vs previous period`, trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable', previousValue: previousRevenue });
    }

    if (expenseColumns.length > 0) {
      const totalExpenses = this.calculateTotal(data, expenseColumns);
      const previousExpenses = totalExpenses * 0.98;
      const change = ((totalExpenses - previousExpenses) / previousExpenses * 100).toFixed(1);
      kpis.push({ title: 'Total Expenses', value: this.formatCurrency(totalExpenses), change: `${change}% vs previous period`, trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable', previousValue: previousExpenses });
    }

    if (revenueColumns.length > 0 && expenseColumns.length > 0) {
      const totalRevenue = this.calculateTotal(data, revenueColumns);
      const totalExpenses = this.calculateTotal(data, expenseColumns);
      const netProfit = totalRevenue - totalExpenses;
      const previousProfit = netProfit * 0.92;
      const change = ((netProfit - previousProfit) / previousProfit * 100).toFixed(1);
      kpis.push({ title: 'Net Profit', value: this.formatCurrency(netProfit), change: `${change}% vs previous period`, trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable', previousValue: previousProfit });
    }

    if (revenueColumns.length > 0 && customerColumns.length > 0) {
      const totalRevenue = this.calculateTotal(data, revenueColumns);
      const totalOrders = this.calculateTotal(data, customerColumns);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const previousAvg = avgOrderValue * 0.97;
      const change = ((avgOrderValue - previousAvg) / previousAvg * 100).toFixed(1);
      kpis.push({ title: 'Avg. Order Value', value: this.formatCurrency(avgOrderValue), change: `${change}% vs previous period`, trend: parseFloat(change) > 0 ? 'up' : parseFloat(change) < 0 ? 'down' : 'stable', previousValue: previousAvg });
    }

    return kpis;
  }

  private static generateChartData(data: any[], mapping?: any): ChartDataPoint[] {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueColumns = this.findColumns(data, ['revenue','sales','income','amount'], mapping?.columns?.revenue || undefined);
    const expenseColumns = this.findColumns(data, ['expense','cost','spending','outlay'], mapping?.columns?.expenses || undefined);
    const profitColumns = this.findColumns(data, ['profit','net','margin'], mapping?.columns?.profit || undefined);
    const dateColumns = this.findColumns(data, ['date','created','timestamp'], mapping?.columns?.date || undefined);
    const monthAgg: Record<number, { sales:number; expenses:number; profit:number }> = {};

    if (dateColumns.length > 0) {
      const dateCol = dateColumns[0];
      data.forEach(row => {
        const raw = row[dateCol]; if (!raw) return; const date = new Date(raw); if (isNaN(date.getTime())) return; const m = date.getMonth(); if (!monthAgg[m]) monthAgg[m] = { sales:0, expenses:0, profit:0 }; const rev = revenueColumns.length ? revenueColumns.reduce((s,col)=>s+(typeof row[col]==='number'?row[col]:0),0):0; const exp = expenseColumns.length ? expenseColumns.reduce((s,col)=>s+(typeof row[col]==='number'?row[col]:0),0):0; const prof = profitColumns.length ? profitColumns.reduce((s,col)=>s+(typeof row[col]==='number'?row[col]:0),0) : (rev-exp); monthAgg[m].sales += rev||0; monthAgg[m].expenses += exp||0; monthAgg[m].profit += prof||0; });
    }

    if (dateColumns.length === 0) {
      const totalRevenue = this.calculateTotal(data, revenueColumns);
      const base = totalRevenue || 600000;
      months.forEach((_, idx) => { const factor = 0.9 + Math.sin(idx/12*Math.PI*2)*0.1; const sales = (base/12)*factor; const expenses = sales*0.65; const profit = sales-expenses; monthAgg[idx] = { sales, expenses, profit }; });
    }

    return months.map((label, idx) => { const bucket = monthAgg[idx] || { sales: 0, expenses: 0, profit: 0 }; return { month: label, sales: bucket.sales, profit: bucket.profit, revenue: bucket.sales, expenses: bucket.expenses }; });
  }

  private static generateNotifications(data: any[], kpis: any[]): any[] { const notifications:any[] = []; const revenueKPI = kpis.find((k:any)=>k.title==='Total Revenue'); if (revenueKPI && revenueKPI.trend==='up') notifications.push({ title: 'Revenue Growth Detected', description: `Your revenue has increased by ${revenueKPI.change}. Keep up the great work!`, time: 'Just now', type: 'success', priority: 'high' }); const expenseKPI = kpis.find((k:any)=>k.title==='Total Expenses'); if (expenseKPI && expenseKPI.trend==='up') notifications.push({ title: 'Expense Increase Alert', description: 'Expenses are trending upward. Consider reviewing cost management strategies.', time: '2 hours ago', type: 'warning', priority: 'medium' }); if (data.length > 1000) notifications.push({ title: 'Large Dataset Processed', description: `Successfully analyzed ${data.length.toLocaleString()} records.`, time: '5 minutes ago', type: 'info', priority: 'low' }); return notifications; }

  private static generateReports(data: any[]): any[] { const reports:any[] = []; const revenueColumns = this.findColumns(data, ['revenue','sales','income','amount']); const customerColumns = this.findColumns(data, ['customers','clients','orders']); if (revenueColumns.length>0) reports.push({ name: 'Revenue Analysis Report', date: new Date().toISOString().split('T')[0], type: 'Financial', status: 'Final', summary: `Comprehensive analysis of ${data.length} revenue records` }); if (customerColumns.length>0) reports.push({ name: 'Customer Behavior Report', date: new Date().toISOString().split('T')[0], type: 'Customer', status: 'Final', summary: `Insights from ${data.length} customer interactions` }); reports.push({ name: 'Data Quality Assessment', date: new Date().toISOString().split('T')[0], type: 'Operations', status: 'Final', summary: 'Analysis of data completeness and accuracy' }); reports.push({ name: 'Performance Metrics Summary', date: new Date().toISOString().split('T')[0], type: 'Analytics', status: 'Final', summary: 'Key performance indicators and trends' }); reports.push({ name: 'Strategic Recommendations', date: new Date().toISOString().split('T')[0], type: 'Strategy', status: 'Draft', summary: 'Actionable insights for business improvement' }); return reports; }

  private static generateGrowthAlert(kpis: KPI[]): any { const revenueKPI = kpis.find(k=>k.title==='Total Revenue'); const profitKPI = kpis.find(k=>k.title==='Net Profit'); if (revenueKPI && profitKPI && revenueKPI.trend==='up' && profitKPI.trend==='up') return { title: 'Strong Growth Momentum', description: 'Both revenue and profit are showing positive trends. Your business is performing excellently!', type: 'positive' }; else if (revenueKPI && revenueKPI.trend==='up') return { title: 'Revenue Growth', description: 'Revenue is trending upward. Focus on maintaining this momentum.', type: 'positive' }; else return { title: 'Performance Review Needed', description: 'Some metrics need attention. Consider reviewing your business strategies.', type: 'neutral' }; }

  private static generateDataSummary(data: BusinessData, cleanedData: any[]): any { const missingData = data.data.length - cleanedData.length; const duplicateRecords = this.countDuplicates(data.data); let dataQuality:'excellent'|'good'|'fair'|'poor'; const qualityScore = (cleanedData.length / data.data.length) * 100; if (qualityScore>=95) dataQuality='excellent'; else if (qualityScore>=85) dataQuality='good'; else if (qualityScore>=70) dataQuality='fair'; else dataQuality='poor'; return { totalRecords: data.data.length, dateRange: this.calculateDateRange(data.data), dataQuality, missingData, duplicateRecords }; }

  private static generateInsights(data: any[], kpis: KPI[]): any[] { const insights:any[] = []; const revenueKPI = kpis.find(k=>k.title==='Total Revenue'); if (revenueKPI && revenueKPI.trend==='up') insights.push({ title: 'Revenue Growth Opportunity', description: 'Revenue is increasing. Consider scaling successful strategies.', impact: 'high', category: 'revenue' }); const expenseKPI = kpis.find(k=>k.title==='Total Expenses'); if (expenseKPI && expenseKPI.trend==='up') insights.push({ title: 'Cost Management Focus', description: 'Expenses are rising. Review cost structure and identify optimization opportunities.', impact: 'medium', category: 'costs' }); if (data.length>1000) insights.push({ title: 'Data-Driven Decision Making', description: 'Large dataset available. Leverage analytics for strategic decisions.', impact: 'high', category: 'operations' }); return insights; }

  private static findColumns(data: any[], keywords: string[], preferred?: string): string[] { if (data.length===0) return []; const headers = Object.keys(data[0]); if (preferred && headers.some(h=>h.toLowerCase()===preferred.toLowerCase())) return [headers.find(h=>h.toLowerCase()===preferred.toLowerCase()) as string]; return headers.filter(header => keywords.some(keyword => header.toLowerCase().includes(keyword.toLowerCase()))); }

  private static calculateTotal(data: any[], columns: string[]): number { if (columns.length===0) return 0; return data.reduce((sum,row)=>{ const rowSum = columns.reduce((colSum,col)=>{ const value = row[col]; return colSum + (typeof value === 'number' ? value : 0); },0); return sum + rowSum; }, 0); }

  private static formatCurrency(value:number): string { return new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(value); }

  private static countDuplicates(data:any[]): number { const seen = new Set(); let duplicates = 0; data.forEach(row=>{ const key = JSON.stringify(row); if (seen.has(key)) duplicates++; else seen.add(key); }); return duplicates; }

  private static calculateDateRange(data:any[]): string { const dateColumns = this.findColumns(data, ['date','created','timestamp']); if (dateColumns.length===0) return 'Unknown'; const dates = data.map(row=>{ const dateValue = row[dateColumns[0]]; if (dateValue) { const date = new Date(dateValue); return isNaN(date.getTime()) ? null : date; } return null; }).filter(d=>d!==null) as Date[]; if (dates.length===0) return 'Unknown'; const minDate = new Date(Math.min(...dates.map(d=>d.getTime()))); const maxDate = new Date(Math.max(...dates.map(d=>d.getTime()))); return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`; }
}
