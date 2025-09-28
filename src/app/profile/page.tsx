'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import LogoutConfirmation from '@/components/LogoutConfirmation';
import SocialLinkButton from '@/components/SocialLinkButton';
import Image from 'next/image';
import { MoreHorizontal, Edit, MessageSquare, LogOut } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

const ProfileScreen = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Just finished working on an amazing new project! Excited to share more details soon. The journey of building something from scratch is always rewarding.',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8
    },
    {
      id: '2', 
      content: 'Beautiful sunset today! Sometimes you need to step away from the screen and appreciate the simple things in life. Nature has a way of inspiring creativity.',
      timestamp: '1 day ago',
      likes: 45,
      comments: 12
    },
    {
      id: '3',
      content: 'Learning new technologies every day. The tech world moves fast, but that\'s what makes it exciting. Always stay curious and keep growing!',
      timestamp: '3 days ago',
      likes: 67,
      comments: 23
    }
  ]);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Mock user data
  const user = {
    name: 'Alex Johnson',
    username: 'alexjohnson',
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
    bio: 'Software engineer passionate about AI and machine learning. Love hiking and exploring new technologies. Always up for a good conversation about tech trends and innovation.',
    socialLinks: {
      instagram: 'alexj_dev',
      linkedin: 'alex-johnson-dev', 
      twitter: 'alexjohnson_ai'
    }
  };

  // Close dropdown on outside click and Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownOpen) return;
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setDropdownOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dropdownOpen) return;
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setDeleteModalOpen(true);
    setPostMenuOpen(null);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setPosts(posts.filter(post => post.id !== postToDelete));
      setPostToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  const cancelDelete = () => {
    setPostToDelete(null);
    setDeleteModalOpen(false);
  };

  const togglePostMenu = (postId: string) => {
    setPostMenuOpen(postMenuOpen === postId ? null : postId);
  };

  const handleMenuAction = (action: string) => {
    if (action === 'Logout') {
      setLogoutModalOpen(true);
    } else if (action === 'Give Feedback') {
      router.push('/feedback');
    } else if (action === 'Edit Profile') {
      router.push('/edit-profile');
    } else {
      console.log(`${action} clicked`);
    }
    setDropdownOpen(false);
  };

  return (
    <AppLayout>
      <div className="bg-black">
        {/* Header with hamburger menu */}
        <div className="max-w-4xl mx-auto px-4">
          <AppHeader
            title="Profile"
            right={(
              <button
                ref={triggerRef}
                type="button"
                aria-label="Profile menu"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-controls="profile-menu-dropdown"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDropdownOpen((v) => !v);
                  }
                }}
                className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center space-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${dropdownOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${dropdownOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${dropdownOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </button>
            )}
          />
        </div>

        {/* Dropdown Menu */}
        <div
          ref={dropdownRef}
          id="profile-menu-dropdown"
          role="menu"
          aria-label="Profile menu"
          className={`overflow-hidden transition-all duration-300 ease-in-out max-w-4xl mx-auto px-4 ${
            dropdownOpen ? 'max-h-48 opacity-100 mb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-black py-2">
            <button
              onClick={() => handleMenuAction('Edit Profile')}
              className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center">
                <Edit className="w-4 h-4 text-white" />
              </div>
              Edit Profile
            </button>
            <button
              onClick={() => handleMenuAction('Give Feedback')}
              className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              Give Feedback
            </button>
            <button
              onClick={() => handleMenuAction('Logout')}
              className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center">
                <LogOut className="w-4 h-4 text-white" />
              </div>
              Logout
            </button>
          </div>
        </div>

        {/* LinkedIn-style Banner */}
        <div className="w-full">
          <div className="relative">
            {/* Banner Background - Full width, no rounded corners */}
            <div 
              className="h-48 sm:h-64"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
                    <p className="text-gray-400 text-lg mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                      @{user.username}
                    </p>
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
                      iconClassName="w-5 h-5"
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

          {/* Posts Section */}
          <div className="mt-6 space-y-3 max-w-2xl mx-auto px-4">
            <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
              Posts
            </h2>
            
            {posts.map((post) => (
              <div key={post.id} className="mb-3 relative">
                {/* 3-dots menu - Top Right */}
                <div className="absolute top-0 right-0 mt-2">
                  <button
                    onClick={() => togglePostMenu(post.id)}
                    className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                    aria-label="Post options"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {postMenuOpen === post.id && (
                    <div className="absolute right-0 mt-1 bg-gray-900 rounded-lg border border-gray-700 py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                
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
                      <span className="text-gray-400 text-sm">@{user.username}</span>
                    </div>
                    
                    {/* Post Text */}
                    <p className="text-gray-100 text-base mb-4 leading-tight">
                      {post.content}
                    </p>
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

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                Delete Post
              </h3>
              <p className="text-gray-300 text-sm mb-6" style={{ fontFamily: 'var(--font-inter)' }}>
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
                >
                  No
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation 
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </AppLayout>
  );
};

export default ProfileScreen;
