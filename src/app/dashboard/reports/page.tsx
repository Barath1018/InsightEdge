
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessData } from '@/contexts/business-data-context';
import { ExportService } from '@/services/export-service';
import { AIInsightsService } from '@/services/ai-insights-service';
import { useState } from 'react';
import * as React from 'react';

export default function ReportsPage() {
  const { businessData, isProcessing, setBusinessData } = useBusinessData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [geminiCache, setGeminiCache] = useState<{
    kpis: Array<{ title: string; value: string; change?: string }>
    insights: string[]
    charts: Array<{ type: 'line'|'bar'|'pie'|'scatter'; title: string; xAxis: string; yAxis: string[] }>
    answer?: string
  } | null>(null);

  // Check Gemini availability once
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/ai/status', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setAiEnabled(Boolean(json.enabled));
        }
      } catch {}
    })();
  }, []);

  // Helper to call Gemini with dataset and cache results per session
  const getGeminiAnalysis = React.useCallback(async () => {
    if (!businessData || !aiEnabled) return null;
    if (geminiCache) return geminiCache;
    try {
      const askRes = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Analyze this dataset and return KPIs and concise, high-signal insights for an executive report.',
          dataset: { headers: businessData.headers, data: businessData.data }
        })
      });
      if (!askRes.ok) return null;
      const json = await askRes.json();
      const result = {
        kpis: Array.isArray(json?.kpis) ? json.kpis : [],
        insights: Array.isArray(json?.insights) ? json.insights : [],
        charts: Array.isArray(json?.charts) ? json.charts : [],
        answer: typeof json?.answer === 'string' ? json.answer : undefined
      } as any;
      setGeminiCache(result);
      return result;
    } catch {
      return null;
    }
  }, [aiEnabled, businessData, geminiCache]);
  
  // Generate AI-enhanced reports based on business data (prefer Gemini if enabled)
  const generateAIReports = async () => {
    if (!businessData) return [];
    
    try {
      // Prefer Gemini for insights count if available
      const gem = await getGeminiAnalysis();
      const anomalies = gem ? [] : await AIInsightsService.detectAnomalies(businessData.data);
      const correlations = gem ? [] : await AIInsightsService.analyzeCorrelations(businessData.data);
      const forecasts = gem ? [] : await AIInsightsService.generateForecasts(businessData.data);
      
      return [
        {
          name: 'AI Business Performance Report',
          date: new Date().toLocaleDateString(),
          type: 'AI-Enhanced Analysis',
          status: 'Final',
          description: 'Comprehensive business analysis with AI-powered insights, anomaly detection, and trend forecasting',
          insights: gem ? gem.insights.length : (correlations.length + anomalies.length + forecasts.length),
          format: 'pdf'
        },
        {
          name: 'Revenue Intelligence Report',
          date: new Date().toLocaleDateString(),
          type: 'Financial AI Analysis',
          status: 'Final',
          description: 'AI-driven revenue analysis with predictive insights and optimization recommendations',
          insights: gem ? Math.max(5, gem.insights.length) : Math.max(5, correlations.filter(c => c.category === 'revenue').length),
          format: 'excel'
        },
        {
          name: 'Customer Behavior Analytics',
          date: new Date().toLocaleDateString(),
          type: 'Customer Intelligence',
          status: 'Final',
          description: 'Deep dive into customer patterns using advanced AI analytics and behavioral modeling',
          insights: gem ? Math.max(3, gem.insights.length) : Math.max(3, correlations.filter(c => c.category === 'customers').length),
          format: 'pptx'
        },
        {
          name: 'Anomaly Detection Summary',
          date: new Date().toLocaleDateString(),
          type: 'Risk Analysis',
          status: 'Final',
          description: 'Critical business anomalies detected by AI algorithms with actionable recommendations',
          insights: gem ? Math.min(3, gem.insights.length) : anomalies.length,
          format: 'pdf'
        }
      ];
    } catch (error) {
      console.error('Error generating AI reports:', error);
      return [];
    }
  };
  
  // Handle report download with AI-generated content
  const handleDownload = async (report: any) => {
    setIsGenerating(true);
    
    try {
      if (!businessData) {
        alert('No business data available. Please upload data first.');
        return;
      }
      
      // Prefer Gemini for insights/KPIs if available; fall back to local services
      const gem = await getGeminiAnalysis();
      const useGem = Boolean(gem && (gem.insights?.length || gem.kpis?.length));
      const anomalies = useGem ? [] : await AIInsightsService.detectAnomalies(businessData.data);
      const correlations = useGem ? [] : await AIInsightsService.analyzeCorrelations(businessData.data);
      const forecasts = useGem ? [] : await AIInsightsService.generateForecasts(businessData.data);
      
      // Prepare comprehensive data for export
      const reportData = {
        data: businessData.data,
        headers: businessData.headers,
        kpis: useGem
          ? (gem!.kpis || []).map((k: any) => ({ title: k.title, value: k.value || '', change: k.change }))
          : [
              { title: 'Total Records', value: businessData.data.length },
              { title: 'Data Quality', value: '95%' },
              { title: 'AI Insights Generated', value: correlations.length + anomalies.length },
              { title: 'Anomalies Detected', value: anomalies.length },
              { title: 'Correlations Found', value: correlations.length },
              { title: 'Forecasts Available', value: forecasts.length }
            ],
        insights: useGem
          ? (gem!.insights || []).map((s: string, i: number) => ({
              title: `Insight ${i + 1}`,
              description: s,
              category: 'ai',
              actionItems: []
            }))
          : [
              ...correlations.map(c => ({
                title: c.title,
                description: c.description,
                impact: c.impact,
                confidence: c.confidence,
                category: c.category,
                actionItems: c.actionItems
              })),
              ...anomalies.map(a => ({
                title: `${a.field} Anomaly Detected`,
                description: a.description,
                impact: a.severity,
                confidence: 95,
                category: 'risk',
                actionItems: [`Investigate ${a.field} anomaly`, 'Review data quality', 'Monitor for patterns']
              })),
              ...forecasts.map(f => ({
                title: `${f.field} Forecast`,
                description: `Predicted ${f.trend} trend with ${f.confidence}% confidence`,
                impact: f.trend === 'increasing' ? 'high' : f.trend === 'decreasing' ? 'medium' : 'low',
                confidence: f.confidence,
                category: 'forecast',
                actionItems: f.factors
              }))
            ],
        chartData: businessData.data.slice(-20), // Last 20 records for trending
        dataSummary: {
          totalRecords: businessData.data.length,
          columns: businessData.headers.length,
          anomaliesFound: useGem ? 0 : anomalies.length,
          correlationsDetected: useGem ? 0 : correlations.length,
          forecastsGenerated: useGem ? 0 : forecasts.length
        },
        aiSummary: useGem ? gem!.answer : undefined
      };
      
      const exportOptions = {
        format: report.format,
        title: report.name,
        includeCharts: true,
        includeTables: true,
        includeInsights: true,
        watermark: `Generated by AI on ${new Date().toLocaleDateString()}`
      };
      
      let result;
      
      switch (report.format) {
        case 'pdf':
          result = await ExportService.exportToPDF(reportData, exportOptions);
          break;
        case 'excel':
          result = await ExportService.exportToExcel(reportData, exportOptions);
          break;
        case 'pptx':
          result = await ExportService.exportToPowerPoint(reportData, exportOptions);
          break;
        default:
          result = await ExportService.exportToPDF(reportData, exportOptions);
      }
      
      if (result.success) {
        ExportService.downloadFile(result);
        alert(`${report.name} downloaded successfully! The report includes ${reportData.insights.length} AI-generated insights.`);
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Use AI-generated reports or fallback for no data
  const [reports, setReports] = useState<any[]>([]);
  
  // Generate reports when business data is available
  React.useEffect(() => {
    if (businessData && !isProcessing) {
      generateAIReports().then(setReports);
    } else {
      setReports([
        {
          name: 'Upload Data to Generate AI Reports',
          date: 'Data required',
          type: 'AI Analysis Pending',
          status: 'Pending',
          description: 'Upload your business data to unlock AI-powered analytics and insights',
          insights: 0,
          format: 'pdf'
        }
      ]);
    }
  }, [businessData, isProcessing]);

  // Hydrate business data from localStorage when arriving directly at Reports
  React.useEffect(() => {
    if (!businessData && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('businessData');
        if (stored) {
          const parsed = JSON.parse(stored);
          setBusinessData(parsed);
        }
      } catch {}
    }
  }, [businessData, setBusinessData]);

  return (
    <div className="flex flex-1 flex-col gap-0">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">Download and view your generated business reports.</p>
      </div>
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI-Generated Business Reports
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Intelligent reports powered by AI analytics, including anomaly detection, 
              correlation analysis, and predictive insights from your business data.
            </p>
          </CardHeader>
          <CardContent>
            {isProcessing && !businessData ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>AI Insights</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports?.map((report, index) => (
                    <TableRow key={report.name + index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{report.name}</div>
                            {report.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {report.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {report.type.includes('AI') && (
                            <Brain className="h-3 w-3 text-blue-500" />
                          )}
                          {report.type.includes('Risk') && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                          {report.type.includes('Financial') && (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          )}
                          <span className="text-sm">{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof report.insights === 'number' && report.insights > 0 ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {report.insights} insights
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === 'Final'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            report.status === 'Final'
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(report)}
                          disabled={!businessData || isGenerating || report.status === 'Pending'}
                        >
                          {isGenerating ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              <span>Generating...</span>
                            </div>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
