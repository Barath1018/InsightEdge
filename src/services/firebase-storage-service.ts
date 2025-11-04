'use client';

import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for handling file operations with Firebase Storage
 */
export class FirebaseStorageService {
  // Track whether we've already encountered a hard listAll failure (e.g. CORS) this session
  private static _previousListFailure = false;
  // Simple in‑memory debounce so multiple components calling listing at once don't all trigger requests
  private static _inFlightPromise: Promise<{ url: string; name: string }[]> | null = null;

  /**
   * Uploads a file to Firebase Storage
   * @param file - The file data as a string (base64)
   * @param path - Optional path in storage (defaults to 'business-data')
   * @returns Promise with the download URL
   */
  static async uploadFile(file: string, path: string = 'business-data'): Promise<string> {
    try {
      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user ? user.uid : 'anonymous';
      
      // Generate a unique ID for the file
      const fileId = uuidv4();
      const fileRef = ref(storage, `users/${userId}/${path}/${fileId}`);
      
      // Upload the file to Firebase Storage
      await uploadString(fileRef, file, 'data_url');
      
      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      throw error;
    }
  }

  /**
   * Deletes a file from Firebase Storage
   * @param fileUrl - The URL of the file to delete
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Create a reference from the storage URL
      const fileRef = ref(storage, this.getStoragePathFromUrl(fileUrl));
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file from Firebase Storage:', error);
      throw error;
    }
  }

  /**
   * Extracts the storage path from a Firebase Storage URL
   * @param url - The Firebase Storage URL
   * @returns The storage path
   */
  private static getStoragePathFromUrl(url: string): string {
    try {
      // Extract the path from the URL
      // Firebase Storage URLs are in the format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?[token]
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/o/')[1];
      if (!path) {
        throw new Error('Invalid Firebase Storage URL format');
      }
      // Decode the URL-encoded path
      return decodeURIComponent(path);
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      throw new Error('Failed to parse Firebase Storage URL');
    }
  }

  /**
   * Gets all business data files for the current user
   * @returns Promise with an array of file URLs and names
   */
  static async getUserBusinessDataFiles(): Promise<{ url: string, name: string }[]> {
    try {
      // Allow opt-out via env (already respected higher up, but safe if service used directly elsewhere)
      if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SKIP_CLOUD_LISTING === 'true') {
        return [];
      }

      // Fast fail if we already know listing is broken (avoid hammering preflight / noisy console)
      if (FirebaseStorageService._previousListFailure) {
        return FirebaseStorageService.localFallback();
      }
      // Reuse an inflight promise if concurrent calls happen
      if (FirebaseStorageService._inFlightPromise) {
        return await FirebaseStorageService._inFlightPromise;
      }
      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;
      
      // If no user is logged in, return empty array
      if (!user) {
        return [];
      }
      
      const userId = user.uid;

      // Basic exponential backoff (small) in case of transient network issues
      const attemptListing = async () => {
        const userFilesRef = ref(storage, `users/${userId}/business-data`);
        const filesList = await listAll(userFilesRef);
        const filesData = await Promise.all(
          filesList.items.map(async (fileRef) => {
            const url = await getDownloadURL(fileRef);
            const name = fileRef.name;
            return { url, name };
          })
        );
        return filesData;
      };

      let lastError: unknown = null;
      const maxAttempts = 2; // keep low to avoid repeated preflights on hard CORS failure
      for (let i = 0; i < maxAttempts; i++) {
        try {
          FirebaseStorageService._inFlightPromise = attemptListing();
          const result = await FirebaseStorageService._inFlightPromise;
          FirebaseStorageService._inFlightPromise = null;
          return result;
        } catch (err) {
          lastError = err;
          FirebaseStorageService._inFlightPromise = null;
          // If error looks like a CORS / HTTP status issue, don't keep retrying beyond first
            const message = (err as any)?.message || '';
            if (message.includes('CORS') || message.includes('Failed to fetch') || message.includes('ERR_FAILED')) {
              break;
            }
          // small delay before second attempt (network hiccup)
          await new Promise(r => setTimeout(r, 300));
        }
      }
      throw lastError ?? new Error('Unknown listing failure');
    } catch (error) {
      // Handle CORS and other Firebase Storage errors gracefully
      console.warn('Firebase Storage access failed (likely CORS issue):', error);
      console.log('Falling back to local storage for business data');
      FirebaseStorageService._previousListFailure = true;
      
      return FirebaseStorageService.localFallback();
    }
  }

  /**
   * Stores business data file in Firebase Storage
   * @param fileData - The file data as a string (base64)
   * @param fileName - The name of the file
   * @returns Promise with the download URL and file name
   */
  static async storeBusinessDataFile(fileData: string, fileName: string): Promise<{ url: string, name: string }> {
    try {
      const url = await this.uploadFile(fileData, 'business-data');
      return { url, name: fileName };
    } catch (error) {
      console.error('Error storing business data file:', error);
      throw error;
    }
  }

  /** Local storage fallback helper */
  private static localFallback(): { url: string; name: string }[] {
    try {
      const storedFileUrl = typeof window !== 'undefined' ? localStorage.getItem('fileUrl') : null;
      const storedFileName = typeof window !== 'undefined' ? localStorage.getItem('fileName') : null;
      if (storedFileUrl && storedFileName) {
        return [{ url: storedFileUrl, name: storedFileName }];
      }
    } catch (e) {
      console.warn('Local storage fallback also failed:', e);
    }
    return [];
  }
}