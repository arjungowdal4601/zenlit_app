'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const userStats = {
    posts: 24,
    connections: 156,
    radius: '2.5 km'
  };

  return (
    <AppLayout>
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 
            className="text-3xl md:text-4xl mb-2 tracking-tight font-medium"
            style={{
              backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'var(--font-inter)'
            }}
          >
            👤 Profile
          </h1>
        </div>
        
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">JD</span>
              </div>
              
              <h2 className="text-white text-xl font-semibold mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                John Doe
              </h2>
              <p className="text-gray-400 text-sm mb-2">@johndoe</p>
              <p className="text-gray-300 text-sm mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                Love exploring the city and meeting new people! 🌟
              </p>
              
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">{userStats.posts}</div>
              <div className="text-gray-400 text-xs" style={{ fontFamily: 'var(--font-inter)' }}>Posts</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-2xl font-bold text-purple-400 mb-1">{userStats.connections}</div>
              <div className="text-gray-400 text-xs" style={{ fontFamily: 'var(--font-inter)' }}>Connections</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-2xl font-bold text-green-400 mb-1">{userStats.radius}</div>
              <div className="text-gray-400 text-xs" style={{ fontFamily: 'var(--font-inter)' }}>Radius</div>
            </div>
          </div>
          
          {/* Settings */}
          <div className="space-y-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <button className="w-full p-4 text-left hover:bg-slate-700 transition-colors rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔔</span>
                    <span className="text-white" style={{ fontFamily: 'var(--font-inter)' }}>Notifications</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </button>
            </div>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <button className="w-full p-4 text-left hover:bg-slate-700 transition-colors rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔒</span>
                    <span className="text-white" style={{ fontFamily: 'var(--font-inter)' }}>Privacy & Safety</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </button>
            </div>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <button className="w-full p-4 text-left hover:bg-slate-700 transition-colors rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📍</span>
                    <span className="text-white" style={{ fontFamily: 'var(--font-inter)' }}>Location Settings</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </button>
            </div>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <button className="w-full p-4 text-left hover:bg-slate-700 transition-colors rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">❓</span>
                    <span className="text-white" style={{ fontFamily: 'var(--font-inter)' }}>Help & Support</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </button>
            </div>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <button className="w-full p-4 text-left hover:bg-slate-700 transition-colors rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚙️</span>
                    <span className="text-white" style={{ fontFamily: 'var(--font-inter)' }}>Settings</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Sign Out */}
          <div className="mt-6">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileScreen;