'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageSquare, User, MessageCircle, Instagram, Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

interface SocialProfileCardProps {
  user: {
    id: string;
    name: string;
    profilePhoto: string;
    bio: string;
    distance: string;
    socialLinks?: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  isVisible?: boolean;
  selectedAccounts?: string[];
}

const SocialProfileCard: React.FC<SocialProfileCardProps> = React.memo(({ user, isVisible = true, selectedAccounts = [] }) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const maxBioLength = 120;
  const shouldTruncate = user.bio.length > maxBioLength;
  const displayBio = shouldTruncate && !showFullBio 
    ? user.bio.substring(0, maxBioLength) + '...' 
    : user.bio;

  const handleSocialClick = (platform: string) => {
    // Placeholder for social media navigation
    console.log(`Navigate to ${platform}`);
  };

  const handleProfileClick = () => {
    // Placeholder for profile view navigation
    console.log('Navigate to profile view');
  };

  const handleMessageClick = () => {
    // Placeholder for message navigation
    console.log('Navigate to chat window');
  };

  const handleMoreClick = () => {
    handleProfileClick();
  };

  return (
    <div className="bg-black rounded-xl p-3 mb-4 transition-all duration-300" style={{boxShadow: '4px 4px 8px rgba(255, 255, 255, 0.2), -2px -2px 4px rgba(255, 255, 255, 0.1)'}}>
      {/* Top: Avatar + Text */}
      <div className="flex items-start space-x-4">
        {/* Profile Photo - Square with subtle ring */}
        <div className="flex-shrink-0">
          <Image
            src={user.profilePhoto}
            alt={`${user.name}'s profile`}
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-1 ring-white/15"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="mb-1 max-w-[210px] sm:max-w-[280px]">
            <h3 className="text-gray-200 font-medium text-sm sm:text-base truncate" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              {user.name}
            </h3>
          </div>

          {/* Bio - Flexible width extending to card end */}
           <div className="flex-1 pr-2">
             <p
               className="text-gray-400 text-xs leading-tight overflow-hidden font-bold"
               style={{
                 fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                 display: '-webkit-box',
                 WebkitLineClamp: 2,
                 WebkitBoxOrient: 'vertical',
                 lineHeight: '1.35',
                 height: '2.7em'
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
             <button
               onClick={() => handleSocialClick('instagram')}
               className="p-0 hover:scale-110 transition-transform"
               aria-label="Instagram"
             >
               <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" style={{
                 background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}>
                 <Instagram className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'white' }} />
               </div>
             </button>
           )}

           {selectedAccounts.includes('linkedin') && user.socialLinks?.linkedin && (
             <button
               onClick={() => handleSocialClick('linkedin')}
               className="p-0 hover:scale-110 transition-transform"
               aria-label="LinkedIn"
             >
               <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm" style={{
                 background: '#0077B5',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 position: 'relative'
               }}>
                 <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                   <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3z" fill="#0077B5"/>
                   <path d="M135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" fill="white"/>
                 </svg>
               </div>
             </button>
           )}

           {selectedAccounts.includes('twitter') && user.socialLinks?.twitter && (
             <button
               onClick={() => handleSocialClick('twitter')}
               className="p-0 hover:scale-110 transition-transform"
               aria-label="X (Twitter)"
             >
               <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm" style={{
                 background: '#000000',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}>
                 <FaXTwitter className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'white' }} />
               </div>
             </button>
           )}
         </div>

         {/* Action Buttons in right corner */}
         <div className="flex items-center space-x-2">
           <button
             onClick={handleProfileClick}
             className="h-10 w-10 sm:h-12 sm:w-12 grid place-items-center rounded-md text-white hover:text-gray-300 transition-colors"
             aria-label="View Profile"
           >
             <User className="w-5 h-5 sm:w-6 sm:h-6" />
           </button>

           <button
             onClick={handleMessageClick}
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