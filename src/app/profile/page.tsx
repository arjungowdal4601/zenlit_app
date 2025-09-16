'use client';

import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';

const ProfileScreen = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4">
          <AppHeader title="Profile" />
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Coming Soon</h2>
              <p className="text-gray-400 text-lg">Profile feature is under development</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileScreen;
