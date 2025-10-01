import { supabase } from './supabaseClient';
import { getNearbyUsers } from './locationService';

export interface FeedPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
    socialLinks?: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  content: string;
  image?: string;
  timestamp: string;
}

/**
 * Calculate relative timestamp from created_at date
 */
const getRelativeTime = (createdAt: string): string => {
  const now = new Date();
  const postDate = new Date(createdAt);
  const diffInMs = now.getTime() - postDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else {
    return `${diffInDays}d`;
  }
};

/**
 * Fetch posts from nearby users based on current user's location
 */
export const getNearbyUsersPosts = async (
  currentUserId: string,
  userLatShort: number,
  userLongShort: number,
  range: number = 0.02
): Promise<FeedPost[]> => {
  try {
    // First, get nearby users
    const nearbyUsers = await getNearbyUsers(currentUserId, userLatShort, userLongShort, range);
    
    if (!nearbyUsers || nearbyUsers.length === 0) {
      console.log('No nearby users found for feed');
      return [];
    }

    // Extract user IDs from nearby users
    const nearbyUserIds = nearbyUsers.map(user => user.id);
    console.log('Fetching posts for nearby user IDs:', nearbyUserIds);

    // Fetch posts from these nearby users
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        text,
        image_url,
        created_at
      `)
      .in('user_id', nearbyUserIds)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to recent 50 posts

    if (postsError) {
      console.error('Error fetching nearby users posts:', postsError);
      throw postsError;
    }

    if (!posts || posts.length === 0) {
      console.log('No posts found from nearby users');
      return [];
    }

    // Create a map of user data for quick lookup
    const userDataMap = new Map();
    nearbyUsers.forEach(user => {
      userDataMap.set(user.id, {
        name: user.profiles.display_name || user.profiles.user_name || 'Unknown User',
        username: user.profiles.user_name || 'unknown',
        // Use backend profile picture if available; otherwise allow component fallback
        avatar: user.profiles.social_links?.profile_pic_url || undefined,
        socialLinks: {
          instagram: user.profiles.social_links?.instagram,
          linkedin: user.profiles.social_links?.linkedin,
          twitter: user.profiles.social_links?.x_twitter,
        }
      });
    });

    // Transform posts to match the expected FeedPost interface
    const feedPosts: FeedPost[] = posts.map(post => {
      const userData = userDataMap.get(post.user_id) || {
        name: 'Unknown User',
        username: 'unknown',
        avatar: undefined,
        socialLinks: {}
      };

      return {
        id: post.id,
        author: {
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar,
          socialLinks: userData.socialLinks,
        },
        content: post.text || '',
        image: post.image_url || undefined,
        timestamp: getRelativeTime(post.created_at),
      };
    });

    console.log(`Successfully fetched ${feedPosts.length} posts from nearby users`);
    return feedPosts;

  } catch (error) {
    console.error('Failed to get nearby users posts:', error);
    throw error;
  }
};