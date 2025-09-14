'use client';

import AppLayout from '@/components/AppLayout';
import SocialProfileCard from '@/components/SocialProfileCard';

const RadarScreen = () => {
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
      <div className="flex flex-col items-center min-h-screen px-4 sm:px-6 bg-black">
        <div className="text-center mb-6 sm:mb-8 pt-6">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl mb-4 tracking-tight font-medium"
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
        </div>
        
        {/* Nearby Users List */}
        <div className="w-full max-w-2xl">
          {nearbyUsers.map((user) => (
            <SocialProfileCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default RadarScreen;