import { supabase } from './supabaseClient';

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
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${imageType}_${Date.now()}.${fileExt}`;
    // Path must be relative to the bucket (do not prefix bucket name)
    const filePath = `${fileName}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Failed to upload image. Please try again.',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
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
    // Extract the path from the full URL if needed
    const path = imagePath.includes('profile-images/') 
      ? imagePath.split('profile-images/')[1] 
      : imagePath;

    const { error } = await supabase.storage
      .from('profile-images')
      // Remove expects object names relative to the bucket root
      .remove([path]);

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
  const { data } = supabase.storage
    .from('profile-images')
    .getPublicUrl(path);
  
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
    // Upload new image
    const uploadResult = await uploadProfileImage(file, userId, imageType);
    
    if (!uploadResult.success) {
      return uploadResult;
    }

    // Delete old image if it exists and is not the default
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