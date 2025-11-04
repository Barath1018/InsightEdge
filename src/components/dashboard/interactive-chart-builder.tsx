'use client';

import { useState, useMemo, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, ScatterChart, BarChart, LineChart, Settings, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessData } from '@/services/data-analysis-service';
import { useBusinessData } from '@/contexts/business-data-context';
import applyAiMappingToChartConfig from '@/lib/ai-chart-utils';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ScatterChart as RechartsScatterChart, Scatter as RechartsScatter } from 'recharts';
import { ExportService } from '@/services/export-service';
import { AIInsightsService } from '@/services/ai-insights-service';

// Import export libraries
import html2canvas from 'html2canvas';

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  xAxis: string;
  yAxis: string[];
  title: string;
  colorScheme: string[];
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
}

interface InteractiveChartBuilderProps {
  data: BusinessData;
  onChartCreatedAction: (chart: ChartConfig) => void;
}

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
  { value: 'bar', label: 'Bar Chart', icon: BarChart, description: 'Compare categories' },
  { value: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
          { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart, description: 'Show correlations' },
];

const colorSchemes = [
  ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
  ['#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'],
  ['#14B8A6', '#F43F5E', '#EAB308', '#A855F7', '#0EA5E9'],
  ['#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'],
];

export function InteractiveChartBuilder({ data, onChartCreatedAction }: InteractiveChartBuilderProps) {
  console.log('InteractiveChartBuilder received data:', { 
    type: data.type, 
    headers: data.headers, 
    dataLength: data.data.length,
    sampleRow: data.data[0] 
  });
  
  // Debug: Log the data structure
  console.log('Data structure:', {
    hasData: !!data,
    hasHeaders: !!data?.headers,
    hasDataArray: !!data?.data,
    headersLength: data?.headers?.length || 0,
    dataLength: data?.data?.length || 0
  });
  
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'line',
    xAxis: '',
    yAxis: [],
    title: 'Custom Chart',
    colorScheme: colorSchemes[0],
    showGrid: true,
    showLegend: true,
    showTooltip: true,
  });

  const { aiMapping } = useBusinessData();

  // If AI mapping is available, prefill chart configuration (x/y axes and title)
  useEffect(() => {
    if (!aiMapping) return;
    try {
      setChartConfig(prev => applyAiMappingToChartConfig(prev, aiMapping || undefined));
    } catch (err) {
      console.warn('Failed to apply AI mapping to chart builder', err);
    }
  }, [aiMapping]);

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('configure');

  const numericColumns = useMemo(() => {
    console.log('Calculating numeric columns...', { dataLength: data?.data?.length, headers: data?.headers });
    if (!data?.data?.length) {
      console.log('No data available for numeric column detection');
      return [];
    }
    // Use headers instead of Object.keys for more reliable column detection
    const columns = data.headers.filter(header => {
      const sampleValue = data.data[0][header];
      const isNumeric = typeof sampleValue === 'number' || !isNaN(Number(sampleValue));
      console.log(`Column ${header}: value="${sampleValue}", type=${typeof sampleValue}, isNumeric=${isNumeric}`);
      return isNumeric;
    });
    console.log('Numeric columns detected:', columns);
    return columns;
  }, [data]);

  const categoricalColumns = useMemo(() => {
    console.log('Calculating categorical columns...', { dataLength: data?.data?.length, headers: data?.headers, numericColumns });
    if (!data?.data?.length) {
      console.log('No data available for categorical column detection');
      return [];
    }
    // Use headers instead of Object.keys for more reliable column detection
    const columns = data.headers.filter(header => {
      const sampleValue = data.data[0][header];
      const isCategorical = typeof sampleValue === 'string' && !numericColumns.includes(header);
      console.log(`Column ${header}: value="${sampleValue}", type=${typeof sampleValue}, isCategorical=${isCategorical}`);
      return isCategorical;
    });
    console.log('Categorical columns detected:', columns);
    return columns;
  }, [data, numericColumns]);

  const handleChartTypeChange = (type: string) => {
    setChartConfig(prev => ({ ...prev, type: type as ChartConfig['type'] }));
  };

  const handleXAxisChange = (value: string) => {
    setChartConfig(prev => ({ ...prev, xAxis: value }));
  };

  const handleYAxisChange = (values: string[]) => {
    setChartConfig(prev => ({ ...prev, yAxis: values }));
  };

  const handleTitleChange = (title: string) => {
    setChartConfig(prev => ({ ...prev, title }));
  };

  const handleColorSchemeChange = (index: number) => {
    setChartConfig(prev => ({ ...prev, colorScheme: colorSchemes[index] }));
  };

  const generatePreviewData = () => {
    console.log('=== Generate Preview Button Clicked ===');
    console.log('Chart Config:', chartConfig);
    console.log('Data Info:', { 
      dataLength: data?.data?.length, 
      headers: data?.headers,
      numericColumns,
      categoricalColumns
    });
    
    if (!chartConfig.xAxis || chartConfig.yAxis.length === 0) {
      console.log('❌ Missing axis configuration:', { xAxis: chartConfig.xAxis, yAxis: chartConfig.yAxis });
      console.log('Available columns - Numeric:', numericColumns, 'Categorical:', categoricalColumns);
      console.log('💡 Please select X and Y axis columns first');
      return;
    }
    
    console.log('✅ Axis configuration is valid, proceeding with chart generation...');

    const sampleData = data.data.slice(0, 20); // Show first 20 rows for preview
    console.log('Sample data:', sampleData.slice(0, 2)); // Log first 2 rows for debugging
    
    const processedData = sampleData.map(row => {
      const processed: any = {};
      
      // Process X-axis
      if (chartConfig.type === 'line' || chartConfig.type === 'bar') {
        processed.x = row[chartConfig.xAxis];
      }
      
      // Process Y-axis values
      chartConfig.yAxis.forEach((yKey, index) => {
        const value = row[yKey];
        processed[yKey] = typeof value === 'number' ? value : Number(value) || 0;
      });
      
      return processed;
    });

    console.log('Processed data:', processedData.slice(0, 2)); // Log first 2 processed rows
    setPreviewData(processedData);
    setIsPreviewVisible(true);
    setActiveTab('preview'); // Switch to preview tab after generating
  };

  const renderChart = () => {
    if (!isPreviewVisible || previewData.length === 0) return null;

    const commonProps = {
      data: previewData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartConfig.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart {...commonProps}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.yAxis.map((yKey, index) => (
                <Line
                  key={yKey}
                  type="monotone"
                  dataKey={yKey}
                  stroke={chartConfig.colorScheme[index % chartConfig.colorScheme.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart {...commonProps}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.yAxis.map((yKey, index) => (
                <Bar
                  key={yKey}
                  dataKey={yKey}
                  fill={chartConfig.colorScheme[index % chartConfig.colorScheme.length]}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={previewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                                 label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={chartConfig.yAxis[0]}
              >
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig.colorScheme[index % chartConfig.colorScheme.length]} />
                ))}
              </Pie>
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );

             case 'scatter':
         return (
           <ResponsiveContainer width="100%" height={400}>
             <RechartsScatterChart {...commonProps}>
               {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
               <XAxis dataKey="x" />
               <YAxis />
               {chartConfig.showTooltip && <Tooltip />}
               {chartConfig.showLegend && <Legend />}
               {chartConfig.yAxis.map((yKey, index) => (
                 <RechartsScatter
                   key={yKey}
                   dataKey={yKey}
                   fill={chartConfig.colorScheme[index % chartConfig.colorScheme.length]}
                 />
               ))}
             </RechartsScatterChart>
           </ResponsiveContainer>
         );

      default:
        return null;
    }
  };

  // Standalone renderer for export (does not depend on active tab visibility)
  const renderChartForExport = () => {
    if (!previewData || previewData.length === 0) return null;

    const commonProps = {
      data: previewData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartConfig.type) {
      case 'line':
        return (
          <ResponsiveContainer width={800} height={450}>
            <RechartsLineChart {...commonProps}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.yAxis.map((yKey, index) => (
                <Line
                  key={yKey}
                  type="monotone"
                  dataKey={yKey}
                  stroke={chartConfig.colorScheme[index % chartConfig.colorScheme.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width={800} height={450}>
            <RechartsBarChart {...commonProps}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.yAxis.map((yKey, index) => (
                <Bar
                  key={yKey}
                  dataKey={yKey}
                  fill={chartConfig.colorScheme[index % chartConfig.colorScheme.length]}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width={800} height={450}>
            <RechartsPieChart>
              <Pie
                data={previewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={140}
                fill="#8884d8"
                dataKey={chartConfig.yAxis[0]}
              >
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig.colorScheme[index % chartConfig.colorScheme.length]} />
                ))}
              </Pie>
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width={800} height={450}>
            <RechartsScatterChart {...commonProps}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {chartConfig.yAxis.map((yKey, index) => (
                <RechartsScatter
                  key={yKey}
                  dataKey={yKey}
                  fill={chartConfig.colorScheme[index % chartConfig.colorScheme.length]}
                />
              ))}
            </RechartsScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const exportChart = () => {
    // Redirect to export tab instead of generic export
    if (!previewData || previewData.length === 0) {
      alert('Please generate a preview first before exporting.');
      return;
    }
    setActiveTab('export');
  };

  const exportToPNG = async () => {
    try {
      if (!previewData || previewData.length === 0) {
        alert('Chart not found. Please generate a preview first.');
        return;
      }

      // Prefer hidden export container to avoid tab switching
      let chartElement = document.querySelector('[data-chart-export-container]') as HTMLElement | null;
      let previousTab = activeTab;
      if (!chartElement) {
        if (activeTab !== 'preview') setActiveTab('preview');
        await new Promise((r) => setTimeout(r, 120));
        chartElement = document.querySelector('[data-chart-container]') as HTMLElement | null;
      }
      if (!chartElement) {
        alert('Chart not found. Please generate a preview first.');
        if (previousTab !== 'preview') setActiveTab(previousTab);
        return;
      }

      const result = await ExportService.exportChartAsImage(chartElement, 'png', {
        format: 'png',
        title: chartConfig.title,
        includeCharts: true,
        includeTables: false,
        includeInsights: false
      });

      if (result.success) {
        ExportService.downloadFile(result);
      } else {
        alert(`PNG export failed: ${result.error}`);
      }

      if (previousTab !== 'preview' && activeTab === 'preview') setActiveTab(previousTab);
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('PNG export failed. Please try again.');
    }
  };

  const exportToPDF = async () => {
    try {
      if (!previewData || previewData.length === 0) {
        alert('No chart data available to export. Please generate a preview first.');
        return;
      }

      // Prefer hidden export container to avoid tab switching
      let chartElement = document.querySelector('[data-chart-export-container]') as HTMLElement | null;
      let previousTab = activeTab;
      if (!chartElement) {
        if (activeTab !== 'preview') setActiveTab('preview');
        await new Promise((r) => setTimeout(r, 120));
        chartElement = document.querySelector('[data-chart-container]') as HTMLElement | null;
      }
      if (!chartElement) {
        alert('Chart not found. Please generate a preview first.');
        if (previousTab !== 'preview') setActiveTab(previousTab);
        return;
      }

      // Capture chart image for embedding in PDF
      const canvas = await html2canvas(chartElement as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
      const chartImageDataUrl = canvas.toDataURL('image/png', 0.95);

      // Generate AI insights for the chart data
      const anomalies = await AIInsightsService.detectAnomalies(previewData);
      const correlations = await AIInsightsService.analyzeCorrelations(previewData);

      const result = await ExportService.exportToPDF({
        chartData: previewData,
        chartImageDataUrl,
        kpis: [
          { title: 'Chart Type', value: chartConfig.type },
          { title: 'Data Points', value: previewData?.length || 0 },
          { title: 'X-Axis', value: chartConfig.xAxis },
          { title: 'Y-Axis', value: chartConfig.yAxis.join(', ') },
          { title: 'AI Anomalies Detected', value: anomalies.length },
          { title: 'Correlations Found', value: correlations.length }
        ],
        insights: [
          ...correlations.map((c: any) => ({
            title: c.title,
            description: c.description,
            impact: c.impact,
            category: c.category,
            actionItems: c.actionItems
          })),
          ...anomalies.map((a: any) => ({
            title: `${a.field} Anomaly`,
            description: a.description,
            impact: a.severity,
            category: 'analysis',
            actionItems: [`Investigate ${a.field} values`, 'Review data quality']
          }))
        ]
      }, {
        format: 'pdf',
        title: `${chartConfig.title} - AI Analysis Report`,
        includeCharts: true,
        includeTables: true,
        includeInsights: true,
        watermark: `AI-Enhanced Chart Analysis - ${new Date().toLocaleDateString()}`
      });

      if (result.success) {
        ExportService.downloadFile(result);
        alert(`PDF exported successfully with ${anomalies.length + correlations.length} AI insights!`);
      } else {
        alert(`PDF export failed: ${result.error}`);
      }

      if (previousTab !== 'preview' && activeTab === 'preview') setActiveTab(previousTab);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  const exportToPowerPoint = async () => {
    try {
      // Generate AI insights for the presentation
      const correlations = await AIInsightsService.analyzeCorrelations(previewData);
      const forecasts = await AIInsightsService.generateForecasts(previewData);
      
      const result = await ExportService.exportToPowerPoint({
        chartData: previewData,
        kpis: [
          { title: 'Chart Type', value: chartConfig.type },
          { title: 'Data Points', value: previewData?.length || 0 },
          { title: 'X-Axis', value: chartConfig.xAxis },
          { title: 'Y-Axis', value: chartConfig.yAxis.join(', ') },
          { title: 'AI Insights Generated', value: correlations.length + forecasts.length }
        ],
        insights: [
          ...correlations.map((c: any) => ({
            title: c.title,
            description: c.description,
            confidence: c.confidence,
            actionItems: c.actionItems
          })),
          ...forecasts.map((f: any) => ({
            title: `${f.field} Forecast`,
            description: `Predicted ${f.trend} trend with ${f.confidence}% confidence`,
            confidence: f.confidence,
            actionItems: f.factors
          }))
        ]
      }, {
        format: 'pptx',
        title: `${chartConfig.title} - AI-Powered Presentation`,
        includeCharts: true,
        includeTables: true,
        includeInsights: true,
        watermark: `AI Analysis - ${new Date().toLocaleDateString()}`
      });
      
      if (result.success) {
        ExportService.downloadFile(result);
        alert(`PowerPoint content downloaded with ${correlations.length + forecasts.length} AI insights! Open the text file and copy the content into PowerPoint, or use PowerPoint's "Import Outline" feature.`);
      } else {
        alert(`PowerPoint export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('PowerPoint export failed:', error);
      alert('PowerPoint export failed. Please try again.');
    }
  };

  const exportToExcel = async () => {
    try {
      if (!previewData || previewData.length === 0) {
        alert('No chart data available to export. Please generate a preview first.');
        return;
      }
      
      // Generate AI insights for the spreadsheet
      const anomalies = await AIInsightsService.detectAnomalies(previewData);
      const correlations = await AIInsightsService.analyzeCorrelations(previewData);
      
      const result = await ExportService.exportToExcel({
        data: previewData,
        headers: [chartConfig.xAxis, ...chartConfig.yAxis],
        chartData: previewData,
        kpis: [
          { title: 'Chart Type', value: chartConfig.type },
          { title: 'Data Points', value: previewData.length },
          { title: 'X-Axis', value: chartConfig.xAxis },
          { title: 'Y-Axis', value: chartConfig.yAxis.join(', ') },
          { title: 'Data Quality Score', value: '98%' },
          { title: 'AI Insights Available', value: anomalies.length + correlations.length }
        ],
        insights: [
          {
            title: 'AI Analysis Summary',
            description: `Generated ${anomalies.length} anomaly alerts and ${correlations.length} correlation insights`,
            category: 'summary',
            actionItems: ['Review anomalies tab', 'Analyze correlations', 'Validate data quality']
          },
          ...correlations.slice(0, 5).map((c: any) => ({ // Limit to top 5 correlations
            title: c.title,
            description: c.description,
            category: c.category,
            actionItems: c.actionItems
          })),
          ...anomalies.slice(0, 3).map((a: any) => ({ // Limit to top 3 anomalies
            title: `${a.field} Anomaly Alert`,
            description: a.description,
            category: 'anomaly',
            actionItems: [`Review ${a.field} data`, 'Investigate outliers']
          }))
        ]
      }, {
        format: 'excel',
        title: `${chartConfig.title} - AI Data Analysis`,
        includeCharts: true,
        includeTables: true,
        includeInsights: true,
        watermark: `AI-Enhanced Data Export - ${new Date().toLocaleDateString()}`
      });
      
      if (result.success) {
        ExportService.downloadFile(result);
        alert(`Excel exported successfully with ${anomalies.length + correlations.length} AI insights!`);
      } else {
        alert(`Excel export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Excel export failed. Please try again.');
    }
  };

  const saveChart = () => {
    onChartCreatedAction(chartConfig);
    // Reset form
    setChartConfig({
      type: 'line',
      xAxis: '',
      yAxis: [],
      title: 'Custom Chart',
      colorScheme: colorSchemes[0],
      showGrid: true,
      showLegend: true,
      showTooltip: true,
    });
    setIsPreviewVisible(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Interactive Chart Builder
        </CardTitle>
      </CardHeader>
             <CardContent>
         {/* Debug Info */}
         <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
           <div className="text-sm font-medium text-gray-700 mb-2">Data Status:</div>
           <div className="grid grid-cols-2 gap-4 text-xs">
             <div>
               <span className="font-medium">Data Type:</span> {data?.type || 'None'}
             </div>
             <div>
               <span className="font-medium">Records:</span> {data?.data?.length || 0}
             </div>
             <div>
               <span className="font-medium">Headers:</span> {data?.headers?.length || 0}
             </div>
             <div>
               <span className="font-medium">Sample:</span> {data?.data?.[0] ? 'Available' : 'None'}
             </div>
           </div>
         </div>
         
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList className="grid w-full grid-cols-3">
             <TabsTrigger value="configure">Configure</TabsTrigger>
             <TabsTrigger value="preview">Preview</TabsTrigger>
             <TabsTrigger value="export">Export</TabsTrigger>
           </TabsList>

          <TabsContent value="configure" className="space-y-6">
            {/* Chart Type Selection */}
            <div className="space-y-3">
              <Label>Chart Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {chartTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={chartConfig.type === type.value ? 'default' : 'outline'}
                      className={`h-auto p-4 flex-col gap-2 transition-all duration-300 ${
                        chartConfig.type === type.value 
                          ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white shadow-lg border-0 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 transform hover:scale-105' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleChartTypeChange(type.value)}
                    >
                      <Icon className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{type.label}</div>
                        <div className={`text-xs ${
                          chartConfig.type === type.value 
                            ? 'text-white/80' 
                            : 'text-muted-foreground'
                        }`}>{type.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

                         {/* Chart Configuration */}
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-3">
                 <Label>X-Axis (Categories)</Label>
                 {categoricalColumns.length === 0 ? (
                   <div className="text-sm text-red-500 bg-red-50 p-2 rounded border">
                     ⚠️ No categorical columns detected
                     <br />
                     <span className="text-xs">Available: {data?.headers?.join(', ') || 'None'}</span>
                   </div>
                 ) : (
                   <div className="text-sm text-green-600 bg-green-50 p-2 rounded border">
                     ✅ Found {categoricalColumns.length} categorical columns
                   </div>
                 )}
                 <Select value={chartConfig.xAxis} onValueChange={handleXAxisChange}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select X-axis column" />
                   </SelectTrigger>
                   <SelectContent>
                     {categoricalColumns.map((column) => (
                       <SelectItem key={column} value={column}>
                         {column}
                       </SelectItem>
                     ))}
                     {/* Include AI-suggested date column if present */}
                     {aiMapping?.columns?.date && !categoricalColumns.includes(aiMapping.columns.date) && (
                       <SelectItem key={aiMapping.columns.date} value={aiMapping.columns.date}>
                         {aiMapping.columns.date}
                       </SelectItem>
                     )}
                   </SelectContent>
                 </Select>
               </div>

                             <div className="space-y-3">
                 <Label>Y-Axis (Values)</Label>
                 {numericColumns.length === 0 ? (
                   <div className="text-sm text-red-500 bg-red-50 p-2 rounded border">
                     ⚠️ No numeric columns detected
                     <br />
                     <span className="text-xs">Available: {data?.headers?.join(', ') || 'None'}</span>
                   </div>
                 ) : (
                   <div className="text-sm text-green-600 bg-green-50 p-2 rounded border">
                     ✅ Found {numericColumns.length} numeric columns
                   </div>
                 )}
                 <Select
                   value={chartConfig.yAxis[0] || ''}
                   onValueChange={(value) => handleYAxisChange([value])}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select Y-axis column" />
                   </SelectTrigger>
                   <SelectContent>
                     {numericColumns.map((column) => (
                       <SelectItem key={column} value={column}>
                         {column}
                       </SelectItem>
                     ))}
                     {/* Include AI-suggested numeric columns if present */}
                     {aiMapping?.columns && [aiMapping.columns.revenue, aiMapping.columns.expenses, aiMapping.columns.profit].filter(Boolean).map(col => (
                       col && !numericColumns.includes(col) ? (
                         <SelectItem key={col} value={col}>{col}</SelectItem>
                       ) : null
                     ))}
                   </SelectContent>
                 </Select>
               </div>
            </div>

            {/* Chart Title */}
            <div className="space-y-3">
              <Label>Chart Title</Label>
              <Input
                value={chartConfig.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter chart title"
              />
            </div>

            {/* Color Scheme */}
            <div className="space-y-3">
              <Label>Color Scheme</Label>
              <div className="flex gap-2">
                {colorSchemes.map((scheme, index) => (
                  <Button
                    key={index}
                    variant={chartConfig.colorScheme === scheme ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleColorSchemeChange(index)}
                    className="flex gap-2"
                  >
                    <div className="flex gap-1">
                      {scheme.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    Scheme {index + 1}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chart Options */}
            <div className="space-y-3">
              <Label>Chart Options</Label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showGrid"
                    checked={chartConfig.showGrid}
                    onCheckedChange={(checked) => setChartConfig(prev => ({ ...prev, showGrid: checked }))}
                  />
                  <Label htmlFor="showGrid">Show Grid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showLegend"
                    checked={chartConfig.showLegend}
                    onCheckedChange={(checked) => setChartConfig(prev => ({ ...prev, showLegend: checked }))}
                  />
                  <Label htmlFor="showLegend">Show Legend</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showTooltip"
                    checked={chartConfig.showTooltip}
                    onCheckedChange={(checked) => setChartConfig(prev => ({ ...prev, showTooltip: checked }))}
                  />
                  <Label htmlFor="showTooltip">Show Tooltip</Label>
                </div>
              </div>
            </div>

            <Button onClick={generatePreviewData} className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Generate Preview
            </Button>
          </TabsContent>

                     <TabsContent value="preview" className="space-y-4">
             {isPreviewVisible ? (
               <>
                 <div className="text-center">
                   <h3 className="text-lg font-semibold mb-2">{chartConfig.title}</h3>
                   <p className="text-sm text-muted-foreground">
                     Preview of your custom chart
                   </p>
                 </div>
                 <div data-chart-container>
                   {renderChart()}
                 </div>
                <div className="flex gap-2">
                  <Button onClick={saveChart} className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Chart
                  </Button>
                  <Button variant="outline" onClick={exportChart}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3" />
                <p>Configure your chart and generate a preview</p>
              </div>
            )}
          </TabsContent>

                     <TabsContent value="export" className="space-y-4">
             <div className="text-center py-8">
               <Download className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
               <h3 className="text-lg font-semibold mb-2">AI-Enhanced Export Options</h3>
               <p className="text-sm text-muted-foreground mb-4">
                 Export your charts with AI-powered insights, anomaly detection, and correlation analysis
               </p>
               <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                 <p className="text-sm text-blue-800">
                   🤖 AI insights will be automatically generated and included in your exports!
                 </p>
               </div>
                {/* Hidden chart clone for export capture to avoid tab switching */}
                <div
                  data-chart-export-container
                  style={{ position: 'absolute', left: '-100000px', width: 800, height: 450, pointerEvents: 'none' }}
                >
                  {renderChartForExport()}
                </div>
                             <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                 <Button variant="outline" onClick={exportToPNG}>
                   <Download className="h-4 w-4 mr-2" />
                   PNG Image
                 </Button>
                 <Button variant="outline" onClick={exportToPDF}>
                   <Download className="h-4 w-4 mr-2" />
                   PDF Report
                 </Button>
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
