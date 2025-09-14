'use client';

import AppLayout from '@/components/AppLayout';

const FeedScreen = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-light text-white mb-4">
            Coming Soon
          </h1>
          <p className="text-gray-400 text-lg">
            Feed feature is under development
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedScreen;