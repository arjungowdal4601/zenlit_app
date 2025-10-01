'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import Post from '@/components/Post';
import VisibilityControl from '@/components/VisibilityControl';
import { useVisibility } from '@/contexts/VisibilityContext';
import { getNearbyUsersPosts, type FeedPost } from '@/utils/feedData';

const FeedScreen = () => {
  const { selectedAccounts, isVisible, locationData, currentUserId } = useVisibility();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNearbyPosts = async () => {
      if (!isVisible || !locationData || !currentUserId) {
        console.log('Missing required data for fetching nearby posts:', {
          isVisible,
          hasLocationData: !!locationData,
          hasCurrentUserId: !!currentUserId
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const nearbyPosts = await getNearbyUsersPosts(
          currentUserId,
          locationData.lat_short,
          locationData.long_short
        );
        
        setPosts(nearbyPosts);
        console.log(`Loaded ${nearbyPosts.length} posts from nearby users`);
      } catch (err) {
        console.error('Error fetching nearby posts:', err);
        setError('Failed to load posts from nearby users');
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPosts();
  }, [isVisible, locationData, currentUserId]);

  if (loading) {
    return (
      <AppLayout>
        <AppHeader title="Feed" />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading posts from nearby users...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <AppHeader title="Feed" />
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </AppLayout>
    );
  }

  if (posts.length === 0) {
    return (
      <AppLayout>
        <AppHeader title="Feed" />
        <div className="flex flex-col justify-center items-center h-64 text-center px-4">
          <div className="text-gray-500 mb-2">No posts from nearby users</div>
          <div className="text-sm text-gray-400">
            Make sure you're visible on Radar and there are other users nearby
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4">
          <AppHeader title="Feed" />

          {/* Posts - card-based layout */}
          <div className="pb-8">
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                author={post.author}
                content={post.content}
                image={post.image}
                timestamp={post.timestamp}
                selectedAccounts={selectedAccounts}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedScreen;

