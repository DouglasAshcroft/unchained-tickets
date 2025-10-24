import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePosterFile } from '../usePosterFile';

// Mock FileReader
class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(file: File) {
    // Simulate async file reading
    setTimeout(() => {
      if (this.onload) {
        this.result = `data:${file.type};base64,mockbase64data`;
        this.onload({ target: this } as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  abort() {
    // Mock abort
  }
}

// Override global FileReader
global.FileReader = MockFileReader as unknown as typeof FileReader;

// Helper to create mock files
const createMockFile = (
  name: string,
  size: number,
  type: string
): File => {
  const file = new File(['a'.repeat(size)], name, { type });
  return file;
};

describe('usePosterFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with no file selected', () => {
      const { result } = renderHook(() => usePosterFile());

      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => usePosterFile());

      expect(typeof result.current.selectFile).toBe('function');
      expect(typeof result.current.clearFile).toBe('function');
      expect(typeof result.current.validateFile).toBe('function');
    });
  });

  describe('file validation', () => {
    it('should accept valid image files', () => {
      const { result } = renderHook(() => usePosterFile());
      const validFile = createMockFile('poster.jpg', 1024 * 1024, 'image/jpeg');

      const isValid = result.current.validateFile(validFile);

      expect(isValid).toBe(true);
    });

    it('should accept PNG images', () => {
      const { result } = renderHook(() => usePosterFile());
      const pngFile = createMockFile('poster.png', 1024 * 1024, 'image/png');

      const isValid = result.current.validateFile(pngFile);

      expect(isValid).toBe(true);
    });

    it('should accept WEBP images', () => {
      const { result } = renderHook(() => usePosterFile());
      const webpFile = createMockFile('poster.webp', 1024 * 1024, 'image/webp');

      const isValid = result.current.validateFile(webpFile);

      expect(isValid).toBe(true);
    });

    it('should reject non-image files', () => {
      const { result } = renderHook(() => usePosterFile());
      const pdfFile = createMockFile('document.pdf', 1024, 'application/pdf');

      const isValid = result.current.validateFile(pdfFile);

      expect(isValid).toBe(false);
    });

    it('should reject video files', () => {
      const { result } = renderHook(() => usePosterFile());
      const videoFile = createMockFile('video.mp4', 1024, 'video/mp4');

      const isValid = result.current.validateFile(videoFile);

      expect(isValid).toBe(false);
    });

    it('should reject files larger than 10MB', () => {
      const { result } = renderHook(() => usePosterFile());
      const largeFile = createMockFile(
        'large.jpg',
        11 * 1024 * 1024, // 11MB
        'image/jpeg'
      );

      const isValid = result.current.validateFile(largeFile);

      expect(isValid).toBe(false);
    });

    it('should accept files exactly at 10MB limit', () => {
      const { result } = renderHook(() => usePosterFile());
      const exactFile = createMockFile(
        'exact.jpg',
        10 * 1024 * 1024, // Exactly 10MB
        'image/jpeg'
      );

      const isValid = result.current.validateFile(exactFile);

      expect(isValid).toBe(true);
    });
  });

  describe('file selection', () => {
    it('should select a valid file and generate preview', async () => {
      const { result } = renderHook(() => usePosterFile());
      const validFile = createMockFile('poster.jpg', 1024, 'image/jpeg');

      await act(async () => {
        await result.current.selectFile(validFile);
      });

      expect(result.current.file).toBe(validFile);
      expect(result.current.previewUrl).toBe('data:image/jpeg;base64,mockbase64data');
      expect(result.current.error).toBeNull();
    });

    it('should clear loading state after preview generation completes', async () => {
      const { result } = renderHook(() => usePosterFile());
      const validFile = createMockFile('poster.png', 1024, 'image/png');

      await act(async () => {
        await result.current.selectFile(validFile);
      });

      // Loading should be false after completion
      expect(result.current.isLoading).toBe(false);
      // File should be selected
      expect(result.current.file).toBe(validFile);
      // Preview should be generated
      expect(result.current.previewUrl).not.toBeNull();
    });

    it('should reject invalid file type and set error', async () => {
      const { result } = renderHook(() => usePosterFile());
      const invalidFile = createMockFile('document.txt', 1024, 'text/plain');

      await act(async () => {
        await result.current.selectFile(invalidFile);
      });

      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.error).toBe(
        'Invalid file type. Please upload an image (JPEG, PNG, or WEBP).'
      );
    });

    it('should reject oversized file and set error', async () => {
      const { result } = renderHook(() => usePosterFile());
      const largeFile = createMockFile(
        'large.jpg',
        15 * 1024 * 1024,
        'image/jpeg'
      );

      await act(async () => {
        await result.current.selectFile(largeFile);
      });

      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.error).toBe(
        'File size exceeds 10MB limit. Please choose a smaller image.'
      );
    });

