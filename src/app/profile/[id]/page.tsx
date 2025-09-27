'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import AppHeader from '@/components/AppHeader';
import AppLayout from '@/components/AppLayout';
import SocialLinkButton from '@/components/SocialLinkButton';
import type { SocialLinks } from '@/constants/socialPlatforms';
import { supabase } from '@/utils/supabase';
import type { Tables } from '@/utils/supabase';

type ProfileWithLinks = Tables['profiles'] & {
  social_links: SocialLinks | null;
};

interface PostRow {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
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

const OtherUserProfilePage = () => {
  const params = useParams();
  const idParam = (params?.id ?? '') as string;

  const [profile, setProfile] = useState<ProfileWithLinks | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idParam) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [{ data: profileData, error: profileError }, { data: postData, error: postsError }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, username, bio, social_links, avatar_url, banner_url')
          .eq('id', idParam)
          .maybeSingle(),
        supabase
          .from('posts')
          .select('id, content, image_url, created_at')
          .eq('author_id', idParam)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (cancelled) return;

      if (profileError) {
        console.error('Unable to load profile', profileError);
        setError('Unable to load profile.');
        setProfile(null);
        setPosts([]);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setError('User not found.');
        setProfile(null);
        setPosts([]);
        setLoading(false);
        return;
      }

      setProfile({ ...profileData, social_links: (profileData.social_links as SocialLinks | null) ?? null });
      if (postsError) {
        console.error('Unable to load posts', postsError);
        setPosts([]);
      } else {
        setPosts(postData ?? []);
      }
      setError(null);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [idParam]);

  const socialLinks = useMemo<SocialLinks>(() => {
    return {
      instagram: profile?.social_links?.instagram ?? '',
      linkedin: profile?.social_links?.linkedin ?? '',
      twitter: profile?.social_links?.twitter ?? '',
    };
  }, [profile]);

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-black min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <AppHeader title="Profile" />
          </div>
          <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
            <div className="h-48 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile || error) {
    return (
      <AppLayout>
        <div className="bg-black min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <AppHeader
              title="Profile"
              left={
                <Link
                  href="/radar"
                  aria-label="Back to Radar"
                  className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="text-white" />
                </Link>
              }
            />
          </div>
          <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-300">
            {error ?? 'User not found.'}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-black">
        <div className="max-w-4xl mx-auto px-4">
          <AppHeader
            title="Profile"
            left={
              <Link
                href="/radar"
                aria-label="Back to Radar"
                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ArrowLeft className="text-white" />
              </Link>
            }
          />
        </div>

        <div className="w-full">
          <div className="relative">
            <div className="h-48 sm:h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="relative bg-black px-4 sm:px-6 pb-6">
              <div className="flex justify-between items-start pt-4">
                <div className="flex flex-col">
                  <div className="relative -mt-12 sm:-mt-16 mb-4">
                    <Image
                      src={
                        profile.avatar_url ??
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name ?? 'User')}&background=random&color=fff`
                      }
                      alt={`${profile.full_name ?? 'User'}'s profile`}
                      width={120}
                      height={120}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-black"
                      priority
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                      {profile.full_name ?? 'Anonymous'}
                    </h1>
                    {profile.username && (
                      <p className="text-gray-400 text-lg mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                        @{profile.username}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="max-w-xl text-sm text-gray-300" style={{ fontFamily: 'var(--font-inter)' }}>
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
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
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
          <h2 className="text-xl font-semibold text-white mb-4">Recent posts</h2>
          {posts.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-10 text-center text-sm text-gray-300">
              {"This user hasn't posted yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="rounded-xl border border-white/10 bg-black/60 p-4">
                  <div className="mb-2 text-xs text-gray-400">{formatRelativeTime(post.created_at)}</div>
                  <p className="text-sm text-gray-100 leading-relaxed">{post.content}</p>
                  {post.image_url && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
                      <Image src={post.image_url} alt="Post image" width={640} height={360} className="h-auto w-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default OtherUserProfilePage;
