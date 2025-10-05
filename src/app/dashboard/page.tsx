'use client';

'use client';

import { useState } from 'react';
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  Tag,
  TrendingUp,
  Users,
  Upload,
  FileText,
  Database,
  Sparkles,
  Download,
  Settings,
  Zap,
  Target,
  TrendingDown,
  Activity,
  MessageSquare,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { DataPersistenceStatus } from '@/components/dashboard/data-persistence-status';
import { FileUpload } from '@/components/dashboard/file-upload';
import { EnhancedKPICard } from '@/components/dashboard/enhanced-kpi-card';
import { MonthlySalesPerformanceChart } from '@/components/dashboard/monthly-sales-performance-chart';
import { ProfitTrendAnalysisChart } from '@/components/dashboard/profit-trend-analysis-chart';
import { DataInsights } from '@/components/dashboard/data-insights';
import { InteractiveChartBuilder } from '@/components/dashboard/interactive-chart-builder';
import { SavedChartRenderer } from '@/components/dashboard/saved-chart-renderer';
import { AIQueryInterface } from '@/components/dashboard/ai-query-interface';
import { AdvancedExportInterface } from '@/components/dashboard/advanced-export-interface';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataAnalysisService, BusinessData, AnalyzedMetrics } from '@/services/data-analysis-service';
import { AIInsightsService } from '@/services/ai-insights-service';
import { useBusinessData } from '@/contexts/business-data-context';

export default function Dashboard() {
<<<<<<< HEAD
  const { businessData, analyzedMetrics, isProcessing, setBusinessData, setAnalyzedMetrics, setIsProcessing } = useBusinessData();
=======
  const { businessData, analyzedMetrics, isProcessing, setBusinessData, setAnalyzedMetrics, setIsProcessing, aiMapping } = useBusinessData();
>>>>>>> 07df53a (added ai)
  
  // Icon mapping for KPI cards - dynamically updated based on uploaded data
  const getIconMap = () => {
    const defaultIconMap: { [key: string]: React.ReactNode } = {
      'Total Revenue': <DollarSign className="h-5 w-5" />,
      'Total Expenses': <CreditCard className="h-5 w-5" />,
      'Net Profit': <TrendingUp className="h-5 w-5" />,
      'Avg. Order Value': <Tag className="h-5 w-5" />,
    };
    
    // If we have analyzed metrics, create a dynamic icon map based on the KPI titles
    if (analyzedMetrics?.kpis) {
      const dynamicIconMap: { [key: string]: React.ReactNode } = {};
      
      // Map common financial/business terms to appropriate icons
      analyzedMetrics.kpis.forEach(kpi => {
        const title = kpi.title.toLowerCase();
        
        if (title.includes('revenue') || title.includes('sales')) {
          dynamicIconMap[kpi.title] = <DollarSign className="h-5 w-5" />;
        } else if (title.includes('expense') || title.includes('cost')) {
          dynamicIconMap[kpi.title] = <CreditCard className="h-5 w-5" />;
        } else if (title.includes('profit') || title.includes('margin')) {
          dynamicIconMap[kpi.title] = <TrendingUp className="h-5 w-5" />;
        } else if (title.includes('order') || title.includes('value')) {
          dynamicIconMap[kpi.title] = <Tag className="h-5 w-5" />;
        } else {
          // Default icon for other metrics
          dynamicIconMap[kpi.title] = <BarChart3 className="h-5 w-5" />;
        }
      });
      
      return dynamicIconMap;
    }
    
    return defaultIconMap;
  };
  
  const iconMap = getIconMap();
  const [activeTab, setActiveTab] = useState('overview');
  const [customCharts, setCustomCharts] = useState<any[]>([]);

<<<<<<< HEAD
  const handleFileProcessed = async (data: BusinessData) => {
    setBusinessData(data);
    setIsProcessing(true);
    
    try {
      const metrics = await DataAnalysisService.analyzeBusinessData(data);
=======
  const handleFileProcessed = async (data: BusinessData, fileData?: string, uploadedFileName?: string) => {
    await setBusinessData(data, fileData, uploadedFileName);
    setIsProcessing(true);
    
    try {
      const metrics = await DataAnalysisService.analyzeBusinessData(data, aiMapping || undefined);
>>>>>>> 07df53a (added ai)
      setAnalyzedMetrics(metrics);
    } catch (error) {
      console.error('Failed to analyze data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessing = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const handleChartCreated = (chartConfig: any) => {
    setCustomCharts(prev => [...prev, { ...chartConfig, id: Date.now() }]);
  };

  const renderEmptyState = () => (
    <div className="text-center py-16 bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 rounded-lg border border-green-100">
      <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Welcome to Your Advanced Business Intelligence Dashboard
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Upload your business data file (CSV or Excel) to unlock powerful AI-powered insights, 
        interactive visualizations, and comprehensive reporting capabilities.
      </p>
      <FileUpload 
        onFileProcessed={handleFileProcessed}
        onProcessing={handleProcessing}
      />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="text-center p-4">
          <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-medium">AI-Powered Insights</h4>
          <p className="text-sm text-muted-foreground">Natural language queries and intelligent recommendations</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium">Interactive Charts</h4>
          <p className="text-sm text-muted-foreground">Build custom visualizations from your data</p>
        </Card>
        <Card className="text-center p-4">
          <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h4 className="font-medium">Advanced Export</h4>
          <p className="text-sm text-muted-foreground">Generate reports in multiple formats</p>
        </Card>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Advanced Business Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Analyzing {businessData?.data.length.toLocaleString()} records with AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
            <div className="flex items-center mr-2">
              <DataPersistenceStatus />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                              setBusinessData(null);
              setAnalyzedMetrics(null);
              setCustomCharts([]);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Data
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('export')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="charts">Custom Charts</TabsTrigger>
          <TabsTrigger value="data">Data Explorer</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Growth Alert */}
          {analyzedMetrics && (
            <Alert className={`border-l-4 ${
              analyzedMetrics.growthAlert.type === 'positive' 
                ? 'border-green-500 bg-green-50' 
                : analyzedMetrics.growthAlert.type === 'negative'
                ? 'border-red-500 bg-red-50'
                : 'border-blue-500 bg-blue-50'
            }`}>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">
                {analyzedMetrics.growthAlert.title}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {analyzedMetrics.growthAlert.description}
              </AlertDescription>
            </Alert>
          )}

          {/* KPIs */}
          {analyzedMetrics && (
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {analyzedMetrics.kpis.map((kpi) => (
                <EnhancedKPICard
                  key={kpi.title}
                  title={kpi.title} // Dynamic title from uploaded data
                  value={kpi.value}
                  change={kpi.change}
                  trend={kpi.trend}
                  icon={iconMap[kpi.title] || <BarChart3 className="h-6 w-6 text-muted-foreground" />}
                  previousValue={kpi.previousValue}
                />
              ))}
            </div>
          )}

          {/* Standard Charts */}
          {analyzedMetrics && (
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
<<<<<<< HEAD
                  <CardTitle>Monthly Sales Performance</CardTitle>
=======
                  <CardTitle>{aiMapping?.charts?.salesTitle || 'Monthly Sales Performance'}</CardTitle>
>>>>>>> 07df53a (added ai)
                </CardHeader>
                <CardContent className="pl-2">
                  <MonthlySalesPerformanceChart data={analyzedMetrics.chartData} />
                </CardContent>
              </Card>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
<<<<<<< HEAD
                  <CardTitle>Profit Trend Analysis</CardTitle>
=======
                  <CardTitle>{aiMapping?.charts?.profitTitle || 'Profit Trend Analysis'}</CardTitle>
>>>>>>> 07df53a (added ai)
                </CardHeader>
                <CardContent className="pl-2">
                  <ProfitTrendAnalysisChart data={analyzedMetrics.chartData} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data Insights */}
          {analyzedMetrics && (
            <DataInsights 
              dataSummary={analyzedMetrics.dataSummary}
              insights={analyzedMetrics.insights}
            />
          )}

          {/* Reports and Notifications */}
          {analyzedMetrics && (
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Summary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyzedMetrics.reports.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>
                            <Badge variant={report.status === 'Final' ? 'default' : 'secondary'}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {report.summary}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="space-y-4">
                    {analyzedMetrics.notifications.map((notification, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {notification.type === 'success' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {notification.type === 'warning' && (
                            <div className="h-5 w-5 rounded-full bg-yellow-500" />
                          )}
                          {notification.type === 'info' && (
                            <div className="h-5 w-5 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {businessData ? (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered analytics based on your uploaded data
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      const [anomalies, correlations, forecasts] = await Promise.all([
                        AIInsightsService.detectAnomalies(businessData.data),
                        AIInsightsService.analyzeCorrelations(businessData.data),
                        AIInsightsService.generateForecasts(businessData.data)
                      ]);
                      alert(`Analysis complete! Found ${anomalies.length} anomalies, ${correlations.length} correlations, and ${forecasts.length} forecasts.`);
                    } catch (error) {
                      console.error('Analytics failed:', error);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>

              {/* Analytics Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Data Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Data Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Records</span>
                        <span className="font-semibold">{businessData.data.length.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data Fields</span>
                        <span className="font-semibold">{businessData.headers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Numeric Fields</span>
                        <span className="font-semibold">
                          {businessData.headers.filter(header => 
                            businessData.data.some(row => !isNaN(Number(row[header])))
                          ).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('ai-insights')}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ask AI About Your Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Detect Anomalies
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Generate Forecasts
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Create Custom Chart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Analytics Results */}
              {analyzedMetrics && (
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {analyzedMetrics.kpis.map((kpi, index) => (
                          <div key={index} className="text-center p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              {iconMap[kpi.title] || <BarChart3 className="h-5 w-5" />}
                            </div>
                            <p className="text-2xl font-bold">{kpi.value}</p>
                            <p className="text-sm text-muted-foreground">{kpi.title}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Business Intelligence Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyzedMetrics.insights.slice(0, 3).map((insight, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-800">{insight.title}</p>
                            <p className="text-sm text-blue-600 mt-1">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your business data to access AI-powered analytics
              </p>
              <Button variant="outline" onClick={() => setActiveTab('overview')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Data First
              </Button>
            </div>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          {businessData ? (
            <AIQueryInterface data={businessData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3" />
              <p>Upload data to access AI-powered insights</p>
            </div>
          )}
        </TabsContent>

        {/* Custom Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {businessData ? (
            <div className="space-y-6">
              <InteractiveChartBuilder 
                data={businessData} 
                onChartCreated={handleChartCreated}
              />
              
              {customCharts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Custom Charts</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {customCharts.map((chart) => (
                      <SavedChartRenderer 
                        key={chart.id} 
                        chart={chart} 
                        data={businessData}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-3" />
              <p>Upload data to create custom charts</p>
            </div>
          )}
        </TabsContent>

        {/* Data Explorer Tab */}
        <TabsContent value="data" className="space-y-6">
          {businessData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Explorer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Records:</span>
                      <div className="font-medium">{businessData.data.length.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Columns:</span>
                      <div className="font-medium">{businessData.headers.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Type:</span>
                      <div className="font-medium">{businessData.type.toUpperCase()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">File Size:</span>
                      <div className="font-medium">{(businessData.rawContent?.length || 0 / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Columns</h4>
                    <div className="flex flex-wrap gap-2">
                      {businessData.headers.map((header, index) => (
                        <Badge key={index} variant="outline">
                          {header}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Sample Data (First 5 rows)</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {businessData.headers.map((header, index) => (
                              <TableHead key={index}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businessData.data.slice(0, 5).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {businessData.headers.map((header, colIndex) => (
                                <TableCell key={colIndex} className="text-sm">
                                  {row[header] || '-'}
                                </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3" />
              <p>Upload data to explore your dataset</p>
            </div>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          {analyzedMetrics ? (
            <AdvancedExportInterface 
              data={analyzedMetrics}
              onExportComplete={(result) => {
                console.log('Export completed:', result);
              }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-3" />
              <p>Upload and analyze data to export reports</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {!businessData ? renderEmptyState() : renderDashboard()}
    </div>
  );
}
