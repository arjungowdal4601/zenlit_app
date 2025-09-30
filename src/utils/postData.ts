import { supabase } from './supabaseClient';
import { uploadPostImage } from './supabaseStorage';

export interface CreatePostData {
  text: string;
  image?: File;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Create a new post in the database
 */
export async function createPost(postData: CreatePostData): Promise<PostResult> {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'User not authenticated. Please log in and try again.',
      };
    }

    let imageUrl: string | null = null;

    // Upload image if provided
    if (postData.image) {
      const uploadResult = await uploadPostImage(postData.image, user.id);
      
      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload image.',
        };
      }
      
      imageUrl = uploadResult.url || null;
    }

    // Insert post into database
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        text: postData.text,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return {
        success: false,
        error: 'Failed to save post. Please try again.',
      };
    }

    return {
      success: true,
      postId: data.id,
    };
  } catch (error) {
    console.error('Unexpected error creating post:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Fetch posts for the current user
 */
export async function fetchUserPosts(userId: string) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        text,
        image_url,
        created_at,
        profiles (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching posts:', error);
    return [];
  }
}

/**
 * Fetch all posts for the feed
 */
export async function fetchAllPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        text,
        image_url,
        created_at,
        profiles (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to recent 50 posts

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching posts:', error);
    return [];
  }
}