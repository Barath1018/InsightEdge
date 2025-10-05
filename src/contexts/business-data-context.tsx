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
<<<<<<< HEAD
=======
  aiMapping?: {
    columns?: { revenue?: string|null; expenses?: string|null; profit?: string|null; date?: string|null };
    charts?: { salesTitle?: string; profitTitle?: string };
  } | null;
>>>>>>> 07df53a (added ai)
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
<<<<<<< HEAD
=======
  const [aiMapping, setAiMapping] = useState<BusinessDataContextType['aiMapping']>(null);
>>>>>>> 07df53a (added ai)
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
      
      // Save the data and file information
      await setBusinessData(parsedData, fileData, file.name);
      
<<<<<<< HEAD
      // Calculate metrics after data is loaded
      const metrics = DataAnalysisService.calculateKPIs(parsedData);
      setAnalyzedMetrics(metrics);
=======
  // Calculate metrics after data is loaded (use AI mapping if available)
  const metrics = await DataAnalysisService.analyzeBusinessData(parsedData, aiMapping || undefined);
  setAnalyzedMetrics(metrics);
>>>>>>> 07df53a (added ai)
      
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
<<<<<<< HEAD
        const storedFileUrl = localStorage.getItem('fileUrl');
        const storedFileName = localStorage.getItem('fileName');
=======
  const storedFileUrl = localStorage.getItem('fileUrl');
        const storedFileName = localStorage.getItem('fileName');
  const storedAiMapping = localStorage.getItem('aiMapping');
>>>>>>> 07df53a (added ai)
        const storedUserId = localStorage.getItem('userAuthId');

        // Load data from localStorage if it exists
        if (storedBusinessData) {
          console.log('Found business data in localStorage');
          setBusinessDataState(JSON.parse(storedBusinessData));
        }

        if (storedAnalyzedMetrics) {
          console.log('Found analyzed metrics in localStorage');
          setAnalyzedMetricsState(JSON.parse(storedAnalyzedMetrics));
        }

        if (storedFileUrl) {
          setFileUrl(storedFileUrl);
        }

        if (storedFileName) {
          setFileName(storedFileName);
        }

<<<<<<< HEAD
=======
        if (storedAiMapping) {
          try { setAiMapping(JSON.parse(storedAiMapping)); } catch {}
        }

>>>>>>> 07df53a (added ai)
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
<<<<<<< HEAD
            const userFiles = await FirebaseStorageService.getUserBusinessDataFiles();

            if (userFiles && userFiles.length > 0) {
=======
            if (process.env.NEXT_PUBLIC_SKIP_CLOUD_LISTING === 'true') {
              console.log('Skipping Firebase listing (NEXT_PUBLIC_SKIP_CLOUD_LISTING=true)');
            } else {
              const userFiles = await FirebaseStorageService.getUserBusinessDataFiles();

              if (userFiles && userFiles.length > 0) {
>>>>>>> 07df53a (added ai)
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
                
<<<<<<< HEAD
                // Load the data and calculate metrics
                setBusinessDataState(parsedData);
                const metrics = DataAnalysisService.calculateKPIs(parsedData);
=======
                // Load the data and calculate metrics (use AI mapping if available)
                setBusinessDataState(parsedData);
                const metrics = await DataAnalysisService.analyzeBusinessData(parsedData, aiMapping || undefined);
>>>>>>> 07df53a (added ai)
                setAnalyzedMetricsState(metrics);
                
                // Also save to localStorage for redundancy
                localStorage.setItem('businessData', JSON.stringify(parsedData));
                localStorage.setItem('analyzedMetrics', JSON.stringify(metrics));
                
                console.log('Successfully loaded business data from Firebase:', latestFile.name);
              } catch (fetchError) {
                console.error('Error fetching file content from Firebase:', fetchError);
                // Keep localStorage data if Firebase fetch fails
              }
<<<<<<< HEAD
            } else {
              console.log('No files found in Firebase storage for this user');
=======
              } else {
                console.log('No files found in Firebase storage for this user');
              }
>>>>>>> 07df53a (added ai)
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
<<<<<<< HEAD
=======
        // Try Gemini metric inference (best-effort)
        try {
          const statusRes = await fetch('/api/ai/status');
          if (statusRes.ok) {
            const { enabled } = await statusRes.json();
            if (enabled) {
              const resp = await fetch('/api/ai/infer-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ headers: data.headers, sampleRows: data.data.slice(0, 200) }),
              });
              if (resp.ok) {
                const json = await resp.json();
                const mapping = {
                  columns: json.columns || {},
                  charts: json.charts || {},
                };
                setAiMapping(mapping);
                localStorage.setItem('aiMapping', JSON.stringify(mapping));
              }
            }
          }
        } catch {}

>>>>>>> 07df53a (added ai)
        // Prioritize Firebase storage if user is logged in and file data is provided
        if (user && fileData && fileName) {
          console.log('User is logged in, saving data to Firebase...');
          // Upload to Firebase Storage with user ID in the path
          const result = await FirebaseStorageService.storeBusinessDataFile(fileData, fileName);

          // Create metadata with user ID
          const metadata = {
            fileName: result.name,
            url: result.url,
            uploadDate: new Date().toISOString(),
            userId: user.uid || 'anonymous' // Store user ID in metadata
          };

          // Store the file URL and name in localStorage with user ID for persistence
          localStorage.setItem('fileUrl', result.url);
          localStorage.setItem('fileName', result.name);
          localStorage.setItem('userAuthId', user.uid);
          localStorage.setItem('businessDataMetadata', JSON.stringify(metadata));

          // Update state with file info
          setFileUrl(result.url);
          setFileName(result.name);
          console.log('Data saved to Firebase successfully');
        } else {
          console.log('User not logged in or no file data, skipping Firebase save');
        }
        
        // Always save to localStorage as a fallback
        localStorage.setItem('businessData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save business data:', error);
        // Still try to save to localStorage even if Firebase fails
        try {
          localStorage.setItem('businessData', JSON.stringify(data));
          console.log('Data saved to localStorage as fallback');
        } catch (localError) {
          console.error('Failed to save to localStorage:', localError);
        }
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
<<<<<<< HEAD
=======
  setAiMapping(null);
>>>>>>> 07df53a (added ai)
      
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
<<<<<<< HEAD
=======
      aiMapping,
>>>>>>> 07df53a (added ai)
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
