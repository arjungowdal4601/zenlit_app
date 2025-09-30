import imageCompression from 'browser-image-compression';

// Maximum file size target (550KB)
const MAX_FILE_SIZE_KB = 550;
const MAX_FILE_SIZE = MAX_FILE_SIZE_KB * 1024;
const MAX_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

// Compression options
const COMPRESSION_OPTIONS = {
  maxSizeMB: MAX_SIZE_MB,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: 0.8,
};

export interface CompressionResult {
  success: boolean;
  file?: File;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

/**
 * Compress an image file to meet size requirements
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    const originalSize = file.size;

    // If file is already under the limit, return as is
    if (originalSize <= MAX_FILE_SIZE) {
      return {
        success: true,
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
      };
    }

    // Compress the image
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    const compressedSize = compressedFile.size;

    // If still too large, try with lower quality
    if (compressedSize > MAX_FILE_SIZE) {
      const aggressiveOptions = {
        ...COMPRESSION_OPTIONS,
        maxSizeMB: Math.max(MAX_SIZE_MB * 0.8, 0.35),
        initialQuality: 0.6,
        maxWidthOrHeight: 1280,
      };

      const secondCompression = await imageCompression(file, aggressiveOptions);
      
      if (secondCompression.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'Unable to compress image below 550KB. Please choose a smaller image.',
          originalSize,
        };
      }

      return {
        success: true,
        file: secondCompression,
        originalSize,
        compressedSize: secondCompression.size,
        compressionRatio: originalSize / secondCompression.size,
      };
    }

    return {
      success: true,
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
    };
  } catch (error) {
    console.error('Image compression error:', error);
    return {
      success: false,
      error: 'Failed to compress image. Please try again.',
    };
  }
}

/**
 * Validate image file before compression
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, WebP' };
  }

  // Check maximum original size (10MB)
  const maxOriginalSize = 10 * 1024 * 1024;
  if (file.size > maxOriginalSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up preview URL to prevent memory leaks
 */
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}