'use client';

import { useEffect, useState } from 'react';

import AppHeader from '@/components/AppHeader';
import AppLayout from '@/components/AppLayout';
import Post from '@/components/Post';
import { useVisibility } from '@/contexts/VisibilityContext';
import { supabase } from '@/utils/supabase';
import type { SocialLinks } from '@/constants/socialPlatforms';

interface FeedPost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    social_links: SocialLinks | null;
  } | null;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (date.getTime() - now.getTime()) / 1000;
  const absDiff = Math.abs(diff);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, seconds] of units) {
    if (absDiff >= seconds || unit === 'minute') {
      const value = Math.round(diff / seconds);
      return formatter.format(value, unit);
    }
  }

  return 'just now';
};

const FeedScreen = () => {
  const { selectedAccounts } = useVisibility();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(
          `id, content, image_url, created_at, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url, social_links)`
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (cancelled) return;

      if (fetchError) {
        console.error('Unable to load feed posts', fetchError);
        setError('Unable to load the feed. Please try again later.');
        setPosts([]);
      } else {
        setPosts(
          (data ?? []).map((post) => ({
            ...post,
            author: post.author
              ? {
                  ...post.author,
                  social_links: (post.author.social_links as SocialLinks | null) ?? null,
                }
              : null,
          }))
        );
        setError(null);
      }
      setLoading(false);
    };

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4">
          <AppHeader title="Feed" />

          <div className="pb-8">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-40 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
                {error}
              </div>
            ) : posts.length === 0 ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/40 px-4 py-10 text-center text-sm text-gray-300">
                No posts yet. Check back soon.
              </div>
            ) : (
              posts.map((post) => (
                <Post
                  key={post.id}
                  id={post.id}
                  author={{
                    name: post.author?.full_name ?? 'Anonymous',
                    username: post.author?.username ?? 'user',
                    avatar: post.author?.avatar_url ?? undefined,
                    socialLinks: post.author?.social_links ?? undefined,
                  }}
                  content={post.content}
                  image={post.image_url ?? undefined}
                  timestamp={formatRelativeTime(post.created_at)}
                  selectedAccounts={selectedAccounts}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedScreen;
