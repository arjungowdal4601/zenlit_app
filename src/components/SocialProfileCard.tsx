"use client";

import React from 'react';
import Image from 'next/image';
import { MessageSquare, User } from 'lucide-react';
import SocialLinkButton from '@/components/SocialLinkButton';
import { DEFAULT_VISIBLE_PLATFORMS, type SocialLinks, type SocialPlatformId } from '@/constants/socialPlatforms';
import { useRouter } from 'next/navigation';

interface SocialProfileCardProps {
  user: {
    id: string;
    name: string;
    username?: string;
    profilePhoto: string;
    bio: string;
    distance: string;
    socialLinks?: SocialLinks;
  };
  selectedAccounts?: SocialPlatformId[];
}

const SocialProfileCard: React.FC<SocialProfileCardProps> = React.memo(function SocialProfileCardComponent({
  user,
  selectedAccounts = DEFAULT_VISIBLE_PLATFORMS,
}) {
  const router = useRouter();
  const maxBioLength = 120;
  const shouldTruncate = user.bio.length > maxBioLength;
  const displayBio = shouldTruncate ? `${user.bio.substring(0, maxBioLength)}...` : user.bio;

  const logNavigationIntent = (platform: SocialPlatformId | 'profile' | 'message') => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`Navigate to ${platform}`);
    }
  };

  const goToProfile = () => {
    // Navigate to other user's profile page
    router.push(`/profile/${user.id}`);
  };

  return (
    <div className="bg-black rounded-xl p-3 mb-4 transition-all duration-300" style={{ boxShadow: '4px 4px 8px rgba(255, 255, 255, 0.2), -2px -2px 4px rgba(255, 255, 255, 0.1)' }}>
      {/* Top: Avatar + Text */}
      <div className="flex items-start space-x-4">
        {/* Profile Photo - Feed-style avatar */}
        <div className="flex-shrink-0 mt-2">
          <Image
            src={user.profilePhoto}
            alt={`${user.name}'s profile`}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover cursor-pointer"
            onClick={goToProfile}
            priority
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Name and Username */}
          <div className="mb-1 max-w-[210px] sm:max-w-[280px]">
            <h3
              className="text-white font-semibold text-base sm:text-lg truncate cursor-pointer"
              style={{ fontFamily: 'var(--font-inter)' }}
              onClick={goToProfile}
            >
              {user.name}
            </h3>
            {user.username && (
              <span className="text-gray-400 text-sm ml-1" style={{ fontFamily: 'var(--font-inter)' }}>@{user.username}</span>
            )}
          </div>

          {/* Bio - Flexible width extending to card end */}
          <div className="flex-1 pr-2">
            <p
              className="text-white text-sm leading-tight overflow-hidden"
              style={{
                fontFamily: 'var(--font-inter)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.35',
                height: '2.7em',
              }}
            >
              {displayBio}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: Social media buttons left, action buttons right */}
      <div className="mt-3 flex items-center justify-between">
        {/* Social Media Buttons with original brand colors */}
        <div className="flex items-center space-x-3">
          {selectedAccounts.includes('instagram') && user.socialLinks?.instagram && (
            <SocialLinkButton
              platform="instagram"
              onClick={() => logNavigationIntent('instagram')}
              buttonClassName="hover:scale-110"
              containerClassName="w-6 h-6 sm:w-7 sm:h-7"
              iconClassName="w-5 h-5 sm:w-6 sm:h-6"
              ariaLabel="Instagram"
            />
          )}

          {selectedAccounts.includes('linkedin') && user.socialLinks?.linkedin && (
            <SocialLinkButton
              platform="linkedin"
              onClick={() => logNavigationIntent('linkedin')}
              buttonClassName="hover:scale-110"
              containerClassName="w-6 h-6 sm:w-7 sm:h-7"
              iconClassName="w-5 h-5 sm:w-6 sm:h-6"
              ariaLabel="LinkedIn"
            />
          )}

          {selectedAccounts.includes('twitter') && user.socialLinks?.twitter && (
            <SocialLinkButton
              platform="twitter"
              onClick={() => logNavigationIntent('twitter')}
              buttonClassName="hover:scale-110"
              containerClassName="w-6 h-6 sm:w-7 sm:h-7"
              iconClassName="w-5 h-5 sm:w-6 sm:h-6"
              ariaLabel="X (Twitter)"
            />
          )}
        </div>

        {/* Action Buttons in right corner */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={goToProfile}
            className="h-10 w-10 sm:h-12 sm:w-12 grid place-items-center rounded-md text-white hover:text-gray-300 transition-colors"
            aria-label="View Profile"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={() => logNavigationIntent('message')}
            className="h-10 w-10 sm:h-12 sm:w-12 grid place-items-center rounded-md text-white hover:text-gray-300 transition-colors"
            aria-label="Send Message"
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default SocialProfileCard;
