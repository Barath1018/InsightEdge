"use strict";
/**
 * Copied subset of AIInsightsService for backend vendor bundle.
 * Kept implementation identical so backend can run standalone.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInsightsService = void 0;
class AIInsightsService {
    static async processNaturalLanguageQuery(query, data) {
        try {
            const intent = this.parseQueryIntent(query);
            const insights = await this.generateInsightsFromIntent(intent, data);
            const suggestedQueries = this.generateSuggestedQueries(intent, insights);
            return { query, response: insights, suggestedQueries };
        }
        catch (error) {
            console.error('Error processing natural language query:', error);
            throw new Error('Failed to process query');
        }
    }
    // The rest of the implementation mirrors the original service in src/services
    // For brevity, only include the helper signatures and small implementations used by server.
    static parseQueryIntent(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('revenue') || lowerQuery.includes('sales') || lowerQuery.includes('income'))
            return { type: 'revenue', focus: 'financial' };
        if (lowerQuery.includes('cost') || lowerQuery.includes('expense') || lowerQuery.includes('spending'))
            return { type: 'costs', focus: 'financial' };
        if (lowerQuery.includes('customer') || lowerQuery.includes('client') || lowerQuery.includes('user'))
            return { type: 'customers', focus: 'behavior' };
        if (lowerQuery.includes('trend') || lowerQuery.includes('pattern') || lowerQuery.includes('change'))
            return { type: 'trend', focus: 'analysis' };
        if (lowerQuery.includes('performance') || lowerQuery.includes('kpi') || lowerQuery.includes('metric'))
            return { type: 'performance', focus: 'measurement' };
        return { type: 'general', focus: 'overview' };
    }
    static async generateInsightsFromIntent(intent, data) {
        switch (intent.type) {
            case 'revenue': return this.generateRevenueInsights(data);
            case 'costs': return this.generateCostInsights(data);
            case 'customers': return this.generateCustomerInsights(data);
            case 'trend': return this.generateTrendInsights(data);
            case 'performance': return this.generatePerformanceInsights(data);
            default: return this.generateGeneralInsights(data);
        }
    }
    static generateSuggestedQueries(intent, insights) {
        const suggestions = [];
        switch (intent.type) {
            case 'revenue':
                suggestions.push('What caused the revenue change?', 'How does revenue compare to last month?', 'Which products contribute most to revenue?');
                break;
            case 'costs':
                suggestions.push('Where are costs increasing the most?', 'How can we optimize our cost structure?', 'What is the cost per customer?');
                break;
            case 'customers':
                suggestions.push('Who are our most valuable customers?', 'What is the customer retention rate?', 'How do customers behave differently?');
                break;
        }
        return suggestions;
    }
    static getNumericFields(data) { if (data.length === 0)
        return []; return Object.keys(data[0]).filter(key => { const sampleValue = data[0][key]; return typeof sampleValue === 'number' || !isNaN(Number(sampleValue)); }); }
    static getRevenueFields(data) { return this.getNumericFields(data).filter(field => field.toLowerCase().includes('revenue') || field.toLowerCase().includes('sales') || field.toLowerCase().includes('income')); }
    static getCostFields(data) { return this.getNumericFields(data).filter(field => field.toLowerCase().includes('cost') || field.toLowerCase().includes('expense') || field.toLowerCase().includes('spending')); }
    static async generateRevenueInsights(data) { const insights = []; const revenueFields = this.getRevenueFields(data); if (revenueFields.length > 0) {
        const field = revenueFields[0];
        const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
        if (values.length > 5) {
            const trend = this.analyzeTrend(data, field);
            const currentValue = values[values.length - 1];
            const avgValue = values.reduce((s, v) => s + v, 0) / values.length;
            insights.push({ type: 'trend', title: `Revenue Trend Analysis`, description: `${field} is currently ${trend}. Current value: ${currentValue.toFixed(2)}, Average: ${avgValue.toFixed(2)}`, confidence: 85, impact: trend === 'decreasing' ? 'high' : trend === 'increasing' ? 'medium' : 'low', category: 'revenue', data: data.slice(-10), visualization: 'chart', actionable: true, actionItems: ['Monitor revenue trends closely', 'Analyze factors affecting revenue performance', 'Consider revenue optimization strategies'] });
        }
    } return insights; }
    static async generateCostInsights(data) { const insights = []; const costFields = this.getCostFields(data); if (costFields.length > 0) {
        const field = costFields[0];
        const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
        if (values.length > 5) {
            const trend = this.analyzeTrend(data, field);
            const currentValue = values[values.length - 1];
            const avgValue = values.reduce((s, v) => s + v, 0) / values.length;
            insights.push({ type: 'trend', title: `Cost Analysis`, description: `${field} is currently ${trend}. Current value: ${currentValue.toFixed(2)}, Average: ${avgValue.toFixed(2)}`, confidence: 82, impact: trend === 'increasing' ? 'high' : 'medium', category: 'costs', data: data.slice(-10), visualization: 'chart', actionable: true, actionItems: ['Review cost structure and identify optimization opportunities', 'Implement cost control measures where necessary', 'Monitor cost trends and their impact on profitability'] });
        }
    } return insights; }
    static async generateCustomerInsights(data) { const insights = []; const customerFields = this.getNumericFields(data).filter(field => field.toLowerCase().includes('customer') || field.toLowerCase().includes('user') || field.toLowerCase().includes('client')); if (customerFields.length > 0) {
        const field = customerFields[0];
        const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
        if (values.length > 3) {
            const totalCustomers = values.reduce((s, v) => s + v, 0);
            const avgCustomers = totalCustomers / values.length;
            insights.push({ type: 'trend', title: `Customer Analysis`, description: `Analyzing ${field}: Total customers: ${totalCustomers.toFixed(0)}, Average: ${avgCustomers.toFixed(1)}`, confidence: 78, impact: 'medium', category: 'customers', data: data.slice(-10), visualization: 'chart', actionable: true, actionItems: ['Analyze customer acquisition and retention patterns', 'Identify high-value customer segments', 'Develop customer-focused strategies'] });
        }
    } return insights; }
    static async generateTrendInsights(data) { const insights = []; const numericFields = this.getNumericFields(data); for (const field of numericFields.slice(0, 3)) {
        const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
        if (values.length > 3) {
            const trend = this.analyzeTrend(data, field);
            const recentChange = values.length > 1 ? ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2] * 100) : 0;
            insights.push({ type: 'trend', title: `${field} Trend`, description: `${field} is showing a ${trend} trend with ${recentChange.toFixed(1)}% recent change`, confidence: 75, impact: Math.abs(recentChange) > 10 ? 'high' : Math.abs(recentChange) > 5 ? 'medium' : 'low', category: this.categorizeField(field), data: data.slice(-10), visualization: 'chart', actionable: true, actionItems: [`Monitor ${field} trends closely`, `Investigate factors driving the trend`, `Plan appropriate response strategies`] });
        }
    } return insights; }
    static async generatePerformanceInsights(data) { const insights = []; const numericFields = this.getNumericFields(data); if (numericFields.length > 0) {
        const performanceData = numericFields.map(field => { const values = data.map(row => Number(row[field])).filter(val => !isNaN(val)); const avg = values.reduce((s, v) => s + v, 0) / values.length; const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length; return { field, avg, variance, stability: variance < avg * 0.1 ? 'stable' : 'volatile' }; });
        const stableMetrics = performanceData.filter(p => p.stability === 'stable');
        const volatileMetrics = performanceData.filter(p => p.stability === 'volatile');
        insights.push({ type: 'recommendation', title: 'Performance Overview', description: `Found ${stableMetrics.length} stable metrics and ${volatileMetrics.length} volatile metrics in your data`, confidence: 85, impact: volatileMetrics.length > stableMetrics.length ? 'high' : 'medium', category: 'operations', data: data.slice(-10), visualization: 'metric', actionable: true, actionItems: ['Focus on stabilizing volatile metrics', 'Leverage stable metrics for consistent growth', 'Implement performance monitoring systems'] });
    } return insights; }
    static async generateGeneralInsights(data) { const insights = []; const numericFields = this.getNumericFields(data); const totalFields = Object.keys(data[0] || {}).length; const dataQuality = numericFields.length / totalFields; insights.push({ type: 'recommendation', title: 'Data Quality Assessment', description: `Your dataset contains ${data.length} records with ${totalFields} fields. ${(dataQuality * 100).toFixed(0)}% of fields contain numeric data suitable for analysis.`, confidence: 95, impact: dataQuality > 0.5 ? 'low' : 'medium', category: 'operations', data: data.slice(0, 5), visualization: 'table', actionable: true, actionItems: ['Ensure data consistency across all records', 'Consider adding more quantitative metrics for deeper analysis', 'Regular data quality audits recommended'] }); return insights; }
    static calculateCorrelation(data, field1, field2) { const values1 = data.map(row => Number(row[field1])).filter(val => !isNaN(val)); const values2 = data.map(row => Number(row[field2])).filter(val => !isNaN(val)); if (values1.length !== values2.length || values1.length < 2)
        return 0; const n = values1.length; const sum1 = values1.reduce((s, v) => s + v, 0); const sum2 = values2.reduce((s, v) => s + v, 0); const sum1Sq = values1.reduce((s, v) => s + v * v, 0); const sum2Sq = values2.reduce((s, v) => s + v * v, 0); const sum12 = values1.reduce((s, v, i) => s + v * values2[i], 0); const numerator = n * sum12 - sum1 * sum2; const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2)); return denominator === 0 ? 0 : numerator / denominator; }
    static categorizeField(field) { const lowerField = field.toLowerCase(); if (lowerField.includes('revenue') || lowerField.includes('sales') || lowerField.includes('income'))
        return 'revenue'; if (lowerField.includes('cost') || lowerField.includes('expense') || lowerField.includes('spending'))
        return 'costs'; if (lowerField.includes('customer') || lowerField.includes('client') || lowerField.includes('user'))
        return 'customers'; if (lowerField.includes('marketing') || lowerField.includes('campaign') || lowerField.includes('ad'))
        return 'marketing'; return 'operations'; }
    static analyzeTrend(data, field) { const values = data.map(row => Number(row[field])).filter(val => !isNaN(val)); if (values.length < 3)
        return 'stable'; const recentValues = values.slice(-3); const firstHalf = values.slice(0, Math.floor(values.length / 2)); const secondHalf = values.slice(Math.floor(values.length / 2)); const firstHalfAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length; const secondHalfAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length; const change = secondHalfAvg - firstHalfAvg; const threshold = firstHalfAvg * 0.05; if (change > threshold)
        return 'increasing'; if (change < -threshold)
        return 'decreasing'; return 'stable'; }
}
exports.AIInsightsService = AIInsightsService;
