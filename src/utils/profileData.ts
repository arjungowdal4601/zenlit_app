import { supabase } from './supabaseClient';

// Types for the data structures
export interface UserProfile {
  id: string;
  display_name: string;
  user_name: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  account_created_at: string;
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
  text: string | null;
  image_url: string | null;
  created_at: string;
}

export interface CompleteUserProfile {
  profile: UserProfile;
  socialLinks: SocialLinks | null;
  posts: UserPost[];
}

// Default profile picture URL
export const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=b6e3f4';

type SupabaseUser = NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>;
type SocialLinkColumn = 'bio' | 'instagram' | 'x_twitter' | 'linkedin' | 'profile_pic_url' | 'banner_url';

type SocialLinksPayload = Partial<Record<SocialLinkColumn, string | null>>;

const normalizeNullableString = (value?: string | null): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

async function getAuthenticatedUser(): Promise<SupabaseUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error('getAuthenticatedUser: unable to get user', error);
    return null;
  }

  return data.user;
}

async function ensureSocialLinksRow(userId: string): Promise<void> {
  const { error } = await supabase
    .from('social_links')
    .insert({ id: userId })
    .select('id')
    .maybeSingle();

  // 23505 = duplicate key value violates unique constraint
  if (error && error.code !== '23505') {
    console.error('ensureSocialLinksRow: unable to create social_links record', error);
  }
}

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
      if (profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        console.error('Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          userId
        });
      }
      return null;
    }

    if (!profile) {
      console.error('No profile found for user ID:', userId);
      return null;
    }

    const [socialLinksResult, postsResult] = await Promise.all([
      supabase
        .from('social_links')
        .select('*')
        .eq('id', userId)
        .single(),
      supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    const { data: socialLinks, error: socialError } = socialLinksResult;
    const { data: posts, error: postsError } = postsResult;

    // Note: socialError with code 'PGRST116' means no rows found, which is expected for brand new users
    if (socialError && socialError.code !== 'PGRST116') {
      console.error('Error fetching social links:', socialError);
    }

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
    const user = await getAuthenticatedUser();
    if (!user) {
      return null;
    }

    const existingProfile = await fetchUserProfile(user.id);
    if (existingProfile) {
      return existingProfile;
    }

    console.info('fetchCurrentUserProfile: provisioning profile for new user', user.id);

    const emailHandle = user.email?.split('@')[0];
    const fallbackHandle = emailHandle && emailHandle.length > 0 ? emailHandle : `user-${user.id.slice(0, 6)}`;

    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: fallbackHandle,
        user_name: fallbackHandle,
        email: user.email ?? null
      })
      .select('*')
      .single();

    // 23505 = duplicate key (profile was created by another concurrent request)
    if (createError && createError.code !== '23505') {
      console.error('Error creating profile:', createError);
      return null;
    }

    await ensureSocialLinksRow(user.id);

    return fetchUserProfile(user.id);
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
  const twitterHandle = normalizeNullableString(socialLinks?.twitter) ?? normalizeNullableString(socialLinks?.x_twitter);
  return {
    instagram: normalizeNullableString(socialLinks?.instagram),
    linkedin: normalizeNullableString(socialLinks?.linkedin),
    twitter: twitterHandle,
    bio: normalizeNullableString(socialLinks?.bio),
  };
}

/**
 * Update or insert the current user's social links record.
 * Matches table columns: bio, instagram, x_twitter, linkedin, profile_pic_url, banner_url.
 */
export async function updateSocialLinks(update: SocialLinksUpdateData): Promise<SocialLinks | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const payload: SocialLinksPayload = {
    bio: normalizeNullableString(update.bio),
    instagram: normalizeNullableString(update.instagram),
    x_twitter: normalizeNullableString(update.x_twitter),
    linkedin: normalizeNullableString(update.linkedin),
  };

  if (update.profile_pic_url !== undefined) {
    payload.profile_pic_url = normalizeNullableString(update.profile_pic_url);
  }

  if (update.banner_url !== undefined) {
    payload.banner_url = normalizeNullableString(update.banner_url);
  }

  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as SocialLinksPayload;

  // Allow callers to explicitly clear banner/profile pictures by omitting the key instead of forcing nulls
  if (sanitizedPayload.profile_pic_url === null) {
    delete sanitizedPayload.profile_pic_url;
  }

  if (sanitizedPayload.banner_url === null) {
    delete sanitizedPayload.banner_url;
  }

  const { data, error } = await supabase
    .from('social_links')
    .upsert({ id: user.id, ...sanitizedPayload }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.error('updateSocialLinks: upsert error', error);
    return null;
  }

  return data as SocialLinks;
}

/**
 * Update the current user's profile (e.g., display_name)
 */
export async function updateUserProfile(update: UserProfileUpdateData): Promise<UserProfile | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const payload: Partial<UserProfile> = {};
  if (typeof update.display_name === 'string') {
    const displayName = update.display_name.trim();
    if (displayName.length > 0) {
      payload.display_name = displayName;
    }
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
