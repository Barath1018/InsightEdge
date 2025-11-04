'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BusinessData, AnalyzedMetrics } from '@/services/data-analysis-service';
import { FirebaseStorageService } from '@/services/firebase-storage-service';
import { useAuth } from '@/contexts/auth-context';
import { DataAnalysisService } from '@/services/data-analysis-service';

interface BusinessDataContextType {
  businessData: BusinessData | null;
  analyzedMetrics: AnalyzedMetrics | null;
  isProcessing: boolean;
  fileUrl: string | null;
  fileName: string | null;
  aiMapping?: {
    columns?: { revenue?: string|null; expenses?: string|null; profit?: string|null; date?: string|null };
    charts?: { salesTitle?: string; profitTitle?: string };
  } | null;
  setBusinessData: (data: BusinessData | null, fileData?: string, fileName?: string) => Promise<void>;
  setAnalyzedMetrics: (metrics: AnalyzedMetrics | null) => void;
  setIsProcessing: (processing: boolean) => void;
  clearStoredData: () => Promise<void>;
}

const BusinessDataContext = createContext<BusinessDataContextType | undefined>(undefined);

export function BusinessDataProvider({ children }: { children: ReactNode }) {
  const [businessData, setBusinessDataState] = useState<BusinessData | null>(null);
  const [analyzedMetrics, setAnalyzedMetricsState] = useState<AnalyzedMetrics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [aiMapping, setAiMapping] = useState<BusinessDataContextType['aiMapping']>(null);
  const { user } = useAuth();
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const fileData = await readFileAsDataURL(file);
      const parsedData = await parseCSVFile(fileData);
      
      console.log('File parsed successfully, preparing to save data...');
      
      // Check if user is logged in
      if (user) {
        console.log('User is logged in, will prioritize Firebase storage');
      } else {
        console.log('User is not logged in, data will only be saved to localStorage');
        console.warn('WARNING: Data may be lost on browser refresh. Please log in for better data persistence.');
      }
      
      // Save the data and file information immediately (non-blocking upload handled inside)
      await setBusinessData(parsedData, fileData, file.name);

      // Calculate metrics right away so UI updates promptly (do not wait for AI/network tasks)
      const metrics = await DataAnalysisService.analyzeBusinessData(parsedData, aiMapping || undefined);
      setAnalyzedMetrics(metrics);
      
      // Kick off AI mapping + optional Gemini analysis in background after UI is responsive
      (async () => {
        try {
          const statusRes = await fetch('/api/ai/status');
          if (statusRes.ok) {
            const statusJson = await statusRes.json();
            if (statusJson.enabled) {
              try {
                const inferRes = await fetch('/api/ai/infer-metrics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ headers: parsedData.headers, sampleRows: parsedData.data.slice(0, 50) })
                });
                if (inferRes.ok) {
                  const mapping = await inferRes.json();
                  setAiMapping(mapping);
                  try { localStorage.setItem('aiMapping', JSON.stringify(mapping)); } catch {}
                  // Optionally refresh analyzed metrics with new mapping (lightweight)
                  try {
                    const remetrics = await DataAnalysisService.analyzeBusinessData(parsedData, mapping);
                    setAnalyzedMetricsState(remetrics);
                    try { localStorage.setItem('analyzedMetrics', JSON.stringify(remetrics)); } catch {}
                  } catch {}
                }
              } catch (inferErr) {
                console.warn('AI infer-metrics failed (background):', inferErr);
              }

              // Optionally auto-run Gemini summary without blocking UI
              try {
                let autoRun = false;
                try {
                  if (user && user.uid) {
                    const { default: FirebaseUserSettingsService } = await import('@/services/firebase-user-settings-service');
                    const settings = await FirebaseUserSettingsService.getUserSettings(user.uid);
                    if (settings && typeof settings.autoRunGemini === 'boolean') {
                      autoRun = settings.autoRunGemini;
                    } else {
                      autoRun = localStorage.getItem('autoRunGemini') === 'true';
                    }
                  } else {
                    autoRun = localStorage.getItem('autoRunGemini') === 'true';
                  }
                } catch (e) {
                  autoRun = localStorage.getItem('autoRunGemini') === 'true';
                }

                if (autoRun) {
                  const askRes = await fetch('/api/ai/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'Provide a short summary and 3 insights for this dataset', dataset: { headers: parsedData.headers, data: parsedData.data.slice(0, 500) } })
                  });
                  if (askRes.ok) {
                    const analysis = await askRes.json();
                    try { localStorage.setItem('lastGeminiAnalysis', JSON.stringify(analysis)); } catch {}
                  } else {
                    try { localStorage.removeItem('lastGeminiAnalysis'); } catch {}
                  }
                }
              } catch (askErr) {
                console.warn('Gemini auto-analysis failed (background):', askErr);
              }
            }
          }
        } catch (statusErr) {
          console.warn('AI status check failed (background)', statusErr);
        }
      })();

      return { success: true, data: parsedData };
    } catch (error) {
      console.error('Error processing file:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Load data from Firebase and localStorage on initial render
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Set loading state
        setIsProcessing(true);
        
        // Always load from localStorage first - this ensures data is always visible
        console.log('Loading data from localStorage...');
        const storedBusinessData = localStorage.getItem('businessData');
        const storedAnalyzedMetrics = localStorage.getItem('analyzedMetrics');
        const storedFileUrl = localStorage.getItem('fileUrl');
        const storedFileName = localStorage.getItem('fileName');
        const storedAiMapping = localStorage.getItem('aiMapping');
        const storedUserId = localStorage.getItem('userAuthId');

        // Load data from localStorage if it exists
        let parsedLocalBusiness: BusinessData | null = null;
        let parsedLocalMetrics: AnalyzedMetrics | null = null;
        let parsedLocalMapping: any | null = null;

        if (storedBusinessData) {
          console.log('Found business data in localStorage');
          try { parsedLocalBusiness = JSON.parse(storedBusinessData) as BusinessData; } catch {}
          if (parsedLocalBusiness) setBusinessDataState(parsedLocalBusiness);
        }

        if (storedAnalyzedMetrics) {
          console.log('Found analyzed metrics in localStorage');
          try { parsedLocalMetrics = JSON.parse(storedAnalyzedMetrics) as AnalyzedMetrics; } catch {}
          if (parsedLocalMetrics) setAnalyzedMetricsState(parsedLocalMetrics);
        }

        if (storedFileUrl) {
          setFileUrl(storedFileUrl);
        }

        if (storedFileName) {
          setFileName(storedFileName);
        }

        if (storedAiMapping) {
          try { parsedLocalMapping = JSON.parse(storedAiMapping); setAiMapping(parsedLocalMapping); } catch {}
        }

        // If we have data but no analyzed metrics locally, compute them now (fixes blank Overview after refresh)
        if (parsedLocalBusiness && !parsedLocalMetrics) {
          try {
            console.log('Analyzed metrics not found locally; computing from stored business data...');
            const computed = await DataAnalysisService.analyzeBusinessData(parsedLocalBusiness, parsedLocalMapping || undefined);
            setAnalyzedMetricsState(computed);
            try { localStorage.setItem('analyzedMetrics', JSON.stringify(computed)); } catch {}
          } catch (computeErr) {
            console.warn('Failed to compute analyzed metrics from local data', computeErr);
          }
        }

        // Only attempt Firebase loading if user is logged in
        if (user) {
          console.log('User is logged in, checking Firebase for newer data...');
          
          // Check if this is a different user than the stored data
          if (storedUserId && storedUserId !== user.uid) {
            console.log('User changed, clearing previous user data');
            localStorage.removeItem('businessData');
            localStorage.removeItem('analyzedMetrics');
            localStorage.removeItem('fileUrl');
            localStorage.removeItem('fileName');
            localStorage.removeItem('businessDataMetadata');
            setBusinessDataState(null);
            setAnalyzedMetricsState(null);
            setFileUrl(null);
            setFileName(null);
          }
          
          // Update user ID
          localStorage.setItem('userAuthId', user.uid);
          
          try {
            if (process.env.NEXT_PUBLIC_SKIP_CLOUD_LISTING === 'true') {
              console.log('Skipping Firebase listing (NEXT_PUBLIC_SKIP_CLOUD_LISTING=true)');
            } else {
              const userFiles = await FirebaseStorageService.getUserBusinessDataFiles();

              if (userFiles && userFiles.length > 0) {
                // Use the most recent file
                const latestFile = userFiles[userFiles.length - 1];
                setFileUrl(latestFile.url);
                setFileName(latestFile.name);
                
                // Store the file URL and name in localStorage
                localStorage.setItem('fileUrl', latestFile.url);
                localStorage.setItem('fileName', latestFile.name);
                
                // Fetch the actual file content from Firebase
                try {
                  console.log('Fetching file content from Firebase:', latestFile.name);
                  const response = await fetch(latestFile.url);
                  const fileContent = await response.text();
                  
                  // Parse the CSV content
                  const parsedData = await parseCSVFile(fileContent);
                  
                  // Load the data and calculate metrics (use AI mapping if available)
                  setBusinessDataState(parsedData);
                  // Try to infer mapping from AI if available
                  let usedMappingFromCloud = aiMapping;
                  try {
                    const statusRes = await fetch('/api/ai/status');
                    if (statusRes.ok) {
                      const statusJson = await statusRes.json();
                      if (statusJson.enabled) {
                        try {
                          const inferRes = await fetch('/api/ai/infer-metrics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ headers: parsedData.headers, sampleRows: parsedData.data.slice(0, 50) })
                          });
                          if (inferRes.ok) {
                            const mapping = await inferRes.json();
                            setAiMapping(mapping);
                            usedMappingFromCloud = mapping;
                            try { localStorage.setItem('aiMapping', JSON.stringify(mapping)); } catch {}
                          }
                        } catch (inferErr) {
                          console.warn('AI infer-metrics failed during Firebase load', inferErr);
                        }
                      }
                    }
                  } catch (statusErr) {
                    console.warn('AI status check failed during Firebase load', statusErr);
                  }

                  const metrics = await DataAnalysisService.analyzeBusinessData(parsedData, usedMappingFromCloud || undefined);
                  setAnalyzedMetricsState(metrics);
                  
                  // Also save to localStorage for redundancy
                  localStorage.setItem('businessData', JSON.stringify(parsedData));
                  localStorage.setItem('analyzedMetrics', JSON.stringify(metrics));
                  
                  console.log('Successfully loaded business data from Firebase:', latestFile.name);
                } catch (fetchError) {
                  console.error('Error fetching file content from Firebase:', fetchError);
                  // Keep localStorage data if Firebase fetch fails
                }
              } else {
                console.log('No files found in Firebase storage for this user');
              }
            }
          } catch (firebaseError) {
            console.error('Error accessing Firebase storage:', firebaseError);
            // Keep localStorage data if Firebase fails
          }
        } else {
          console.log('User not logged in, using localStorage data only');
        }
        
        // Clear loading state
        setIsProcessing(false);
      } catch (error) {
        console.error('Failed to load data from storage:', error);
        setIsProcessing(false);
      }
    };

    loadUserData();
  }, [user]);

  const setBusinessData = async (data: BusinessData | null, fileData?: string, fileName?: string) => {
    setBusinessDataState(data);
    setIsProcessing(true);

    if (data) {
      try {
        // Save immediately to localStorage for fast persistence
        localStorage.setItem('businessData', JSON.stringify(data));
        if (fileName) {
          try { localStorage.setItem('fileName', fileName); } catch {}
          setFileName(fileName);
        }

        // Kick off Firebase upload asynchronously to avoid blocking UI
        if (user && fileData && fileName) {
          (async () => {
            try {
              console.log('User is logged in, saving data to Firebase (async)...');
              const result = await FirebaseStorageService.storeBusinessDataFile(fileData, fileName);
              const metadata = {
                fileName: result.name,
                url: result.url,
                uploadDate: new Date().toISOString(),
                userId: user.uid || 'anonymous'
              };
              localStorage.setItem('fileUrl', result.url);
              localStorage.setItem('fileName', result.name);
              localStorage.setItem('userAuthId', user.uid);
              localStorage.setItem('businessDataMetadata', JSON.stringify(metadata));
              setFileUrl(result.url);
              setFileName(result.name);
              console.log('Data saved to Firebase successfully');
            } catch (firebaseErr) {
              console.warn('Async Firebase save failed; continuing with local data only', firebaseErr);
            }
          })();
        } else {
          console.log('User not logged in or no file data, skipping Firebase save');
        }
      } catch (error) {
        console.error('Failed to persist business data locally:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
    }
  };

  const setAnalyzedMetrics = (metrics: AnalyzedMetrics | null) => {
    setAnalyzedMetricsState(metrics);
    if (metrics) {
      try {
        localStorage.setItem('analyzedMetrics', JSON.stringify(metrics));
      } catch (error) {
        console.error('Failed to save analyzed metrics to localStorage:', error);
      }
    }
  };

  // Function to clear stored data
  const clearStoredData = async () => {
    setIsProcessing(true);
    try {
      // If there's a file in Firebase Storage and user is logged in, delete it
      if (fileUrl && user) {
        console.log('User is logged in, attempting to delete file from Firebase...');
        try {
          await FirebaseStorageService.deleteFile(fileUrl);
          console.log('Successfully deleted file from Firebase');
        } catch (firebaseError) {
          console.error('Failed to delete file from Firebase Storage:', firebaseError);
        }
      }
      
      // Clear data from localStorage
      console.log('Clearing data from localStorage...');
      localStorage.removeItem('businessData');
      localStorage.removeItem('analyzedMetrics');
      localStorage.removeItem('businessDataMetadata');
      // Don't remove userAuthId as we want to maintain the user session
      // Just clear the data associated with this user
      
      // Clear state
      setBusinessDataState(null);
      setAnalyzedMetricsState(null);
      setAiMapping(null);
      
      if (fileUrl) {
        localStorage.removeItem('fileUrl');
        localStorage.removeItem('fileName');
        setFileUrl(null);
        setFileName(null);
      }
      
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear data from storage:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a console warning when user is not logged in but has data
  useEffect(() => {
    if (businessData && !user) {
      console.warn('Data Persistence Warning: You are not logged in. Your data is only stored in this browser and may be lost if you clear your cache or use a different browser. Please log in with Google for better data persistence.');
    }
  }, [businessData, user]);

  return (
    <BusinessDataContext.Provider value={{
      businessData,
      analyzedMetrics,
      isProcessing,
      fileUrl,
      fileName,
      aiMapping,
      setBusinessData,
      setAnalyzedMetrics,
      setIsProcessing,
      clearStoredData,
    }}>
      {children}
    </BusinessDataContext.Provider>
  );
}

// Utility functions for handling file operations
async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function parseCSVFile(fileContent: string): Promise<BusinessData> {
  // Handle both Data URL format and plain CSV content
  let content = fileContent;
  if (fileContent.startsWith('data:')) {
    // Remove the data URL prefix
    const commaIndex = fileContent.indexOf(',');
    if (commaIndex !== -1) {
      content = fileContent.substring(commaIndex + 1);
    }
    // Decode base64 content
    content = atob(content);
  }

  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('Empty file content');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return {
    type: 'csv',
    headers,
    data,
    rawContent: content
  };
}

export function useBusinessData() {
  const context = useContext(BusinessDataContext);
  if (context === undefined) {
    throw new Error('useBusinessData must be used within a BusinessDataProvider');
  }
  return context;
}
