'use client';

import Image from 'next/image';
import { Instagram, Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

interface PostProps {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
    socialLinks?: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  content: string;
  image?: string;
  timestamp: string;
  selectedAccounts?: string[];
}

// Avatar color combinations inspired by the radar page
const avatarColors = [
  'bg-gradient-to-br from-orange-400 to-red-500',
  'bg-gradient-to-br from-blue-400 to-indigo-600', 
  'bg-gradient-to-br from-green-400 to-emerald-600',
  'bg-gradient-to-br from-purple-400 to-pink-600',
  'bg-gradient-to-br from-yellow-400 to-orange-500',
  'bg-gradient-to-br from-cyan-400 to-blue-600',
];

const Post = ({ author, content, image, timestamp, selectedAccounts = ['instagram', 'linkedin', 'twitter'] }: PostProps) => {
  // Generate consistent color based on author name
  const colorIndex = author.name.charCodeAt(0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  const handleSocialClick = (platform: string) => {
    console.log(`Navigate to ${platform}`);
  };

  return (
    <div className="mb-3 relative">
      {/* Social Links - Top Right */}
      {author.socialLinks && (
        <div className="absolute top-0 right-0 mt-2 flex items-center space-x-3">
          {selectedAccounts.includes('instagram') && author.socialLinks.instagram && (
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
          
          {selectedAccounts.includes('linkedin') && author.socialLinks.linkedin && (
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
          
          {selectedAccounts.includes('twitter') && author.socialLinks.twitter && (
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
      )}
      
      <div className="flex space-x-4">
        {/* Enhanced Avatar */}
        <div className="flex-shrink-0">
          <img 
            src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random&color=fff&size=40`}
            alt={author.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>
        
        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="mb-2">
            <h3 className="text-white font-semibold text-base">{author.name}</h3>
            <span className="text-gray-400 text-sm">@{author.username}</span>
          </div>
          
          {/* Post Text */}
          <p className="text-gray-100 text-base mb-4 leading-tight">
            {content}
          </p>
          
          {/* Post Image */}
          {image && (
            <div className="rounded-xl overflow-hidden border border-gray-700 shadow-md">
              <Image
                src={image}
                alt="Post image"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Post separator */}
      <div className={`${image ? 'mt-3 mb-2' : 'mt-2 mb-1'}`}>
        <div className="h-px bg-gray-600 w-full"></div>
      </div>
    </div>
  );
};

export default Post;