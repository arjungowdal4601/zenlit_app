'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import SocialProfileCard from '@/components/SocialProfileCard';
import VisibilityControl from '@/components/VisibilityControl';

const RadarScreen = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['instagram', 'linkedin', 'twitter']);
  // Mock data for nearby users
  const nearbyUsers = [
    {
      id: '1',
      name: 'Alex Johnson',
      profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
      bio: 'Software engineer passionate about AI and machine learning. Love hiking and exploring new technologies. Always up for a good conversation about tech trends and innovation.',
      distance: '0.8 km',
      socialLinks: {
        instagram: 'alexj_dev',
        linkedin: 'alex-johnson-dev',
        twitter: 'alexjohnson_ai'
      }
    },
    {
      id: '2',
      name: 'Sarah Chen',
      profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffd5dc',
      bio: 'UX Designer creating beautiful and intuitive digital experiences. Coffee enthusiast and weekend photographer. Currently working on sustainable design practices.',
      distance: '1.2 km',
      socialLinks: {
        instagram: 'sarahchen_design',
        linkedin: 'sarah-chen-ux',
        twitter: 'sarahdesigns'
      }
    },
    {
      id: '3',
      name: 'Marcus Rodriguez',
      profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=c7d2fe',
      bio: 'Entrepreneur and startup founder. Building the next generation of fintech solutions. Mentor at local accelerator programs and angel investor.',
      distance: '1.5 km',
      socialLinks: {
        instagram: 'marcus_startup',
        linkedin: 'marcus-rodriguez-ceo',
        twitter: 'marcusfintech'
      }
    }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen px-4 sm:px-6 bg-black">
        {/* Header with Radar title, search, and dropdown */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl tracking-tight font-medium"
            style={{
              backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'var(--font-inter)'
            }}
          >
            Radar
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <svg 
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            

            
            {/* Animated Hamburger Menu */}
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center space-y-1"
            >
              <div 
                className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  dropdownOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              ></div>
              <div 
                className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  dropdownOpen ? 'opacity-0' : ''
                }`}
              ></div>
              <div 
                className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  dropdownOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              ></div>
            </div>
          </div>
        </div>
        

        
        {/* Search Dropdown */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          searchOpen ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'
        }`}>
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
        <div className={`overflow-hidden transition-all duration-300 ease-in-out w-full max-w-2xl mx-auto ${
          dropdownOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
        }`}>
          <VisibilityControl 
            onVisibilityChange={(visible) => setIsVisible(visible)}
            onAccountsChange={(accounts) => setSelectedAccounts(accounts)}
          />
        </div>
        
        {/* Nearby Users List */}
        <div className="w-full max-w-2xl mx-auto mt-4">
          {isVisible && nearbyUsers.map((user) => (
            <SocialProfileCard 
              key={user.id} 
              user={user} 
              isVisible={isVisible}
              selectedAccounts={selectedAccounts.length === 0 ? [] : selectedAccounts}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default RadarScreen;