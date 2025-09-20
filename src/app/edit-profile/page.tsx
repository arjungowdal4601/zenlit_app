'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import { ArrowLeft, Camera, X, Check, Save, Upload, Edit } from 'lucide-react';
import Image from 'next/image';

const EditProfilePage = () => {
  const router = useRouter();
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    displayName: 'Alex Johnson',
    bio: 'Software engineer passionate about AI and machine learning. Love hiking and exploring new technologies.',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
    bannerImage: null as string | null,
  });

  // State for form errors
  const [errors, setErrors] = useState<{
    displayName: string;
    bio: string;
  }>({
    displayName: '',
    bio: '',
  });

  // State for UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBannerMenu, setShowBannerMenu] = useState(false);
  
  // Overlays should be visible permanently on all devices
  const showOverlays = true;
  
  // File input refs
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.push('/profile');
  };

  // Banner image handlers
  const handleBannerImageSelect = () => {
    bannerFileInputRef.current?.click();
    setShowBannerMenu(false);
  };

  const handleRemoveBannerImage = () => {
    setProfileData(prev => ({ ...prev, bannerImage: null }));
    setShowBannerMenu(false);
  };

  // Profile image handlers
  const handleProfileImageSelect = () => {
    profileFileInputRef.current?.click();
    setShowProfileMenu(false);
  };

  const handleRemoveProfileImage = () => {
    setProfileData(prev => ({ ...prev, profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4' }));
    setShowProfileMenu(false);
  };



  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field in errors && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field as keyof typeof errors]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {
      displayName: '',
      bio: '',
    };
    
    if (!profileData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (profileData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-black min-h-screen">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4">
          <AppHeader
            title="Edit Profile"
            left={(
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
          />
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="bg-green-600 text-white p-4 rounded-lg flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span style={{ fontFamily: 'var(--font-inter)' }}>Profile updated successfully!</span>
            </div>
          </div>
        )}

        {/* Profile Layout - Similar to Profile Page */}
        <div className="w-full">
          <div className="relative">
            {/* Banner Background */}
            <div className="relative">
              <div 
                className="h-48 sm:h-64 cursor-pointer group"
                style={{
                  backgroundImage: profileData.bannerImage 
                    ? `url(${profileData.bannerImage})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
                onClick={() => setShowBannerMenu(true)}
               >
                {/* Banner Edit Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`bg-black/30 absolute inset-0 transition-colors duration-200`} />
                  <div className={`opacity-100 transition-opacity duration-200 relative z-10`}>
                    <div className="bg-black/75 rounded-full p-3">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Menu Popup */}
              {showBannerMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4">
                    <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                      Banner Options
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleBannerImageSelect}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span style={{ fontFamily: 'var(--font-inter)' }}>Upload Banner</span>
                      </button>
                      {profileData.bannerImage && (
                        <button
                          onClick={handleRemoveBannerImage}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                          <span style={{ fontFamily: 'var(--font-inter)' }}>Remove Banner</span>
                        </button>
                      )}
                      <button
                        onClick={() => setShowBannerMenu(false)}
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                        style={{ fontFamily: 'var(--font-inter)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="relative bg-black px-4 sm:px-6 pb-6">
              {/* Profile Photo and Layout */}
              <div className="flex justify-between items-start pt-4">
                {/* Left Side: Profile Photo */}
                <div className="flex flex-col">
                  {/* Profile Photo - overlapping the banner */}
                  <div className="relative -mt-12 sm:-mt-16 mb-4">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => setShowProfileMenu(true)}
                     >
                      <Image
                        src={profileData.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-black"
                        priority
                        unoptimized
                      />
                      {/* Profile Edit Overlay */}
                      <div className="absolute inset-0 z-30 pointer-events-none transition-all duration-200 flex items-center justify-center rounded-lg">
                        <div className={`opacity-100 transition-opacity duration-200 relative z-30`}>
                          <div className="bg-black/75 rounded-full p-3">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className={`bg-black/50 absolute inset-0 rounded-lg transition-colors duration-200`} />
                      </div>
                    </div>

                    {/* Profile Menu Popup */}
                    {showProfileMenu && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4">
                          <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            Profile Picture Options
                          </h3>
                          <div className="space-y-3">
                            <button
                              onClick={handleProfileImageSelect}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                            >
                              <Upload className="w-5 h-5" />
                              <span style={{ fontFamily: 'var(--font-inter)' }}>Upload Profile Picture</span>
                            </button>
                            <button
                              onClick={handleRemoveProfileImage}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                            >
                              <X className="w-5 h-5" />
                              <span style={{ fontFamily: 'var(--font-inter)' }}>Remove Profile Picture</span>
                            </button>
                            <button
                              onClick={() => setShowProfileMenu(false)}
                              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                              style={{ fontFamily: 'var(--font-inter)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 space-y-6 pb-8">
              {/* Display Name */}
              <div>
                <label 
                  htmlFor="display-name"
                  className="block text-white font-medium mb-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`w-full px-4 py-3 bg-black border ${
                    errors.displayName ? 'border-red-500' : 'border-white'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors`}
                  style={{ fontFamily: 'var(--font-inter)' }}
                  placeholder="Enter your display name"
                />
                {errors.displayName && (
                  <p className="mt-1 text-red-400 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label 
                  htmlFor="bio"
                  className="block text-white font-medium mb-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 bg-black border ${
                    errors.bio ? 'border-red-500' : 'border-white'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors resize-none`}
                  style={{ fontFamily: 'var(--font-inter)' }}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-400 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                      {errors.bio}
                    </p>
                  )}
                  <p className={`text-sm ml-auto ${
                    profileData.bio.length > 450 ? 'text-red-400' : 'text-gray-400'
                  }`} style={{ fontFamily: 'var(--font-inter)' }}>
                    {profileData.bio.length}/500
                  </p>
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-none font-medium flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Hidden File Inputs */}
          <input
            ref={profileFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setProfileData(prev => ({ ...prev, profileImage: event.target?.result as string }));
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
          <input
            ref={bannerFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setProfileData(prev => ({ ...prev, bannerImage: event.target?.result as string }));
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default EditProfilePage;