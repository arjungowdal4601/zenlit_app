'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Edit, LogOut } from 'lucide-react';

import AppHeader from '@/components/AppHeader';
import AppLayout from '@/components/AppLayout';
import Post from '@/components/Post';
import SocialLinkButton from '@/components/SocialLinkButton';
import { useAuth } from '@/contexts/AuthContext';
import { useVisibility } from '@/contexts/VisibilityContext';
import { supabase } from '@/utils/supabase';
import type { SocialLinks } from '@/constants/socialPlatforms';
import type { Tables } from '@/utils/supabase';

interface FeedPost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

type ProfileRow = Tables['profiles'];

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

const ProfileScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { selectedAccounts } = useVisibility();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      setProfile(null);
      setPosts([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [{ data: profileData, error: profileError }, { data: postsData, error: postsError }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, username, bio, social_links, avatar_url, banner_url')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('posts')
          .select('id, content, image_url, created_at')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (cancelled) return;

      if (profileError) {
        console.error('Unable to load profile', profileError);
        setError('Unable to load your profile.');
        setProfile(null);
      } else {
        setProfile(profileData ?? null);
        setError(null);
      }

      if (postsError) {
        console.error('Unable to load posts', postsError);
        setPosts([]);
      } else {
        setPosts(postsData ?? []);
      }

      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const socialLinks = useMemo<SocialLinks>(() => {
    const raw = (profile?.social_links as SocialLinks | null) ?? null;
    return {
      instagram: raw?.instagram ?? '',
      linkedin: raw?.linkedin ?? '',
      twitter: raw?.twitter ?? '',
    };
  }, [profile]);

  const handleEdit = () => {
    router.push('/edit-profile');
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setSigningOut(false);
    }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="bg-black min-h-screen" />
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="bg-black min-h-screen flex items-center justify-center text-gray-300">
          Please sign in to view your profile.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-black min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <AppHeader title="Profile" />
        </div>

        <div className="w-full">
          <div className="relative">
            <div className="h-48 sm:h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="relative bg-black px-4 sm:px-6 pb-6">
              <div className="flex flex-col gap-6 pt-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative -mt-12 sm:-mt-16">
                    <Image
                      src={
                        profile?.avatar_url ??
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name ?? 'User')}&background=random&color=fff`
                      }
                      alt="Your avatar"
                      width={128}
                      height={128}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-black"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                      {profile?.full_name ?? 'Anonymous'}
                    </h1>
                    {profile?.username && (
                      <p className="text-gray-400 text-lg" style={{ fontFamily: 'var(--font-inter)' }}>
                        @{profile.username}
                      </p>
                    )}
                    {profile?.bio && (
                      <p className="mt-2 max-w-xl text-sm text-gray-300" style={{ fontFamily: 'var(--font-inter)' }}>
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    <Edit size={16} /> Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    disabled={signingOut}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    <LogOut size={16} /> {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 sm:px-0">
                {socialLinks.instagram && (
                  <SocialLinkButton
                    platform="instagram"
                    onClick={() => window.open(`https://instagram.com/${socialLinks.instagram}`, '_blank')}
                    buttonClassName="hover:scale-110"
                    containerClassName="w-8 h-8"
                    iconClassName="w-5 h-5"
                    ariaLabel="Instagram"
                  />
                )}
                {socialLinks.linkedin && (
                  <SocialLinkButton
                    platform="linkedin"
                    onClick={() => window.open(`https://linkedin.com/in/${socialLinks.linkedin}`, '_blank')}
                    buttonClassName="hover:scale-110"
                    containerClassName="w-8 h-8"
                    iconClassName="w-5 h-5"
                    ariaLabel="LinkedIn"
                  />
                )}
                {socialLinks.twitter && (
                  <SocialLinkButton
                    platform="twitter"
                    onClick={() => window.open(`https://twitter.com/${socialLinks.twitter}`, '_blank')}
                    buttonClassName="hover:scale-110"
                    containerClassName="w-8 h-8"
                    iconClassName="w-5 h-5"
                    ariaLabel="X (Twitter)"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-40 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-10 text-center text-sm text-gray-300">
              You haven&apos;t posted yet.
            </div>
          ) : (
            posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                author={{
                  name: profile?.full_name ?? 'Anonymous',
                  username: profile?.username ?? 'user',
                  avatar: profile?.avatar_url ?? undefined,
                  socialLinks: socialLinks,
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
    </AppLayout>
  );
};

export default ProfileScreen;
