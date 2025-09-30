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

// Payload for updating the user's profile
export interface UserProfileUpdateData {
  display_name?: string;
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

// Payload for updating social links for the current user
export interface SocialLinksUpdateData {
  bio?: string | null;
  instagram?: string | null;
  x_twitter?: string | null;
  linkedin?: string | null;
  profile_pic_url?: string | null;
  banner_url?: string | null;
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
      console.error('Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        userId: userId
      });
      return null;
    }

    if (!profile) {
      console.error('No profile found for user ID:', userId);
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

    // Try to fetch the profile
    const profile = await fetchUserProfile(user.id);
    
    // If no profile exists, create one
    if (!profile) {
      console.log('No profile found for user, creating one...');
      
      // Create a basic profile record
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          user_name: user.email?.split('@')[0] || 'user',
          email: user.email
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }

      // Ensure a social_links record exists so DB defaults apply
      const { error: createSocialError } = await supabase
        .from('social_links')
        .insert({ id: user.id })
        .maybeSingle();
      if (createSocialError && createSocialError.code !== 'PGRST116') {
        console.error('Error creating social_links record:', createSocialError);
      }

      // Return the newly created profile with empty social links and posts
      return {
        profile: newProfile,
        // Fetch the social_links just created (with DB defaults)
        socialLinks: (await supabase
          .from('social_links')
          .select('*')
          .eq('id', user.id)
          .single()
        ).data || null,
        posts: []
      };
    }

    return profile;
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
    bio: socialLinks?.bio || null,
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

/**
 * Update or insert the current user's social links record.
 * Matches table columns: bio, instagram, x_twitter, linkedin, profile_pic_url, banner_url.
 */
export async function updateSocialLinks(update: SocialLinksUpdateData): Promise<SocialLinks | null> {
  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('updateSocialLinks: unable to get user', authError);
    return null;
  }

  // Normalize empty strings to nulls for DB consistency
  const toNull = (v?: string | null) => (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) ? null : v;

  const payload: Record<string, any> = {
    bio: toNull(update.bio ?? null),
    instagram: toNull(update.instagram ?? null),
    x_twitter: toNull(update.x_twitter ?? null),
    linkedin: toNull(update.linkedin ?? null),
    profile_pic_url: update.profile_pic_url ?? null,
    banner_url: update.banner_url ?? null,
  };

  // Omit image fields when null to let DB defaults apply on insert/update
  if (payload.profile_pic_url === null) delete payload.profile_pic_url;
  if (payload.banner_url === null) delete payload.banner_url;

  // Check for existing record keyed by user id
  const { data: existing, error: checkError } = await supabase
    .from('social_links')
    .select('id')
    .eq('id', user.id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('updateSocialLinks: error checking existing record', checkError);
    return null;
  }

  if (existing) {
    const { data, error } = await supabase
      .from('social_links')
      .update(payload)
      .eq('id', user.id)
      .select('*')
      .single();
    if (error) {
      console.error('updateSocialLinks: update error', error);
      return null;
    }
    return data as SocialLinks;
  } else {
    const { data, error } = await supabase
      .from('social_links')
      .insert({ id: user.id, ...payload })
      .select('*')
      .single();
    if (error) {
      console.error('updateSocialLinks: insert error', error);
      return null;
    }
    return data as SocialLinks;
  }
}

/**
 * Update the current user's profile (e.g., display_name)
 */
export async function updateUserProfile(update: UserProfileUpdateData): Promise<UserProfile | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('updateUserProfile: unable to get user', authError);
    return null;
  }

  const payload: Partial<UserProfile> = {};
  if (typeof update.display_name === 'string') {
    payload.display_name = update.display_name;
  }

  if (Object.keys(payload).length === 0) {
    return null; // nothing to update
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    console.error('updateUserProfile: update error', error);
    return null;
  }

  return data as UserProfile;
}