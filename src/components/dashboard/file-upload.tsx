'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle, Trash2, Cloud, AlertTriangle, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';
import { useBusinessData } from '@/contexts/business-data-context';
import { useAuth } from '@/contexts/auth-context';
import { FirebaseStorageService } from '@/services/firebase-storage-service';

interface FileUploadProps {
  onFileProcessed: (data: any, fileData?: string, fileName?: string) => void | Promise<void>;
  onProcessing: (isProcessing: boolean) => void;
}

export function FileUpload({ onFileProcessed, onProcessing }: FileUploadProps) {
  const { businessData, clearStoredData, fileUrl, fileName } = useBusinessData();
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [uploadingToCloud, setUploadingToCloud] = useState(false);
  
  // Check if there's data in storage on component mount
  useEffect(() => {
    setHasStoredData(!!businessData);
  }, [businessData]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    setError(null);
    setSuccess(false);
    
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a CSV or Excel file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const processFile = async () => {
    if (!file) return;
    
    setProcessing(true);
    setProgress(0);
  onProcessing(true);
    
    try {
      // Simulate processing steps
      const steps = [
        'Reading file...',
        'Parsing data...',
        'Uploading to cloud...',
        'Analyzing metrics...',
        'Generating insights...',
        'Preparing dashboard...'
      ];
      
      const stepDelayMs = 120; // make UI snappy
      for (let i = 0; i < steps.length; i++) {
        setProgress((i + 1) * (100 / steps.length));
        if (i === 2) {
          // Only show cloud step if user logged in (actual upload handled async in context)
          setUploadingToCloud(!!user);
        }
        await new Promise(resolve => setTimeout(resolve, stepDelayMs));
      }
      
      // Parse the file based on type
      const data = await parseFile(file);
      
      // Convert file to base64 for Firebase Storage
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      
      fileReader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          
          // Pass parsed data and raw file info up so context can persist to Firebase when logged in
          await onFileProcessed(data, base64Data, file.name);
          
          setSuccess(true);
          setUploadingToCloud(false);
          
          // Reset after 2 seconds
          setTimeout(() => {
            setSuccess(false);
            setFile(null);
            setProgress(0);
          }, 2000);
        } catch (error) {
          console.error('Error uploading file:', error);
          setError('Failed to upload file to cloud storage.');
          setUploadingToCloud(false);
        }
      };
      
      fileReader.onerror = () => {
        setError('Failed to read file for cloud upload.');
        setUploadingToCloud(false);
      };
      
    } catch (err) {
      setError('Failed to process file. Please try again.');
      setUploadingToCloud(false);
    } finally {
      setProcessing(false);
  onProcessing(false);
    }
  };

  const parseFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let data;
          
          if (file.type === 'text/csv') {
            data = parseCSV(content);
          } else {
            // For Excel files, we'll simulate parsing
            data = parseExcel(e.target?.result as ArrayBuffer);
          }
          
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    return { type: 'csv', headers, data, rawContent: content };
  };

  const parseExcel = (content: ArrayBuffer) => {
    // Simulate Excel parsing - in a real app, you'd use a library like xlsx
    return {
      type: 'excel',
      data: [],
      message: 'Excel parsing would be implemented with xlsx library'
    };
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Business Data
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={user ? "default" : "secondary"} 
              className={`text-xs ${user ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
            >
              {user ? (
                <>
                  <Cloud className="h-3 w-3 mr-1" />
                  Firebase
                </>
              ) : (
                <>
                  <HardDrive className="h-3 w-3 mr-1" />
                  Local only
                </>
              )}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasStoredData && !file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Using previously uploaded data</p>
                <p className="text-sm text-gray-500">
                  {fileName && (
                    <span className="flex items-center">
                      {user ? (
                        <>
                          <Cloud className="h-3 w-3 mr-1" /> 
                          {fileName} (stored in Firebase)
                        </>
                      ) : (
                        <>
                          <HardDrive className="h-3 w-3 mr-1" />
                          {fileName} (stored locally)
                        </>
                      )}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearStoredData();
                  setHasStoredData(false);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </Button>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-colors border-gray-300 hover:border-gray-400"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <p className="text-sm text-gray-500 mb-2">
                Upload new file to replace current data
              </p>
              <Button
                variant="outline"
                size="sm"
              >
                Choose File
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </div>
        ) : !file ? (
            <>
              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Local storage mode</p>
                    <p className="text-xs text-amber-700">Your data will only be stored in this browser. For secure Firebase cloud storage, please log in with Google.</p>
                  </div>
                </div>
              )}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your business data file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Choose File
            </Button>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <p className="text-xs text-gray-400 mt-2">
              Supports CSV, Excel files up to 10MB
            </p>
          </div>
            </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={processing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadingToCloud ? 'Uploading to cloud...' : 'Processing...'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>File processed successfully! Dashboard updated.</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={processFile}
                disabled={processing}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Process File'}
              </Button>
              <Button
                variant="outline"
                onClick={removeFile}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

