'use client';

import { useEffect, useMemo, useState } from 'react';

import AppHeader from '@/components/AppHeader';
import AppLayout from '@/components/AppLayout';
import SocialProfileCard from '@/components/SocialProfileCard';
import VisibilityControl from '@/components/VisibilityControl';
import type { SocialLinks } from '@/constants/socialPlatforms';
import { useVisibility } from '@/contexts/VisibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import type { Tables } from '@/utils/supabase';

interface RadarProfile {
  id: string;
  name: string;
  username?: string | null;
  profilePhoto: string;
  bio: string;
  socialLinks?: SocialLinks | null;
}

const mapProfile = (profile: Tables['profiles']): RadarProfile => ({
  id: profile.id,
  name: profile.full_name ?? 'Anonymous',
  username: profile.username ?? undefined,
  profilePhoto:
    profile.avatar_url ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name ?? 'User')}&background=random&color=fff`,
  bio: profile.bio ?? '',
  socialLinks: (profile.social_links as SocialLinks | null) ?? null,
});

const RadarScreen = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profiles, setProfiles] = useState<RadarProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const { isVisible, selectedAccounts } = useVisibility();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, social_links')
        .neq('id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (cancelled) return;

      if (fetchError) {
        console.error('Failed to load profiles', fetchError);
        setError('Unable to load nearby users. Please try again later.');
        setProfiles([]);
      } else {
        setProfiles((data ?? []).map(mapProfile));
        setError(null);
      }
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const filteredProfiles = useMemo(() => {
    if (!query.trim()) {
      return profiles;
    }

    const needle = query.toLowerCase();
    return profiles.filter((profile) => {
      const username = profile.username ?? '';
      return profile.name.toLowerCase().includes(needle) || username.toLowerCase().includes(needle);
    });
  }, [profiles, query]);

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen px-4 sm:px-6 bg-black">
        <div className="w-full max-w-2xl mx-auto">
          <AppHeader
            title="Radar"
            right={(
              <div className="flex items-center space-x-4">
                <svg
                  onClick={() => setSearchOpen((prev) => !prev)}
                  className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center space-y-1"
                >
                  <div
                    className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${dropdownOpen ? 'rotate-45 translate-y-1.5' : ''}`}
                  />
                  <div
                    className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${dropdownOpen ? 'opacity-0' : ''}`}
                  />
                  <div
                    className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${dropdownOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
                  />
                </div>
              </div>
            )}
          />
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out w-full max-w-2xl mx-auto ${
            searchOpen ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border border-gray-300 rounded-lg p-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out w-full max-w-2xl mx-auto ${
            dropdownOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <VisibilityControl />
        </div>

        <div className="w-full max-w-2xl mx-auto pb-16">
          {!isVisible ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-black/40 px-4 py-10 text-center text-sm text-gray-300">
              Enable visibility to show your social links on the radar.
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
              {error}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-10 text-center text-sm text-gray-300">
              No profiles found. Try adjusting your search.
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <SocialProfileCard
                key={profile.id}
                user={{
                  id: profile.id,
                  name: profile.name,
                  username: profile.username ?? undefined,
                  profilePhoto: profile.profilePhoto,
                  bio: profile.bio,
                  distance: '',
                  socialLinks: profile.socialLinks ?? undefined,
                }}
                selectedAccounts={selectedAccounts.length === 0 ? [] : selectedAccounts}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default RadarScreen;
