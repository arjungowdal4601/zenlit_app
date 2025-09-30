"use client";

import Image from 'next/image';
import { type SocialLinks } from '@/constants/socialPlatforms';

interface PostWithoutSocialLinksProps {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
    socialLinks?: SocialLinks;
  };
  content: string;
  image?: string;
  timestamp: string;
}

const PostWithoutSocialLinks = ({ author, content, image, timestamp }: PostWithoutSocialLinksProps) => {
  return (
    <div className="mb-3 relative">
      <div className="flex space-x-4">
        {/* Enhanced Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={
              author.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random&color=fff&size=40`
            }
            alt={author.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="mb-2">
            <h3 className="text-white font-semibold text-base">{author.name}</h3>
            <span className="text-gray-400 text-sm">@{author.username} &bull; {timestamp}</span>
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
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostWithoutSocialLinks;