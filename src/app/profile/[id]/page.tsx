'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import SocialLinkButton from '@/components/SocialLinkButton';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { NEARBY_USERS, type NearbyUser } from '@/constants/nearbyUsers';

interface Post {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

const OtherUserProfilePage = () => {
  const params = useParams();
  const idParam = (params?.id ?? '') as string;

  // Look up the user from the Radar list data
  const user: NearbyUser | undefined = useMemo(
    () => NEARBY_USERS.find((u) => u.id === idParam),
    [idParam]
  );

  const [posts] = useState<Post[]>([
    {
      id: '1',
      content:
        'Just finished working on an amazing new project! Excited to share more details soon. The journey of building something from scratch is always rewarding.',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
    },
    {
      id: '2',
      content:
        'Beautiful sunset today! Sometimes you need to step away from the screen and appreciate the simple things in life. Nature has a way of inspiring creativity.',
      timestamp: '1 day ago',
      likes: 45,
      comments: 12,
    },
    {
      id: '3',
      content:
        "Learning new technologies every day. The tech world moves fast, but that's what makes it exciting. Always stay curious and keep growing!",
      timestamp: '3 days ago',
      likes: 67,
      comments: 23,
    },
  ]);

  // If user is not found, show a simple not found message with back to Radar
  if (!user) {
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
          <div className="max-w-2xl mx-auto px-4 py-12">
            <p className="text-gray-300">User not found.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-black">
        {/* Header WITHOUT hamburger/menu on the right */}
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

        {/* LinkedIn-style Banner */}
        <div className="w-full">
          <div className="relative">
            {/* Banner Background - Full width, no rounded corners */}
            <div
              className="h-48 sm:h-64"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            ></div>

            {/* Profile Section */}
            <div className="relative bg-black px-4 sm:px-6 pb-6">
              {/* Profile Photo and Layout */}
              <div className="flex justify-between items-start pt-4">
                {/* Left Side: Profile Photo and User Info */}
                <div className="flex flex-col">
                  {/* Profile Photo - square with rounded corners */}
                  <div className="relative -mt-12 sm:-mt-16 mb-4">
                    <Image
                      src={user.profilePhoto}
                      alt={`${user.name}'s profile`}
                      width={120}
                      height={120}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-black"
                      priority
                    />
                  </div>

                  {/* User Info - Display name and username below profile pic */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                      {user.name}
                    </h1>
                    {user.username && (
                      <p className="text-gray-400 text-lg mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Social Links */}
                <div className="flex items-center space-x-3 pt-2">
                  {user.socialLinks?.instagram && (
                    <SocialLinkButton
                      platform="instagram"
                      onClick={() => console.log('Instagram clicked')}
                      buttonClassName="hover:scale-110"
                      containerClassName="w-8 h-8"
                      iconClassName="w-5 h-5"
                      ariaLabel="Instagram"
                    />
                  )}

                  {user.socialLinks?.linkedin && (
                    <SocialLinkButton
                      platform="linkedin"
                      onClick={() => console.log('LinkedIn clicked')}
                      buttonClassName="hover:scale-110"
                      containerClassName="w-8 h-8"
                      iconClassName="w-5 h-5"
                      ariaLabel="LinkedIn"
                    />
                  )}

                  {user.socialLinks?.twitter && (
                    <SocialLinkButton
                      platform="twitter"
                      onClick={() => console.log('Twitter clicked')}
                      buttonClassName="hover:scale-110"
                      containerClassName="w-8 h-8"
                      iconClassName="w-4 h-4"
                      containerStyle={{ border: '1px solid #333' }}
                      ariaLabel="X (Twitter)"
                    />
                  )}
                </div>
              </div>

              {/* Bio - Full width below the profile section */}
              <div className="mt-4">
                <p className="text-white text-base leading-relaxed max-w-2xl" style={{ fontFamily: 'var(--font-inter)' }}>
                  {user.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="mt-8 max-w-2xl mx-auto px-4">
            <div className="border-t border-gray-700"></div>
          </div>

          {/* Posts Section (READ-ONLY: no 3-dots menu, no delete) */}
          <div className="mt-6 space-y-3 max-w-2xl mx-auto px-4">
            <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
              Posts
            </h2>

            {posts.map((post) => (
              <div key={post.id} className="mb-3 relative">
                <div className="flex space-x-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <Image
                      src={user.profilePhoto}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author Info - No timestamp */}
                    <div className="mb-2">
                      <h3 className="text-white font-semibold text-base">{user.name}</h3>
                      {user.username && <span className="text-gray-400 text-sm">@{user.username}</span>}
                    </div>

                    {/* Post Text */}
                    <p className="text-gray-100 text-base mb-4 leading-tight">{post.content}</p>
                  </div>
                </div>

                {/* Post separator */}
                <div className="mt-2 mb-1">
                  <div className="h-px bg-gray-600 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OtherUserProfilePage;