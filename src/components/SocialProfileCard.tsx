'use client';

import React, { useState } from 'react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaUser, FaComment } from 'react-icons/fa';

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
}

const SocialProfileCard: React.FC<SocialProfileCardProps> = ({ user }) => {
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
    <div className="bg-gray-900/80 rounded-xl p-4 mb-4 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg">
      {/* Top: Avatar + Text */}
      <div className="flex items-start space-x-4">
        {/* Profile Photo - Square with subtle ring */}
        <div className="flex-shrink-0">
          <img
            src={user.profilePhoto}
            alt={`${user.name}'s profile`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-1 ring-white/15"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="mb-1 max-w-[210px] sm:max-w-[280px]">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate" style={{ fontFamily: 'var(--font-inter)' }}>
              {user.name}
            </h3>
          </div>

          {/* Bio - Flexible width extending to card end */}
           <div className="flex-1 pr-2">
             <p
               className="text-gray-300 text-sm leading-tight overflow-hidden"
               style={{
                 fontFamily: 'var(--font-inter)',
                 display: '-webkit-box',
                 WebkitLineClamp: 2,
                 WebkitBoxOrient: 'vertical',
                 lineHeight: '1.35',
                 height: '2.7em'
               }}
             >
               {displayBio}
               {shouldTruncate && !showFullBio && (
                 <button
                   onClick={handleMoreClick}
                   className="text-blue-400 hover:text-blue-300 ml-1 font-medium align-baseline"
                 >
                   more
                 </button>
               )}
             </p>
           </div>
        </div>
      </div>

      {/* Bottom: Social media buttons left, action buttons right */}
       <div className="mt-3 flex items-center justify-between">
         {/* Social Media Buttons with original brand colors */}
         <div className="flex items-center space-x-3">
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
               <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'white' }} />
             </div>
           </button>

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
         </div>

         {/* Action Buttons in right corner */}
         <div className="flex items-center space-x-2">
           <button
             onClick={handleProfileClick}
             className="h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
             aria-label="View Profile"
           >
             <FaUser className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>

           <button
             onClick={handleMessageClick}
             className="h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
             aria-label="Send Message"
           >
             <FaComment className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>
         </div>
       </div>
    </div>
  );
};

export default SocialProfileCard;