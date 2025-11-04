
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonthlySalesPerformanceChart } from '@/components/dashboard/monthly-sales-performance-chart';
import { ProfitTrendAnalysisChart } from '@/components/dashboard/profit-trend-analysis-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessData } from '@/contexts/business-data-context';
import { AIInsightsService } from '@/services/ai-insights-service';
import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, BarChart3, Brain, Sparkles, Upload } from 'lucide-react';

export default function AnalyticsPage() {
  const { businessData, analyzedMetrics, isProcessing: loading, setBusinessData } = useBusinessData();
  const [insights, setInsights] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate AI insights when business data is available
  useEffect(() => {
    if (businessData && !loading) {
      generateInsights();
    }
  }, [businessData, loading]);

  // Ensure analytics can hydrate from localStorage if routed directly
  useEffect(() => {
    if (!businessData && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('businessData');
        if (stored) {
          const parsed = JSON.parse(stored);
          // do not block; setBusinessData also persists
          setBusinessData(parsed);
        }
      } catch {}
    }
  }, [businessData, setBusinessData]);

  const generateInsights = async () => {
    if (!businessData) return;
    
    setIsAnalyzing(true);
    try {
      const [detectedAnomalies, correlations, generatedForecasts] = await Promise.all([
        AIInsightsService.detectAnomalies(businessData.data),
        AIInsightsService.analyzeCorrelations(businessData.data),
        AIInsightsService.generateForecasts(businessData.data)
      ]);
      
      setAnomalies(detectedAnomalies);
      setInsights(correlations);
      setForecasts(generatedForecasts);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          AI-powered analytics based on your uploaded business data
        </p>
      </div>
      <main className="flex flex-1 flex-col gap-4 pt-4 sm:px-6 sm:py-0 md:gap-8">
        {loading || !businessData ? (
          <div className="text-center py-16">
            <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Upload your business data to access AI-powered analytics and insights
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Data Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing {businessData.data.length.toLocaleString()} records with AI
                </p>
              </div>
              <Button
                onClick={generateInsights}
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
            </div>

            {/* Charts based on uploaded data */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Monthly Sales Performance</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  {analyzedMetrics?.chartData ? (
                    <MonthlySalesPerformanceChart data={analyzedMetrics.chartData} />
                  ) : (
                    <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                      Generate analytics to see charts
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Profit Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  {analyzedMetrics?.chartData ? (
                    <ProfitTrendAnalysisChart data={analyzedMetrics.chartData} />
                  ) : (
                    <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                      Generate analytics to see charts
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI-Generated Insights */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
              {/* Insights Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Insights ({insights.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No insights generated yet</p>
                  ) : (
                    <div className="space-y-3">
                      {insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-800 text-sm">{insight.title}</p>
                          <p className="text-xs text-blue-600 mt-1">{insight.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {insight.confidence.toFixed(0)}% confidence
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Anomalies Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Anomalies ({anomalies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {anomalies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No anomalies detected</p>
                  ) : (
                    <div className="space-y-3">
                      {anomalies.slice(0, 3).map((anomaly, index) => (
                        <div key={index} className="p-3 bg-orange-50 rounded-lg">
                          <p className="font-medium text-orange-800 text-sm">{anomaly.field}</p>
                          <p className="text-xs text-orange-600 mt-1">{anomaly.description}</p>
                          <Badge 
                            variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'} 
                            className="mt-2 text-xs"
                          >
                            {anomaly.severity} severity
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Forecasts Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Forecasts ({forecasts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {forecasts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No forecasts available</p>
                  ) : (
                    <div className="space-y-3">
                      {forecasts.slice(0, 3).map((forecast, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-800 text-sm">{forecast.field}</p>
                          <p className="text-xs text-green-600 mt-1">
                            Trend: {forecast.trend} ({forecast.confidence.toFixed(0)}% confidence)
                          </p>
                          <div className="flex justify-between mt-2 text-xs">
                            <span>Current: {forecast.currentValue.toFixed(2)}</span>
                            <span>Predicted: {forecast.predictedValue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Removed "Sales By Category" and "Data Summary" cards per request */}
          </div>
        )}
      </main>
    </>
  );
}
