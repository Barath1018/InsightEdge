'use client';

import { useState } from 'react';
import { Download, FileText, BarChart3, Table, Lightbulb, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportService, ExportOptions, ExportResult } from '@/services/export-service';
import { AnalyzedMetrics } from '@/services/data-analysis-service';

interface AdvancedExportInterfaceProps {
  data: AnalyzedMetrics;
  onExportComplete?: (result: ExportResult) => void;
}

export function AdvancedExportInterface({ data, onExportComplete }: AdvancedExportInterfaceProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    title: 'Business Intelligence Report',
    includeCharts: true,
    includeTables: true,
    includeInsights: true,
    customStyling: false,
    watermark: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const supportedFormats = ExportService.getSupportedFormats();
<<<<<<< HEAD
  const estimatedFileSize = ExportService.getEstimatedFileSize(exportOptions, data.data?.length || 0);

  const handleExport = async () => {
=======
                                    const estimatedFileSize = ExportService.getEstimatedFileSize(exportOptions, data.dataSummary?.totalRecords || 0);  const handleExport = async () => {
>>>>>>> 07df53a (added ai)
    // Validate options
    const validation = ExportService.validateExportOptions(exportOptions);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await ExportService.generateBusinessReport(data, exportOptions);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      setExportResult(result);
      
      if (result.success) {
        onExportComplete?.(result);
      }
    } catch (error) {
      setExportResult({
        success: false,
        error: 'Export failed unexpectedly'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (exportResult?.success) {
      ExportService.downloadFile(exportResult);
      
      // Show additional instructions for PowerPoint format
      if (exportOptions.format === 'pptx') {
        setTimeout(() => {
          alert('PowerPoint content downloaded! Open the text file and copy the content into PowerPoint, or use PowerPoint\'s "Import Outline" feature for best results.');
        }, 500);
      }
    }
  };

  const handleFormatChange = (format: string) => {
    setExportOptions(prev => ({ ...prev, format: format as ExportOptions['format'] }));
  };

  const handleTitleChange = (title: string) => {
    setExportOptions(prev => ({ ...prev, title }));
  };

  const handleWatermarkChange = (watermark: string) => {
    setExportOptions(prev => ({ ...prev, watermark }));
  };

  const toggleOption = (option: keyof Pick<ExportOptions, 'includeCharts' | 'includeTables' | 'includeInsights' | 'customStyling'>) => {
    setExportOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const getFormatIcon = (format: string) => {
    const formatInfo = supportedFormats.find(f => f.value === format);
    return formatInfo?.icon || '📄';
  };

  const getFormatDescription = (format: string) => {
    const formatInfo = supportedFormats.find(f => f.value === format);
    return formatInfo?.description || '';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Advanced Export & Reporting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="configure" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-6">
            {/* Export Format Selection */}
            <div className="space-y-3">
              <Label>Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                {supportedFormats.map((format) => (
                  <Button
                    key={format.value}
                    variant={exportOptions.format === format.value ? 'default' : 'outline'}
                    className={`h-auto p-4 flex-col gap-2 transition-all duration-300 ${
                      exportOptions.format === format.value 
                        ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white shadow-lg border-0 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 transform hover:scale-105' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleFormatChange(format.value)}
                  >
                    <span className="text-2xl">{format.icon}</span>
                    <div className="text-center">
                      <div className="font-medium">{format.label}</div>
                      <div className={`text-xs ${
                        exportOptions.format === format.value 
                          ? 'text-white/80' 
                          : 'text-muted-foreground'
                      }`}>{format.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Report Configuration */}
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Report Title</Label>
                <Input
                  value={exportOptions.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter report title"
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground">
                  {exportOptions.title.length}/100 characters
                </div>
              </div>

              <div className="space-y-3">
                <Label>Watermark (Optional)</Label>
                <Input
                  value={exportOptions.watermark}
                  onChange={(e) => handleWatermarkChange(e.target.value)}
                  placeholder="Company name, date, or custom text"
                />
              </div>
            </div>

            {/* Content Options */}
            <div className="space-y-4">
              <Label>Content to Include</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Charts & Visualizations</div>
                      <div className="text-sm text-muted-foreground">Performance trends and analytics charts</div>
                    </div>
                  </div>
                  <Switch
                    checked={exportOptions.includeCharts}
                    onCheckedChange={() => toggleOption('includeCharts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Table className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Data Tables</div>
                      <div className="text-sm text-muted-foreground">Raw data and KPI tables</div>
                    </div>
                  </div>
                  <Switch
                    checked={exportOptions.includeTables}
                    onCheckedChange={() => toggleOption('includeTables')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium">Business Insights</div>
                      <div className="text-sm text-muted-foreground">AI-generated recommendations and insights</div>
                    </div>
                  </div>
                  <Switch
                    checked={exportOptions.includeInsights}
                    onCheckedChange={() => toggleOption('includeInsights')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Custom Styling</div>
                      <div className="text-sm text-muted-foreground">Company branding and custom themes</div>
                    </div>
                  </div>
                  <Switch
                    checked={exportOptions.customStyling}
                    onCheckedChange={() => toggleOption('customStyling')}
                  />
                </div>
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Export Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{getFormatIcon(exportOptions.format)}</span>
                    <span className="font-medium">{supportedFormats.find(f => f.value === exportOptions.format)?.label}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimated Size:</span>
                  <div className="font-medium mt-1">
                    {(estimatedFileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {getFormatDescription(exportOptions.format)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Report Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Preview of your {exportOptions.format.toUpperCase()} report
              </p>
              
              <div className="max-w-md mx-auto space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Executive Summary</span>
                </div>
                {exportOptions.includeCharts && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Performance Charts & Trends</span>
                  </div>
                )}
                {exportOptions.includeTables && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">KPI Tables & Data Analysis</span>
                  </div>
                )}
                {exportOptions.includeInsights && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Business Insights & Recommendations</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Data Quality Assessment</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {!isExporting && !exportResult && (
              <div className="text-center py-8">
                <Download className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Export</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your export options and click Export to generate your report
                </p>
                <Button onClick={handleExport} className="w-full max-w-xs">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            )}

            {isExporting && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
                <h3 className="text-lg font-semibold">Generating Report...</h3>
                <p className="text-sm text-muted-foreground">
                  Creating your {exportOptions.format.toUpperCase()} report
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                </div>
              </div>
            )}

            {exportResult && (
              <div className="text-center py-8 space-y-4">
                {exportResult.success ? (
                  <>
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                    <h3 className="text-lg font-semibold text-green-600">Export Successful!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your report has been generated successfully
                    </p>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>File Name:</span>
                          <span className="font-medium">{exportResult.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>File Size:</span>
                          <span className="font-medium">
                            {(exportResult.fileSize! / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleDownload} className="w-full max-w-xs">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
                    <h3 className="text-lg font-semibold text-red-600">Export Failed</h3>
                    <p className="text-sm text-muted-foreground">
                      {exportResult.error || 'An unexpected error occurred'}
                    </p>
                    
                    <Button onClick={handleExport} variant="outline" className="w-full max-w-xs">
                      <Download className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
