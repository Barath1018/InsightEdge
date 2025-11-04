"use strict";
/**
 * @fileOverview AI-powered insights service for business intelligence.
 * Provides natural language queries, anomaly detection, and smart recommendations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInsightsService = void 0;
class AIInsightsService {
    /**
     * Process natural language queries about business data
     */
    static async processNaturalLanguageQuery(query, data) {
        try {
            // Parse the query to understand intent
            const intent = this.parseQueryIntent(query);
            // Generate insights based on intent
            const insights = await this.generateInsightsFromIntent(intent, data);
            // Generate suggested follow-up queries
            const suggestedQueries = this.generateSuggestedQueries(intent, insights);
            return {
                query,
                response: insights,
                suggestedQueries
            };
        }
        catch (error) {
            console.error('Error processing natural language query:', error);
            throw new Error('Failed to process query');
        }
    }
    /**
     * Detect anomalies in business data
     */
    static async detectAnomalies(data) {
        const anomalies = [];
        if (data.length === 0)
            return anomalies;
        const numericFields = this.getNumericFields(data);
        for (const field of numericFields) {
            const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
            if (values.length < 3)
                continue; // Need at least 3 values for statistical analysis
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            // Detect outliers (values beyond 2 standard deviations)
            const threshold = 2;
            const outliers = values.filter(val => Math.abs(val - mean) > threshold * stdDev);
            for (const outlier of outliers) {
                const severity = Math.abs(outlier - mean) > 3 * stdDev ? 'high' :
                    Math.abs(outlier - mean) > 2.5 * stdDev ? 'medium' : 'low';
                anomalies.push({
                    field,
                    value: outlier,
                    expectedRange: [mean - threshold * stdDev, mean + threshold * stdDev],
                    severity,
                    description: this.generateAnomalyDescription(field, outlier, mean, stdDev),
                    timestamp: new Date()
                });
            }
        }
        return anomalies;
    }
    /**
     * Generate forecasts for business metrics
     */
    static async generateForecasts(data) {
        const forecasts = [];
        if (data.length < 10)
            return forecasts; // Need sufficient data for forecasting
        const numericFields = this.getNumericFields(data);
        for (const field of numericFields) {
            const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
            if (values.length < 10)
                continue;
            // Simple linear regression for forecasting
            const forecast = this.performLinearRegression(values);
            if (forecast) {
                const currentValue = values[values.length - 1];
                const trend = forecast.slope > 0 ? 'increasing' :
                    forecast.slope < 0 ? 'decreasing' : 'stable';
                forecasts.push({
                    field,
                    currentValue,
                    predictedValue: forecast.prediction,
                    confidence: forecast.confidence,
                    trend,
                    factors: this.identifyTrendFactors(field, data)
                });
            }
        }
        return forecasts;
    }
    /**
     * Generate correlation analysis between different metrics
     */
    static async analyzeCorrelations(data) {
        const insights = [];
        if (data.length < 10)
            return insights;
        const numericFields = this.getNumericFields(data);
        for (let i = 0; i < numericFields.length; i++) {
            for (let j = i + 1; j < numericFields.length; j++) {
                const field1 = numericFields[i];
                const field2 = numericFields[j];
                const correlation = this.calculateCorrelation(data, field1, field2);
                if (Math.abs(correlation) > 0.7) { // Strong correlation threshold
                    const insight = {
                        type: 'correlation',
                        title: `Strong ${correlation > 0 ? 'Positive' : 'Negative'} Correlation`,
                        description: `${field1} and ${field2} show a ${correlation > 0 ? 'strong positive' : 'strong negative'} correlation (${correlation.toFixed(2)}). This suggests that changes in one metric may influence the other.`,
                        confidence: Math.abs(correlation) * 100,
                        impact: Math.abs(correlation) > 0.8 ? 'high' : 'medium',
                        category: this.categorizeField(field1),
                        data: data.slice(-20), // Last 20 data points
                        visualization: 'chart',
                        actionable: true,
                        actionItems: [
                            `Investigate the relationship between ${field1} and ${field2}`,
                            `Consider how optimizing one metric might affect the other`,
                            `Monitor both metrics together for better insights`
                        ]
                    };
                    insights.push(insight);
                }
            }
        }
        return insights;
    }
    /**
     * Generate actionable business recommendations
     */
    static async generateRecommendations(data, kpis, anomalies) {
        const recommendations = [];
        // Revenue optimization recommendations
        const revenueFields = this.getRevenueFields(data);
        if (revenueFields.length > 0) {
            const revenueTrend = this.analyzeTrend(data, revenueFields[0]);
            if (revenueTrend === 'decreasing') {
                recommendations.push({
                    type: 'recommendation',
                    title: 'Revenue Decline Alert',
                    description: 'Revenue is showing a declining trend. Consider reviewing pricing strategies, customer retention, and market conditions.',
                    confidence: 85,
                    impact: 'high',
                    category: 'revenue',
                    data: data.slice(-30),
                    visualization: 'chart',
                    actionable: true,
                    actionItems: [
                        'Review pricing strategy and competitive positioning',
                        'Analyze customer churn and retention metrics',
                        'Investigate market trends and customer feedback',
                        'Consider new revenue streams or product offerings'
                    ]
                });
            }
        }
        // Cost optimization recommendations
        const costFields = this.getCostFields(data);
        if (costFields.length > 0) {
            const costTrend = this.analyzeTrend(data, costFields[0]);
            if (costTrend === 'increasing') {
                recommendations.push({
                    type: 'recommendation',
                    title: 'Cost Optimization Opportunity',
                    description: 'Costs are trending upward. Identify areas for cost reduction and efficiency improvements.',
                    confidence: 80,
                    impact: 'medium',
                    category: 'costs',
                    data: data.slice(-30),
                    visualization: 'chart',
                    actionable: true,
                    actionItems: [
                        'Conduct cost structure analysis',
                        'Identify inefficiencies in operations',
                        'Negotiate better terms with suppliers',
                        'Implement cost control measures'
                    ]
                });
            }
        }
        // Anomaly-based recommendations
        for (const anomaly of anomalies.filter(a => a.severity === 'high')) {
            recommendations.push({
                type: 'recommendation',
                title: `Investigate ${anomaly.field} Anomaly`,
                description: `Unusual activity detected in ${anomaly.field}. This requires immediate attention to understand the cause.`,
                confidence: 90,
                impact: 'high',
                category: this.categorizeField(anomaly.field),
                data: data.slice(-10),
                visualization: 'metric',
                actionable: true,
                actionItems: [
                    `Investigate the cause of the ${anomaly.field} anomaly`,
                    'Review recent changes or events that might explain this',
                    'Implement monitoring to prevent similar issues',
                    'Document findings for future reference'
                ]
            });
        }
        return recommendations;
    }
    // Private helper methods
    static parseQueryIntent(query) {
        const lowerQuery = query.toLowerCase();
        // Revenue-related queries
        if (lowerQuery.includes('revenue') || lowerQuery.includes('sales') || lowerQuery.includes('income')) {
            return { type: 'revenue', focus: 'financial' };
        }
        // Cost-related queries
        if (lowerQuery.includes('cost') || lowerQuery.includes('expense') || lowerQuery.includes('spending')) {
            return { type: 'costs', focus: 'financial' };
        }
        // Customer-related queries
        if (lowerQuery.includes('customer') || lowerQuery.includes('client') || lowerQuery.includes('user')) {
            return { type: 'customers', focus: 'behavior' };
        }
        // Trend-related queries
        if (lowerQuery.includes('trend') || lowerQuery.includes('pattern') || lowerQuery.includes('change')) {
            return { type: 'trend', focus: 'analysis' };
        }
        // Performance-related queries
        if (lowerQuery.includes('performance') || lowerQuery.includes('kpi') || lowerQuery.includes('metric')) {
            return { type: 'performance', focus: 'measurement' };
        }
        return { type: 'general', focus: 'overview' };
    }
    static async generateInsightsFromIntent(intent, data) {
        const insights = [];
        switch (intent.type) {
            case 'revenue':
                insights.push(...await this.generateRevenueInsights(data));
                break;
            case 'costs':
                insights.push(...await this.generateCostInsights(data));
                break;
            case 'customers':
                insights.push(...await this.generateCustomerInsights(data));
                break;
            case 'trend':
                insights.push(...await this.generateTrendInsights(data));
                break;
            case 'performance':
                insights.push(...await this.generatePerformanceInsights(data));
                break;
            default:
                insights.push(...await this.generateGeneralInsights(data));
        }
        return insights;
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
    static getNumericFields(data) {
        if (data.length === 0)
            return [];
        return Object.keys(data[0]).filter(key => {
            const sampleValue = data[0][key];
            return typeof sampleValue === 'number' || !isNaN(Number(sampleValue));
        });
    }
    static getRevenueFields(data) {
        return this.getNumericFields(data).filter(field => field.toLowerCase().includes('revenue') ||
            field.toLowerCase().includes('sales') ||
            field.toLowerCase().includes('income'));
    }
    static getCostFields(data) {
        return this.getNumericFields(data).filter(field => field.toLowerCase().includes('cost') ||
            field.toLowerCase().includes('expense') ||
            field.toLowerCase().includes('spending'));
    }
    static generateAnomalyDescription(field, value, mean, stdDev) {
        const deviation = Math.abs(value - mean);
        const severity = deviation > 3 * stdDev ? 'extremely' :
            deviation > 2.5 * stdDev ? 'highly' : 'moderately';
        return `The ${field} value of ${value.toFixed(2)} is ${severity} unusual, deviating ${deviation.toFixed(2)} from the expected range of ${(mean - 2 * stdDev).toFixed(2)} to ${(mean + 2 * stdDev).toFixed(2)}.`;
    }
    static performLinearRegression(values) {
        if (values.length < 2)
            return null;
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
        const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const prediction = slope * n + intercept;
        const confidence = Math.max(0, Math.min(100, 100 - Math.abs(slope) * 10));
        return { slope, intercept, prediction, confidence };
    }
    static identifyTrendFactors(field, data) {
        const factors = [];
        // Add common business factors
        factors.push('Market conditions', 'Seasonal patterns', 'Business strategy changes');
        // Add field-specific factors
        if (field.toLowerCase().includes('revenue')) {
            factors.push('Pricing changes', 'Customer acquisition', 'Product performance');
        }
        else if (field.toLowerCase().includes('cost')) {
            factors.push('Supplier changes', 'Operational efficiency', 'Inflation');
        }
        return factors;
    }
    static calculateCorrelation(data, field1, field2) {
        const values1 = data.map(row => Number(row[field1])).filter(val => !isNaN(val));
        const values2 = data.map(row => Number(row[field2])).filter(val => !isNaN(val));
        if (values1.length !== values2.length || values1.length < 2)
            return 0;
        const n = values1.length;
        const sum1 = values1.reduce((sum, val) => sum + val, 0);
        const sum2 = values2.reduce((sum, val) => sum + val, 0);
        const sum1Sq = values1.reduce((sum, val) => sum + val * val, 0);
        const sum2Sq = values2.reduce((sum, val) => sum + val * val, 0);
        const sum12 = values1.reduce((sum, val, i) => sum + val * values2[i], 0);
        const numerator = n * sum12 - sum1 * sum2;
        const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
        return denominator === 0 ? 0 : numerator / denominator;
    }
    static categorizeField(field) {
        const lowerField = field.toLowerCase();
        if (lowerField.includes('revenue') || lowerField.includes('sales') || lowerField.includes('income')) {
            return 'revenue';
        }
        else if (lowerField.includes('cost') || lowerField.includes('expense') || lowerField.includes('spending')) {
            return 'costs';
        }
        else if (lowerField.includes('customer') || lowerField.includes('client') || lowerField.includes('user')) {
            return 'customers';
        }
        else if (lowerField.includes('marketing') || lowerField.includes('campaign') || lowerField.includes('ad')) {
            return 'marketing';
        }
        else {
            return 'operations';
        }
    }
    static analyzeTrend(data, field) {
        const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
        if (values.length < 3)
            return 'stable';
        const recentValues = values.slice(-3);
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        const change = secondHalfAvg - firstHalfAvg;
        const threshold = firstHalfAvg * 0.05; // 5% threshold
        if (change > threshold)
            return 'increasing';
        if (change < -threshold)
            return 'decreasing';
        return 'stable';
    }
    // Specific insight generation methods
    static async generateRevenueInsights(data) {
        const insights = [];
        const revenueFields = this.getRevenueFields(data);
        if (revenueFields.length > 0) {
            const field = revenueFields[0];
            const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
            if (values.length > 5) {
                const trend = this.analyzeTrend(data, field);
                const currentValue = values[values.length - 1];
                const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                insights.push({
                    type: 'trend',
                    title: `Revenue Trend Analysis`,
                    description: `${field} is currently ${trend}. Current value: ${currentValue.toFixed(2)}, Average: ${avgValue.toFixed(2)}`,
                    confidence: 85,
                    impact: trend === 'decreasing' ? 'high' : trend === 'increasing' ? 'medium' : 'low',
                    category: 'revenue',
                    data: data.slice(-10),
                    visualization: 'chart',
                    actionable: true,
                    actionItems: [
                        'Monitor revenue trends closely',
                        'Analyze factors affecting revenue performance',
                        'Consider revenue optimization strategies'
                    ]
                });
            }
        }
        return insights;
    }
    static async generateCostInsights(data) {
        const insights = [];
        const costFields = this.getCostFields(data);
        if (costFields.length > 0) {
            const field = costFields[0];
            const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
            if (values.length > 5) {
                const trend = this.analyzeTrend(data, field);
                const currentValue = values[values.length - 1];
                const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                insights.push({
                    type: 'trend',
                    title: `Cost Analysis`,
                    description: `${field} is currently ${trend}. Current value: ${currentValue.toFixed(2)}, Average: ${avgValue.toFixed(2)}`,
                    confidence: 82,
                    impact: trend === 'increasing' ? 'high' : 'medium',
                    category: 'costs',
                    data: data.slice(-10),
                    visualization: 'chart',
                    actionable: true,
                    actionItems: [
                        'Review cost structure and identify optimization opportunities',
                        'Implement cost control measures where necessary',
                        'Monitor cost trends and their impact on profitability'
                    ]
                });
            }
        }
        return insights;
    }
    static async generateCustomerInsights(data) {
        const insights = [];
        const customerFields = this.getNumericFields(data).filter(field => field.toLowerCase().includes('customer') ||
            field.toLowerCase().includes('user') ||
            field.toLowerCase().includes('client'));
        if (customerFields.length > 0) {
            const field = customerFields[0];
            const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
            if (values.length > 3) {
                const totalCustomers = values.reduce((sum, val) => sum + val, 0);
                const avgCustomers = totalCustomers / values.length;
                insights.push({
                    type: 'trend',
                    title: `Customer Analysis`,
                    description: `Analyzing ${field}: Total customers: ${totalCustomers.toFixed(0)}, Average: ${avgCustomers.toFixed(1)}`,
                    confidence: 78,
                    impact: 'medium',
                    category: 'customers',
                    data: data.slice(-10),
                    visualization: 'chart',
                    actionable: true,
                    actionItems: [
                        'Analyze customer acquisition and retention patterns',
                        'Identify high-value customer segments',
                        'Develop customer-focused strategies'
                    ]
                });
            }
        }
        return insights;
    }
    static async generateTrendInsights(data) {
        const insights = [];
        const numericFields = this.getNumericFields(data);
        for (const field of numericFields.slice(0, 3)) { // Analyze top 3 fields
            const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
            if (values.length > 3) {
                const trend = this.analyzeTrend(data, field);
                const recentChange = values.length > 1 ?
                    ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2] * 100) : 0;
                insights.push({
                    type: 'trend',
                    title: `${field} Trend`,
                    description: `${field} is showing a ${trend} trend with ${recentChange.toFixed(1)}% recent change`,
                    confidence: 75,
                    impact: Math.abs(recentChange) > 10 ? 'high' : Math.abs(recentChange) > 5 ? 'medium' : 'low',
                    category: this.categorizeField(field),
                    data: data.slice(-10),
                    visualization: 'chart',
                    actionable: true,
                    actionItems: [
                        `Monitor ${field} trends closely`,
                        'Investigate factors driving the trend',
                        'Plan appropriate response strategies'
                    ]
                });
            }
        }
        return insights;
    }
    static async generatePerformanceInsights(data) {
        const insights = [];
        const numericFields = this.getNumericFields(data);
        if (numericFields.length > 0) {
            // Calculate overall performance metrics
            const performanceData = numericFields.map(field => {
                const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));
                const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
                return { field, avg, variance, stability: variance < avg * 0.1 ? 'stable' : 'volatile' };
            });
            const stableMetrics = performanceData.filter(p => p.stability === 'stable');
            const volatileMetrics = performanceData.filter(p => p.stability === 'volatile');
            insights.push({
                type: 'recommendation',
                title: 'Performance Overview',
                description: `Found ${stableMetrics.length} stable metrics and ${volatileMetrics.length} volatile metrics in your data`,
                confidence: 85,
                impact: volatileMetrics.length > stableMetrics.length ? 'high' : 'medium',
                category: 'operations',
                data: data.slice(-10),
                visualization: 'metric',
                actionable: true,
                actionItems: [
                    'Focus on stabilizing volatile metrics',
                    'Leverage stable metrics for consistent growth',
                    'Implement performance monitoring systems'
                ]
            });
        }
        return insights;
    }
    static async generateGeneralInsights(data) {
        const insights = [];
        // General data quality and structure insights
        const numericFields = this.getNumericFields(data);
        const totalFields = Object.keys(data[0] || {}).length;
        const dataQuality = numericFields.length / totalFields;
        insights.push({
            type: 'recommendation',
            title: 'Data Quality Assessment',
            description: `Your dataset contains ${data.length} records with ${totalFields} fields. ${(dataQuality * 100).toFixed(0)}% of fields contain numeric data suitable for analysis.`,
            confidence: 95,
            impact: dataQuality > 0.5 ? 'low' : 'medium',
            category: 'operations',
            data: data.slice(0, 5),
            visualization: 'table',
            actionable: true,
            actionItems: [
                'Ensure data consistency across all records',
                'Consider adding more quantitative metrics for deeper analysis',
                'Regular data quality audits recommended'
            ]
        });
        return insights;
    }
}
exports.AIInsightsService = AIInsightsService;
