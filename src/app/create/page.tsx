'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const CreatePostScreen = () => {
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!postContent.trim()) return;
    
    setIsPosting(true);
    // Simulate posting delay
    setTimeout(() => {
      setIsPosting(false);
      setPostContent('');
      // Here you would typically navigate to feed or show success message
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 
            className="text-3xl md:text-4xl mb-2 tracking-tight font-medium"
            style={{
              backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'var(--font-inter)'
            }}
          >
            ➕ Create Post
          </h1>
          <p 
            className="text-gray-400 text-sm"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Share what's on your mind
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">You</span>
              </div>
              <div>
                <h3 className="text-white font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                  Your Post
                </h3>
                <p className="text-gray-400 text-sm">📍 Current location</p>
              </div>
            </div>
            
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's happening around you?"
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
              style={{ fontFamily: 'var(--font-inter)' }}
              rows={4}
              maxLength={280}
            />
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-gray-400 text-sm">
                {postContent.length}/280
              </span>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                  📷
                </button>
                <button className="p-2 text-gray-400 hover:text-green-400 transition-colors">
                  📍
                </button>
                <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                  😊
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePost}
            disabled={!postContent.trim() || isPosting}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              !postContent.trim() || isPosting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {isPosting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </div>
            ) : (
              'Share Post'
            )}
          </button>
          
          <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h3 className="text-white font-medium mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
              💡 Tips for great posts:
            </h3>
            <ul className="text-gray-400 text-sm space-y-1" style={{ fontFamily: 'var(--font-inter)' }}>
              <li>• Share interesting moments from your day</li>
              <li>• Ask questions to start conversations</li>
              <li>• Be respectful and kind to others</li>
              <li>• Use location tags to connect locally</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePostScreen;