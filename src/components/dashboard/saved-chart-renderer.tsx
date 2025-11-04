'use client';

import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ScatterChart as RechartsScatterChart, Scatter as RechartsScatter } from 'recharts';
import { BusinessData } from '@/services/data-analysis-service';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ExportService } from '@/services/export-service';

interface ChartConfig {
  id: number;
  type: 'line' | 'bar' | 'pie' | 'scatter';
  xAxis: string;
  yAxis: string[];
  title: string;
  colorScheme: string[];
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
}

interface SavedChartRendererProps {
  chart: ChartConfig;
  data: BusinessData;
}

export function SavedChartRenderer({ chart, data }: SavedChartRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Process the data for this specific chart
  const chartData = useMemo(() => {
    if (!data?.data?.length || !chart.xAxis || chart.yAxis.length === 0) {
      return [];
    }

    // Use first 50 rows for better performance
    const sampleData = data.data.slice(0, 50);
    
    return sampleData.map(row => {
      const processed: any = {};
      
      // Process X-axis
      if (chart.type === 'line' || chart.type === 'bar') {
        processed.x = row[chart.xAxis];
      }
      
      // Process Y-axis values
      chart.yAxis.forEach((yKey) => {
        const value = row[yKey];
        processed[yKey] = typeof value === 'number' ? value : Number(value) || 0;
      });
      
      return processed;
    });
  }, [chart, data]);

  const handleDownloadPng = async () => {
    if (!containerRef.current) return;
    setDownloading(true);
    try {
      const result = await ExportService.exportChartAsImage(
        containerRef.current,
        'png',
        {
          format: 'png',
          title: chart.title || 'saved_chart',
          includeCharts: true,
          includeTables: false,
          includeInsights: false,
        }
      );
      if (result.success) {
        ExportService.downloadFile(result);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!containerRef.current) return;
    setDownloadingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png', 0.95);

      const result = await ExportService.exportToPDF(
        { chartImageDataUrl: dataUrl },
        {
          format: 'pdf',
          title: chart.title || 'saved_chart',
          includeCharts: false,
          includeTables: false,
          includeInsights: false,
        }
      );
      if (result.success) {
        ExportService.downloadFile(result);
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No data available for this chart</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              {chart.yAxis.map((yKey, index) => (
                <Line
                  key={yKey}
                  type="monotone"
                  dataKey={yKey}
                  stroke={chart.colorScheme[index % chart.colorScheme.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              {chart.yAxis.map((yKey, index) => (
                <Bar
                  key={yKey}
                  dataKey={yKey}
                  fill={chart.colorScheme[index % chart.colorScheme.length]}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  typeof percent === 'number'
                    ? `${name} ${(percent * 100).toFixed(0)}%`
                    : name}
                outerRadius={60}
                fill="#8884d8"
                dataKey={chart.yAxis[0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chart.colorScheme[index % chart.colorScheme.length]} />
                ))}
              </Pie>
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsScatterChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              {chart.yAxis.map((yKey, index) => (
                <RechartsScatter
                  key={yKey}
                  dataKey={yKey}
                  fill={chart.colorScheme[index % chart.colorScheme.length]}
                />
              ))}
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Unknown chart type: {chart.type}</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm">{chart.title}</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadPng} disabled={downloading}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Preparing…' : 'PNG'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadPdf} disabled={downloadingPdf}>
            <Download className="h-4 w-4 mr-2" />
            {downloadingPdf ? 'Preparing…' : 'PDF'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef}>
          {renderChart()}
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          <p>Chart: {chart.type} | X: {chart.xAxis} | Y: {chart.yAxis.join(', ')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

