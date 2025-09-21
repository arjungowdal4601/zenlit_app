"use client";

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import SocialProfileCard from '@/components/SocialProfileCard';
import VisibilityControl from '@/components/VisibilityControl';
import { useVisibility } from '@/contexts/VisibilityContext';
import type { SocialLinks } from '@/constants/socialPlatforms';
import { NEARBY_USERS } from '@/constants/nearbyUsers';

interface NearbyUser {
  id: string;
  name: string;
  username: string;
  profilePhoto: string;
  bio: string;
  distance: string;
  socialLinks: SocialLinks;
}

const RadarScreen = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isVisible, selectedAccounts } = useVisibility();

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
          {isVisible && NEARBY_USERS.map((user) => (
            <SocialProfileCard
              key={user.id}
              user={user}
              selectedAccounts={selectedAccounts.length === 0 ? [] : selectedAccounts}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default RadarScreen;
