'use client';

import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import EditablePost from '@/components/EditablePostClean';

const CreatePostScreen = () => {
  const handleSave = (content: string, image?: File) => {
    console.log('Saving post:', { content, image });
    // Here you would typically save to your backend
  };

  // Mock user data
  const mockUser = {
    name: 'Emma Wilson',
    username: 'emmaw',
    avatar: undefined,
    socialLinks: {
      instagram: 'https://instagram.com/emmaw',
      linkedin: 'https://linkedin.com/in/emmaw',
      twitter: 'https://twitter.com/emmaw',
    },
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4">
          <AppHeader title="Create Post" />

          {/* Editable Post Component */}
          <EditablePost
            author={mockUser}
            initialContent={
              "Coffee shop vibes today ☕️ Perfect place to get some coding done. What's your favorite place to work from?"
            }
            onSave={handleSave}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePostScreen;

