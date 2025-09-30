'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import SocialLinkButton from '@/components/SocialLinkButton';
import { ensureSocialUrl } from '@/constants/socialPlatforms';
import Image from 'next/image';
import { useEffect, useState, useRef, useMemo } from 'react';
import { 
  fetchUserProfile, 
  CompleteUserProfile, 
  UserPost, 
  getProfilePictureUrl, 
  getBannerUrl, 
  getSocialMediaLinks
} from '@/utils/profileData';

const OtherUserProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const idParam = (params?.id ?? '') as string;

  // State for user profile data
  const [userProfile, setUserProfile] = useState<CompleteUserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!idParam) {
        if (isMounted) {
          setError('Invalid user ID');
          setLoading(false);
        }
        return;
      }

      try {
        if (!isMounted) return;

        setLoading(true);
        setError(null);

        const data = await fetchUserProfile(idParam);

        if (!isMounted) return;

        if (!data) {
          setError('User not found');
          setLoading(false);
          return;
        }

        setUserProfile(data);
        setPosts(data.posts);
      } catch (err) {
        if (isMounted) {
          console.error('Error loading user data:', err);
          setError('Failed to load user profile');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [idParam]);

  const normalizedSocialLinks = useMemo(
    () => getSocialMediaLinks(userProfile?.socialLinks ?? null),
    [userProfile?.socialLinks]
  );

  // Loading state
  if (loading) {
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
            <p className="text-gray-300">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state or user not found
  if (error || !userProfile) {
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
            <p className="text-gray-300">{error || 'User not found.'}</p>
            {error && (
              <button
                onClick={() => router.refresh()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  const instagramUrl = ensureSocialUrl('instagram', normalizedSocialLinks.instagram);
  const linkedinUrl = ensureSocialUrl('linkedin', normalizedSocialLinks.linkedin);
  const twitterUrl = ensureSocialUrl('twitter', normalizedSocialLinks.twitter);

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
                background: getBannerUrl(userProfile.socialLinks) 
                  ? `url(${getBannerUrl(userProfile.socialLinks)}) center/cover` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            ></div>

            {/* Profile Section */}
            <div className="relative bg-black px-4 sm:px-6 pb-3">
              {/* Profile Photo and Layout */}
              <div className="flex justify-between items-start pt-4">
                {/* Left Side: Profile Photo and User Info */}
                <div className="flex flex-col">
                  {/* Profile Photo - square with rounded corners */}
                  <div className="relative -mt-12 sm:-mt-16 mb-4">
                    <Image
                      src={getProfilePictureUrl(userProfile.socialLinks)}
                      alt={`${userProfile.profile.display_name || userProfile.profile.user_name}'s profile`}
                      width={120}
                      height={120}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-black"
                      priority
                    />
                  </div>

                  {/* User Info - Display name and username below profile pic */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                      {userProfile.profile.display_name || userProfile.profile.user_name}
                    </h1>
                    <p className="text-gray-400 text-sm mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                      @{userProfile.profile.user_name}
                    </p>
                  </div>
                </div>

                {/* Right Side: Social Links */}
                <div className="flex items-center space-x-1.5 pt-2">
                  <SocialLinkButton
                    platform="instagram"
                    href={instagramUrl ?? undefined}
                    buttonClassName={instagramUrl ? 'hover:scale-110' : 'pointer-events-none opacity-50 filter grayscale'}
                    containerClassName="w-8 h-8"
                    iconClassName="w-5 h-5"
                    ariaLabel="Instagram"
                  />

                  <SocialLinkButton
                    platform="linkedin"
                    href={linkedinUrl ?? undefined}
                    buttonClassName={linkedinUrl ? 'hover:scale-110' : 'pointer-events-none opacity-50 filter grayscale'}
                    containerClassName="w-8 h-8"
                    iconClassName="w-5 h-5"
                    ariaLabel="LinkedIn"
                  />

                  <SocialLinkButton
                    platform="twitter"
                    href={twitterUrl ?? undefined}
                    buttonClassName={twitterUrl ? 'hover:scale-110' : 'pointer-events-none opacity-50 filter grayscale'}
                    containerClassName="w-8 h-8"
                    iconClassName="w-5 h-5"
                    containerStyle={{ border: '1px solid #333' }}
                    ariaLabel="X (Twitter)"
                  />
                </div>
              </div>

              {/* Bio - Full width below the profile section with line clamp */}
              <BioWithClamp bioText={userProfile.socialLinks?.bio || 'No bio available'} />
            </div>
          </div>

          {/* Separator Line */}
          <div className="mt-4 max-w-2xl mx-auto px-4">
            <div className="border-t border-gray-700"></div>
          </div>

          {/* Posts Section */}
          <div className="bg-black rounded-lg border border-gray-800 p-6">
            <h2 className="text-white text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
              Posts
            </h2>
            
            {posts.length === 0 ? (
              <p className="text-gray-400 text-center py-8" style={{ fontFamily: 'var(--font-inter)' }}>
                No posts yet
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-start space-x-3">
                      {/* Author Profile Picture */}
                      <div className="flex-shrink-0">
                        <Image
                          src={getProfilePictureUrl(userProfile.socialLinks)}
                          alt={userProfile.profile.display_name || userProfile.profile.user_name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        {/* Author Info - No timestamp */}
                        <div className="mb-2">
                          <h3 className="text-white font-semibold text-base">{userProfile.profile.display_name || userProfile.profile.user_name}</h3>
                          <span className="text-gray-400 text-sm">@{userProfile.profile.user_name}</span>
                        </div>

                        {/* Post Text */}
                        <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                          {post.text}
                        </p>

                        {/* Post Image */}
                        {post.image_url && (
                          <div className="mt-3">
                            <Image
                              src={post.image_url}
                              alt="Post image"
                              width={400}
                              height={300}
                              className="rounded-lg object-cover max-w-full h-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// Local component: reusing clamp logic for other user's profile
const BioWithClamp: React.FC<{ bioText: string }> = ({ bioText }) => {
  const [showFull, setShowFull] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isClamped = el.scrollHeight > el.clientHeight + 1;
    setClamped(isClamped);
  }, [bioText, showFull]);

  return (
    <div className="mt-2">
      <p
        ref={ref}
        className="text-white text-base leading-normal max-w-2xl"
        style={
          showFull
            ? { fontFamily: 'var(--font-inter)' }
            : {
                fontFamily: 'var(--font-inter)',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {bioText}
      </p>
      {!showFull && clamped && (
        <button
          type="button"
          onClick={() => setShowFull(true)}
          className="text-blue-400 text-sm mt-1 hover:underline"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          more
        </button>
      )}
    </div>
  );
};

export default OtherUserProfilePage;
