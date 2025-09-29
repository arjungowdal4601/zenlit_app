import { supabase } from './supabaseClient';

// Types for the data structures
export interface UserProfile {
  id: string;
  display_name: string;
  user_name: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  id: string;
  profile_pic_url?: string;
  banner_url?: string;
  bio?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  x_twitter?: string;
}

export interface UserPost {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CompleteUserProfile {
  profile: UserProfile;
  socialLinks: SocialLinks | null;
  posts: UserPost[];
}

// Default profile picture URL
export const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=b6e3f4';

/**
 * Fetch complete user profile data including profile, social links, and posts
 */
export async function fetchUserProfile(userId: string): Promise<CompleteUserProfile | null> {
  try {
    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    // Fetch social links data
    const { data: socialLinks, error: socialError } = await supabase
      .from('social_links')
      .select('*')
      .eq('id', userId)
      .single();

    // Note: socialError with code 'PGRST116' means no rows found, which is okay
    if (socialError && socialError.code !== 'PGRST116') {
      console.error('Error fetching social links:', socialError);
    }

    // Fetch user posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
    }

    return {
      profile,
      socialLinks: socialLinks || null,
      posts: posts || []
    };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetch current authenticated user's profile data
 */
export async function fetchCurrentUserProfile(): Promise<CompleteUserProfile | null> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Error getting authenticated user:', authError);
      return null;
    }

    return await fetchUserProfile(user.id);
  } catch (error) {
    console.error('Unexpected error fetching current user profile:', error);
    return null;
  }
}

/**
 * Get display-ready profile picture URL with fallback to default
 */
export function getProfilePictureUrl(socialLinks: SocialLinks | null): string {
  return socialLinks?.profile_pic_url || DEFAULT_PROFILE_PICTURE;
}

/**
 * Get display-ready banner URL (returns null if no custom banner, to use default gradient)
 */
export function getBannerUrl(socialLinks: SocialLinks | null): string | null {
  return socialLinks?.banner_url || null;
}

/**
 * Get display-ready social media links with proper formatting
 */
export function getSocialMediaLinks(socialLinks: SocialLinks | null) {
  const twitterHandle = socialLinks?.twitter ?? socialLinks?.x_twitter ?? null;
  return {
    instagram: socialLinks?.instagram || null,
    linkedin: socialLinks?.linkedin || null,
    twitter: twitterHandle,
  };
}

/**
 * Format timestamp for display (e.g., "2 hours ago", "1 day ago")
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMs = now.getTime() - postTime.getTime();
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }
}