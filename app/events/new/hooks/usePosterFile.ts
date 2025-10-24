import { useState, useCallback } from 'react';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Error messages
const ERROR_MESSAGES = {
  invalidType: 'Invalid file type. Please upload an image (JPEG, PNG, or WEBP).',
  tooLarge: 'File size exceeds 10MB limit. Please choose a smaller image.',
  readFailed: 'Failed to read file. Please try again.',
} as const;

/**
 * Custom hook to manage poster file uploads
 *
 * Handles file selection, validation, and preview generation for poster images.
 * Supports drag-and-drop and file input selection.
 *
 * Validation rules:
 * - File type: JPEG, PNG, or WEBP images only
 * - File size: Maximum 10MB
 *
 * @returns File upload state and methods
 */
export function usePosterFile() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate a file against type and size constraints
   *
   * @param file - File to validate
   * @returns true if file is valid, false otherwise
   */
  const validateFile = useCallback((file: File): boolean => {
    // Check file type (case-insensitive)
    const fileType = file.type.toLowerCase();
    if (!ACCEPTED_IMAGE_TYPES.includes(fileType)) {
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return false;
    }

    return true;
  }, []);

  /**
   * Generate a preview URL from a file using FileReader
   *
   * @param file - File to generate preview for
   * @returns Promise that resolves to data URL or rejects on error
   */
  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Select a file and generate preview
   * Validates file before accepting
   *
   * @param file - File to select
   */
  const selectFile = useCallback(
    async (file: File): Promise<void> => {
      // Clear previous errors
      setError(null);

      // Validate file type
      const fileType = file.type.toLowerCase();
      if (!ACCEPTED_IMAGE_TYPES.includes(fileType)) {
        setError(ERROR_MESSAGES.invalidType);
        setFile(null);
        setPreviewUrl(null);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(ERROR_MESSAGES.tooLarge);
        setFile(null);
        setPreviewUrl(null);
        return;
      }

      // File is valid, generate preview
      setIsLoading(true);
      try {
        const dataUrl = await generatePreview(file);
        setFile(file);
        setPreviewUrl(dataUrl);
        setError(null);
      } catch {
        setError(ERROR_MESSAGES.readFailed);
        setFile(null);
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    },
    [generatePreview]
  );

  /**
   * Clear the selected file and reset state
   */
  const clearFile = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    // State
    file,
    previewUrl,
    error,
    isLoading,

    // Methods
    validateFile,
    selectFile,
    clearFile,
  };
}
