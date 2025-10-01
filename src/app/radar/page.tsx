"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import SocialProfileCard from '@/components/SocialProfileCard';
import VisibilityControl from '@/components/VisibilityControl';
import { useVisibility } from '@/contexts/VisibilityContext';
import { getNearbyUsers } from '@/utils/locationService';
import { supabase } from '@/utils/supabaseClient';

const RadarScreen = () => {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isVisible, selectedAccounts, locationData, locationError, isLoadingLocation } = useVisibility();
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch nearby users when location data is available
  useEffect(() => {
    const fetchNearbyUsers = async () => {
      console.log('fetchNearbyUsers called with:', { isVisible, locationData, currentUserId });
      
      if (!isVisible || !locationData || !currentUserId) {
        console.log('Conditions not met, clearing nearby users');
        setNearbyUsers([]);
        return;
      }

      console.log('Fetching nearby users with coordinates:', locationData.lat_short, locationData.long_short);
      setLoadingUsers(true);
      try {
        const users = await getNearbyUsers(
          currentUserId,
          locationData.lat_short,
          locationData.long_short
        );
        console.log('Fetched nearby users:', users);
        setNearbyUsers(users);
      } catch (error) {
        console.error('Failed to fetch nearby users:', error);
        setNearbyUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchNearbyUsers();
  }, [isVisible, locationData, currentUserId]);

  const handleMessageIconClick = () => {
    router.push('/messages');
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen px-4 sm:px-6 bg-black">
        <div className="w-full max-w-2xl mx-auto">
          <AppHeader
            title="Radar"
            right={(
              <div className="flex items-center space-x-4">
                {/* Search Icon */}
                <svg
                  onClick={() => setSearchOpen((prev) => !prev)}
                  className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {/* Animated Hamburger Menu */}
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

        {/* Search Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out w-full max-w-2xl mx-auto ${
            searchOpen ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border border-gray-300 rounded-lg p-3">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400"
              style={{ fontFamily: 'var(--font-inter)' }}
            />
          </div>
        </div>

        {/* Visibility Control Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out w-full max-w-2xl mx-auto ${
            dropdownOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <VisibilityControl />
        </div>

        {/* Nearby Users List */}
        <div className="w-full max-w-2xl mx-auto">
          {/* Location Error Message */}
          {locationError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{locationError}</p>
            </div>
          )}

          {/* Loading States */}
          {isLoadingLocation && (
            <div className="flex items-center justify-center py-8">
              <div className="text-white text-sm">Requesting location access...</div>
            </div>
          )}

          {loadingUsers && isVisible && locationData && (
            <div className="flex items-center justify-center py-8">
              <div className="text-white text-sm">Finding nearby users...</div>
            </div>
          )}

          {/* Nearby Users */}
          {isVisible && locationData && !loadingUsers && (
            <>
              {nearbyUsers.length > 0 ? (
                nearbyUsers.map((user) => (
                  <SocialProfileCard
                     key={user.id}
                     user={{
                       id: user.profiles.id,
                       name: user.profiles.display_name,
                       username: user.profiles.user_name,
                       profilePhoto: user.profiles.social_links?.profile_pic_url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                       bio: user.profiles.social_links?.bio || '',
                       distance: 'Nearby', // You can calculate actual distance if needed
                       socialLinks: {
                         instagram: user.profiles.social_links?.instagram,
                         twitter: user.profiles.social_links?.x_twitter,
                         linkedin: user.profiles.social_links?.linkedin,
                       }
                     }}
                     selectedAccounts={selectedAccounts.length === 0 ? [] : selectedAccounts}
                   />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No users found nearby</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Try again later or check if other users have enabled their visibility
                  </p>
                </div>
              )}
            </>
          )}

          {/* Visibility Off Message */}
          {!isVisible && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Turn on visibility to see nearby users</p>
            </div>
          )}
        </div>
      </div>


    </AppLayout>
  );
};

export default RadarScreen;

