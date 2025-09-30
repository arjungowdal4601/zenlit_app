import { supabase } from './supabaseClient';

const PROFILE_IMAGES_BUCKET = 'profile-images';
const FEEDBACK_BUCKET = 'feedback';

const cryptoApi: Crypto | undefined =
  typeof globalThis !== 'undefined' && 'crypto' in globalThis
    ? (globalThis.crypto as Crypto)
    : undefined;

const uniqueSuffix = () =>
  cryptoApi?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;

const sanitizeExtension = (file: File): string => {
  const nameExt = file.name?.split('.').pop();
  if (nameExt && nameExt.trim().length > 0) {
    return nameExt.trim().toLowerCase();
  }

  const typeExt = file.type?.split('/').pop();
  return typeExt && typeExt.trim().length > 0 ? typeExt.trim().toLowerCase() : 'jpg';
};

const buildObjectPath = (userId: string, imageType: 'profile' | 'banner', extension: string) =>
  `${userId}/${imageType}_${uniqueSuffix()}.${extension}`;

const buildFeedbackObjectPath = (userId: string, extension: string) =>
  `${userId}/feedback_${uniqueSuffix()}.${extension}`;

const normalizeStoragePath = (path: string): string => {
  const token = `${PROFILE_IMAGES_BUCKET}/`;
  return path.includes(token) ? path.split(token)[1] : path;
};

const normalizeFeedbackStoragePath = (path: string): string => {
  const token = `${FEEDBACK_BUCKET}/`;
  return path.includes(token) ? path.split(token)[1] : path;
};

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload an image to Supabase storage
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  imageType: 'profile' | 'banner'
): Promise<UploadResult> {
  try {
    const extension = sanitizeExtension(file);
    const objectPath = buildObjectPath(userId, imageType, extension);

    const { data, error } = await supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error || !data) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Failed to upload image. Please try again.',
      };
    }

    const { data: urlData } = supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload.',
    };
  }
}

/**
 * Delete an image from Supabase storage
 */
export async function deleteProfileImage(imagePath: string): Promise<boolean> {
  try {
    const normalizedPath = normalizeStoragePath(imagePath);

    if (!normalizedPath) {
      return true;
    }

    const { error } = await supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .remove([normalizedPath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return false;
  }
}

/**
 * Get public URL for an image in storage
 */
export function getStorageImageUrl(path: string): string {
  const normalizedPath = normalizeStoragePath(path);
  const { data } = supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .getPublicUrl(normalizedPath);
  
  return data.publicUrl;
}

/**
 * Replace an existing image with a new one
 */
export async function replaceProfileImage(
  file: File,
  userId: string,
  imageType: 'profile' | 'banner',
  oldImagePath?: string
): Promise<UploadResult> {
  try {
    const uploadResult = await uploadProfileImage(file, userId, imageType);
    
    if (!uploadResult.success) {
      return uploadResult;
    }

    if (oldImagePath && !oldImagePath.includes('dicebear.com')) {
      await deleteProfileImage(oldImagePath);
    }

    return uploadResult;
  } catch (error) {
    console.error('Replace image error:', error);
    return {
      success: false,
      error: 'Failed to replace image. Please try again.',
    };
  }
}

/**
 * Check if user has permission to modify image
 */
export async function checkImagePermission(userId: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    return user.id === userId;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Upload a feedback image to Supabase storage
 */
export async function uploadFeedbackImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    const extension = sanitizeExtension(file);
    const objectPath = buildFeedbackObjectPath(userId, extension);

    const { data, error } = await supabase.storage
      .from(FEEDBACK_BUCKET)
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error || !data) {
      console.error('Feedback upload error:', error);
      return {
        success: false,
        error: 'Failed to upload feedback image. Please try again.',
      };
    }

    const { data: urlData } = supabase.storage
      .from(FEEDBACK_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Unexpected feedback upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during feedback image upload.',
    };
  }
}

/**
 * Delete a feedback image from Supabase storage
 */
export async function deleteFeedbackImage(imagePath: string): Promise<boolean> {
  try {
    const normalizedPath = normalizeFeedbackStoragePath(imagePath);

    if (!normalizedPath) {
      return true;
    }

    const { error } = await supabase.storage
      .from(FEEDBACK_BUCKET)
      .remove([normalizedPath]);

    if (error) {
      console.error('Feedback delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected feedback delete error:', error);
    return false;
  }
}

/**
 * Get public URL for a feedback image in storage
 */
export function getFeedbackImageUrl(path: string): string {
  const normalizedPath = normalizeFeedbackStoragePath(path);
  const { data } = supabase.storage
    .from(FEEDBACK_BUCKET)
    .getPublicUrl(normalizedPath);
  
  return data.publicUrl;
}