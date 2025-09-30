'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import EditablePostClean from '@/components/EditablePostClean';
import { fetchCurrentUserProfile, CompleteUserProfile, getProfilePictureUrl } from '@/utils/profileData';
import { createPost } from '@/utils/postData';

export default function CreatePostScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('✨ Share your thoughts with the world! What\'s on your mind today? #ZenlitMoments');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await fetchCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleSave = async (content: string, selectedImage: File | null) => {
    if (saving) return; // Prevent double submission
    
    setSaving(true);
    
    try {
      const result = await createPost({
        text: content,
        image: selectedImage || undefined,
      });

      if (result.success) {
        // Show success message and redirect
        alert('Post created successfully!');
        router.push('/feed'); // Redirect to feed or profile
      } else {
        alert(result.error || 'Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-black min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!userProfile) {
    return (
      <AppLayout>
        <div className="bg-black min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white">Failed to load user profile. Please try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-black min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <AppHeader 
            title="Create Post"
            left={
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            }
          />

          {/* Editable Post Component */}
          <EditablePostClean
            author={{
              name: userProfile.profile.display_name,
              username: userProfile.profile.user_name,
              avatar: getProfilePictureUrl(userProfile.socialLinks),
            }}
            initialContent={content}
            onSave={(content: string, image?: File) => handleSave(content, image || null)}
            disabled={saving}
          />
          
          {saving && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-white">Creating your post...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

