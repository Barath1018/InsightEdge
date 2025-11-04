'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, MessageSquare, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIInsightsService, NaturalLanguageQuery, AIInsight, AnomalyDetection, ForecastData } from '@/services/ai-insights-service';
import { BusinessData } from '@/services/data-analysis-service';

interface AIQueryInterfaceProps {
  data: BusinessData;
}

const suggestedQueries = [
  'What is the revenue trend?',
  'Show me cost anomalies',
  'How are customers performing?',
  'What caused the recent changes?',
  'Predict next month\'s performance',
  'Find correlations in the data',
  'Generate business recommendations',
  'Analyze seasonal patterns'
];

export function AIQueryInterface({ data }: AIQueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  // Gemini integration temporarily disabled: we run locally only
  const [queryHistory, setQueryHistory] = useState<NaturalLanguageQuery[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [allInsights, setAllInsights] = useState<AIInsight[]>([]);
  const [lastAnswer, setLastAnswer] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'query' | 'insights' | 'anomalies' | 'forecasts'>('query');

  // Persist and restore query history and insights so they survive refresh
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('aiQueryHistory');
      const savedInsights = localStorage.getItem('aiAllInsights');
      const savedAnswer = localStorage.getItem('aiLastAnswer');
      if (savedHistory) setQueryHistory(JSON.parse(savedHistory));
      if (savedInsights) setAllInsights(JSON.parse(savedInsights));
      if (savedAnswer) setLastAnswer(savedAnswer);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('aiQueryHistory', JSON.stringify(queryHistory.slice(0, 10))); } catch {}
  }, [queryHistory]);

  useEffect(() => {
    try { localStorage.setItem('aiAllInsights', JSON.stringify(allInsights.slice(0, 50))); } catch {}
  }, [allInsights]);

  useEffect(() => {
    try {
      if (lastAnswer) localStorage.setItem('aiLastAnswer', lastAnswer);
    } catch {}
  }, [lastAnswer]);

  // Check Gemini status from /api/ai/status and show badge
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/ai/status');
        if (res.ok) {
          const j = await res.json();
          setGeminiEnabled(Boolean(j.enabled));
        }
      } catch (e) {
        console.warn('Failed to fetch AI status', e);
      }
    }
    fetchStatus();
  }, []);
 
  const handleQuery = async () => {
    if (!query.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Always call the unified server ask endpoint first (it uses Gemini when available and falls back locally)
      let finalResult: NaturalLanguageQuery | null = null;
      try {
        const askRes = await fetch('/api/ai/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, dataset: { headers: data.headers, data: data.data.slice(0, 500) } })
        });
        if (askRes.ok) {
          const resp = await askRes.json();
          // resp shape: { answer?: string, insights?: [{title,description,type,impact,confidence,actionItems}] | string[], suggestedQueries?: [] }
          const mappedInsights = (resp.insights || []).map((ins: any) => {
            // Handle both object-shaped insights and plain string insights
            if (typeof ins === 'string') {
              const title = ins.length > 60 ? `${ins.slice(0, 60)}…` : ins || 'Insight';
              return {
                type: 'recommendation',
                title,
                description: ins,
                confidence: 75,
                impact: 'medium',
                category: 'operations',
                data: [],
                visualization: 'chart',
                actionable: false,
                actionItems: []
              } as AIInsight;
            }

            return {
              type: ins.type || 'recommendation',
              title: ins.title || (ins.description ? ins.description.slice(0, 60) : 'Insight'),
              description: ins.description || '',
              confidence: (typeof ins.confidence === 'number' ? ins.confidence : (ins.confidence ? Number(ins.confidence) : 75)),
              impact: ins.impact || 'medium',
              category: 'operations',
              data: [],
              visualization: 'chart',
              actionable: Array.isArray(ins.actionItems) && ins.actionItems.length > 0,
              actionItems: ins.actionItems || []
            } as AIInsight;
          });

          finalResult = {
            query,
            response: mappedInsights,
            suggestedQueries: resp.suggestedQueries || [],
            answer: typeof resp.answer === 'string' ? resp.answer : undefined
          } as NaturalLanguageQuery;
        }
      } catch (remoteErr) {
        console.warn('Remote Gemini query failed, falling back to local', remoteErr);
      }

      // Fallback to local processing if remote didn't produce a result
      if (!finalResult) {
        finalResult = await AIInsightsService.processNaturalLanguageQuery(query, data.data);
      }

      if (finalResult) {
        setQueryHistory((prev) => [finalResult as NaturalLanguageQuery, ...prev].slice(0, 10));
        setAllInsights(prev => {
          const newInsights = (finalResult as NaturalLanguageQuery).response.filter(insight => 
            !prev.some(existing => existing.title === insight.title && existing.description === insight.description)
          );
          return [...newInsights, ...prev];
        });
        setLastAnswer(finalResult.answer);
        // After a successful query, switch to Query Results tab so the user sees the answer immediately
        setActiveTab('query');
      }
      
      setQuery('');
    } catch (error) {
      console.error('Query failed:', error);
      try {
        // Minimal UX feedback so users know something went wrong
        alert('AI query failed. Please try again.');
      } catch {}
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
  };

  const loadAnomalies = async () => {
    if (anomalies.length === 0) {
      const detectedAnomalies = await AIInsightsService.detectAnomalies(data.data);
      setAnomalies(detectedAnomalies);
    }
  };

  const loadForecasts = async () => {
    if (forecasts.length === 0) {
      const generatedForecasts = await AIInsightsService.generateForecasts(data.data);
      setForecasts(generatedForecasts);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case 'correlation':
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      case 'forecast':
        return <Sparkles className="h-5 w-5 text-green-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Powered Business Intelligence
          </div>
          <div className="flex items-center gap-2">
            {geminiEnabled ? (
              <Badge className="text-xs">Gemini: On</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Gemini: Off</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Interface */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your business data..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleQuery} 
                  disabled={isProcessing || !query.trim()}
                  size="sm"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Analyzing your data...</p>
                </div>
              )}
            </div>

            {/* Suggested Queries */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Suggested Questions</h4>
              <div className="space-y-2">
                {suggestedQueries.map((suggestedQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleSuggestedQuery(suggestedQuery)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    {suggestedQuery}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab('anomalies');
                    loadAnomalies();
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Detect Anomalies
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab('forecasts');
                    loadForecasts();
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Forecasts
                </Button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2">
            <div className="flex space-x-1 mb-4">
              <Button
                variant={activeTab === 'query' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('query')}
              >
                Query Results
              </Button>
              <Button
                variant={activeTab === 'insights' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('insights')}
              >
                AI Insights
              </Button>
              <Button
                variant={activeTab === 'anomalies' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTab('anomalies');
                  loadAnomalies();
                }}
              >
                Anomalies
              </Button>
              <Button
                variant={activeTab === 'forecasts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTab('forecasts');
                  loadForecasts();
                }}
              >
                Forecasts
              </Button>
            </div>

            {/* Query Results */}
            {activeTab === 'query' && (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {queryHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3" />
                      <p>Ask a question about your business data to get started</p>
                    </div>
                  ) : (
                    queryHistory.map((queryResult, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">"{queryResult.query}"</span>
                        </div>
                        {queryResult.answer && (
                          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-900">
                            {queryResult.answer}
                          </div>
                        )}
                        
                        {queryResult.response.map((insight, insightIndex) => (
                          <div key={insightIndex} className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              {getInsightIcon(insight.type)}
                              <h5 className="font-medium">{insight.title}</h5>
                              <Badge className={getImpactColor(insight.impact)}>
                                {insight.impact} Impact
                              </Badge>
                              <Badge variant="outline">
                                {insight.confidence.toFixed(0)}% Confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                            
                            {insight.actionItems && insight.actionItems.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">Action Items:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {insight.actionItems.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start gap-2">
                                      <span className="text-blue-600">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {queryResult.suggestedQueries.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">Follow-up Questions:</p>
                            <div className="flex flex-wrap gap-2">
                              {queryResult.suggestedQueries.map((suggestedQuery, suggestedIndex) => (
                                <Button
                                  key={suggestedIndex}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestedQuery(suggestedQuery)}
                                  className="text-xs"
                                >
                                  {suggestedQuery}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            {/* AI Insights */}
            {activeTab === 'insights' && (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {lastAnswer && (
                    <div className="border rounded-lg p-3 bg-blue-50 border-blue-100 text-blue-900 text-sm">
                      <span className="font-medium">Answer:</span> {lastAnswer}
                    </div>
                  )}
                  {allInsights.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-3" />
                      <p>AI insights will appear here after running queries</p>
                      <p className="text-sm mt-2">Try asking questions about your data above</p>
                    </div>
                  ) : (
                    allInsights.map((insight, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getInsightIcon(insight.type)}
                            <h5 className="font-medium">{insight.title}</h5>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} Impact
                            </Badge>
                            <Badge variant="outline">
                              {insight.confidence.toFixed(0)}% Confidence
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        
                        <p className="text-sm text-gray-600">{insight.description}</p>
                        
                        {insight.actionItems && insight.actionItems.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Action Items:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {insight.actionItems.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Category: {insight.category}</span>
                          <span>Type: {insight.type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Anomalies */}
            {activeTab === 'anomalies' && (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {anomalies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
                      <p>No anomalies detected in your data</p>
                    </div>
                  ) : (
                    anomalies.map((anomaly, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <h5 className="font-medium">Anomaly in {anomaly.field}</h5>
                            <Badge className={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity} Severity
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        
                        <p className="text-sm text-gray-600">{anomaly.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Current Value:</span>
                            <span className="ml-2 text-red-600 font-bold">
                              {anomaly.value.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Expected Range:</span>
                            <span className="ml-2 text-gray-600">
                              {anomaly.expectedRange[0].toFixed(2)} - {anomaly.expectedRange[1].toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Detected: {anomaly.timestamp.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Forecasts */}
            {activeTab === 'forecasts' && (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {forecasts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3" />
                      <p>No forecasts available. Need more data for predictions.</p>
                    </div>
                  ) : (
                    forecasts.map((forecast, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h5 className="font-medium">Forecast for {forecast.field}</h5>
                            <Badge variant="outline">
                              {forecast.confidence.toFixed(0)}% Confidence
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Current</p>
                            <p className="text-lg font-bold">{forecast.currentValue.toFixed(2)}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Predicted</p>
                            <p className="text-lg font-bold text-blue-600">{forecast.predictedValue.toFixed(2)}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Trend</p>
                            <p className={`text-lg font-bold ${getTrendColor(forecast.trend)}`}>
                              {forecast.trend}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Key Factors:</p>
                          <div className="flex flex-wrap gap-2">
                            {forecast.factors.map((factor, factorIndex) => (
                              <Badge key={factorIndex} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