    it('should replace previously selected file', async () => {
      const { result } = renderHook(() => usePosterFile());
      const firstFile = createMockFile('first.jpg', 1024, 'image/jpeg');
      const secondFile = createMockFile('second.png', 2048, 'image/png');

      await act(async () => {
        await result.current.selectFile(firstFile);
      });

      expect(result.current.file?.name).toBe('first.jpg');

      await act(async () => {
        await result.current.selectFile(secondFile);
      });

      expect(result.current.file?.name).toBe('second.png');
      expect(result.current.previewUrl).toBe('data:image/png;base64,mockbase64data');
    });

    it('should clear previous error when selecting valid file', async () => {
      const { result } = renderHook(() => usePosterFile());
      const invalidFile = createMockFile('doc.pdf', 1024, 'application/pdf');
      const validFile = createMockFile('poster.jpg', 1024, 'image/jpeg');

      // First select invalid file
      await act(async () => {
        await result.current.selectFile(invalidFile);
      });

      expect(result.current.error).not.toBeNull();

      // Then select valid file
      await act(async () => {
        await result.current.selectFile(validFile);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.file).toBe(validFile);
    });
  });

  describe('file clearing', () => {
    it('should clear selected file', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file = createMockFile('poster.jpg', 1024, 'image/jpeg');

      await act(async () => {
        await result.current.selectFile(file);
      });

      expect(result.current.file).toBe(file);

      act(() => {
        result.current.clearFile();
      });

      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should clear error state', async () => {
      const { result } = renderHook(() => usePosterFile());
      const invalidFile = createMockFile('doc.txt', 1024, 'text/plain');

      await act(async () => {
        await result.current.selectFile(invalidFile);
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearFile();
      });

      expect(result.current.error).toBeNull();
    });

    it('should be safe to call clearFile multiple times', () => {
      const { result } = renderHook(() => usePosterFile());

      act(() => {
        result.current.clearFile();
        result.current.clearFile();
        result.current.clearFile();
      });

      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('drag and drop support', () => {
    it('should handle file from drag event', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file = createMockFile('dropped.jpg', 1024, 'image/jpeg');

      await act(async () => {
        await result.current.selectFile(file);
      });

      expect(result.current.file).toBe(file);
      expect(result.current.previewUrl).not.toBeNull();
    });

    it('should validate dragged files', async () => {
      const { result } = renderHook(() => usePosterFile());
      const invalidFile = createMockFile('dropped.exe', 1024, 'application/x-msdownload');

      await act(async () => {
        await result.current.selectFile(invalidFile);
      });

      expect(result.current.file).toBeNull();
      expect(result.current.error).not.toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle FileReader errors gracefully', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file = createMockFile('poster.jpg', 1024, 'image/jpeg');

      // Mock FileReader to trigger error
      const originalFileReader = global.FileReader;
      class ErrorFileReader {
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({} as ProgressEvent<FileReader>);
            }
          }, 0);
        }
        abort() {}
      }
      global.FileReader = ErrorFileReader as unknown as typeof FileReader;

      await act(async () => {
        await result.current.selectFile(file);
      });

      expect(result.current.error).toBe('Failed to read file. Please try again.');
      expect(result.current.file).toBeNull();
      expect(result.current.previewUrl).toBeNull();

      // Restore original FileReader
      global.FileReader = originalFileReader;
    });

    it('should set error for type validation failure', async () => {
      const { result } = renderHook(() => usePosterFile());
      const csvFile = createMockFile('data.csv', 1024, 'text/csv');

      await act(async () => {
        await result.current.selectFile(csvFile);
      });

      expect(result.current.error).toContain('Invalid file type');
    });

    it('should set error for size validation failure', async () => {
      const { result } = renderHook(() => usePosterFile());
      const hugeFile = createMockFile('huge.jpg', 15 * 1024 * 1024, 'image/jpeg');

      await act(async () => {
        await result.current.selectFile(hugeFile);
      });

      expect(result.current.error).toContain('exceeds 10MB limit');
    });
  });

  describe('edge cases', () => {
    it('should handle empty file name', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file = createMockFile('', 1024, 'image/jpeg');

      await act(async () => {
        await result.current.selectFile(file);
      });

      expect(result.current.file).toBe(file);
    });

    it('should handle very small files', async () => {
      const { result } = renderHook(() => usePosterFile());
      const tinyFile = createMockFile('tiny.jpg', 100, 'image/jpeg');

      await act(async () => {
        await result.current.selectFile(tinyFile);
      });

      expect(result.current.file).toBe(tinyFile);
      expect(result.current.error).toBeNull();
    });

    it('should handle file exactly at boundary (10MB)', async () => {
      const { result } = renderHook(() => usePosterFile());
      const boundaryFile = createMockFile(
        'boundary.jpg',
        10 * 1024 * 1024,
        'image/jpeg'
      );

      await act(async () => {
        await result.current.selectFile(boundaryFile);
      });

      expect(result.current.file).toBe(boundaryFile);
      expect(result.current.error).toBeNull();
    });

    it('should handle case-insensitive MIME types', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file = createMockFile('image.JPG', 1024, 'image/JPEG');

      const isValid = result.current.validateFile(file);

      expect(isValid).toBe(true);
    });
  });

  describe('preview URL generation', () => {
    it('should generate data URL for JPEG', async () => {
      const { result } = renderHook(() => usePosterFile());
      const jpegFile = createMockFile('photo.jpg', 1024, 'image/jpeg');

      await act(async () => {
        await result.current.selectFile(jpegFile);
      });

      expect(result.current.previewUrl).toContain('data:image/jpeg');
    });

    it('should generate data URL for PNG', async () => {
      const { result } = renderHook(() => usePosterFile());
      const pngFile = createMockFile('graphic.png', 1024, 'image/png');

      await act(async () => {
        await result.current.selectFile(pngFile);
      });

      expect(result.current.previewUrl).toContain('data:image/png');
    });

    it('should generate data URL for WEBP', async () => {
      const { result } = renderHook(() => usePosterFile());
      const webpFile = createMockFile('modern.webp', 1024, 'image/webp');

      await act(async () => {
        await result.current.selectFile(webpFile);
      });

      expect(result.current.previewUrl).toContain('data:image/webp');
    });
  });

  describe('multiple operations', () => {
    it('should handle rapid file selections', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file1 = createMockFile('first.jpg', 1024, 'image/jpeg');
      const file2 = createMockFile('second.png', 2048, 'image/png');
      const file3 = createMockFile('third.webp', 3072, 'image/webp');

      await act(async () => {
        await result.current.selectFile(file1);
        await result.current.selectFile(file2);
        await result.current.selectFile(file3);
      });

      expect(result.current.file).toBe(file3);
      expect(result.current.previewUrl).toContain('data:image/webp');
    });

    it('should handle select, clear, select pattern', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file1 = createMockFile('first.jpg', 1024, 'image/jpeg');
      const file2 = createMockFile('second.png', 2048, 'image/png');

      await act(async () => {
        await result.current.selectFile(file1);
      });

      expect(result.current.file).toBe(file1);

      act(() => {
        result.current.clearFile();
      });

      expect(result.current.file).toBeNull();

      await act(async () => {
        await result.current.selectFile(file2);
      });

      expect(result.current.file).toBe(file2);
    });

    it('should handle validation then selection', async () => {
      const { result } = renderHook(() => usePosterFile());
      const file = createMockFile('poster.jpg', 1024, 'image/jpeg');

      // First validate
      const isValid = result.current.validateFile(file);
      expect(isValid).toBe(true);

      // Then select
      await act(async () => {
        await result.current.selectFile(file);
      });

      expect(result.current.file).toBe(file);
      expect(result.current.error).toBeNull();
    });
  });
});
