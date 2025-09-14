'use client';

import AppLayout from '@/components/AppLayout';

const FeedScreen = () => {
  const mockPosts = [
    {
      id: 1,
      user: 'Alex Chen',
      location: '0.2 km away',
      time: '2 min ago',
      content: 'Beautiful sunset at the park! Anyone else enjoying this weather?',
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      user: 'Sarah Kim',
      location: '0.5 km away',
      time: '15 min ago',
      content: 'Just discovered this amazing coffee shop downtown. Great vibes!',
      likes: 8,
      comments: 5
    },
    {
      id: 3,
      user: 'Mike Johnson',
      location: '1.2 km away',
      time: '1 hour ago',
      content: 'Looking for tennis partners this weekend. Who\'s in?',
      likes: 15,
      comments: 7
    }
  ];

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
            📰 Feed
          </h1>
          <p 
            className="text-gray-400 text-sm"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            See what's happening nearby
          </p>
        </div>
        
        <div className="space-y-4 max-w-md mx-auto">
          {mockPosts.map((post) => (
            <div key={post.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {post.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                      {post.user}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {post.location} • {post.time}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-200 text-sm mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                {post.content}
              </p>
              
              <div className="flex items-center space-x-4 text-gray-400 text-xs">
                <button className="flex items-center space-x-1 hover:text-red-400 transition-colors">
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                  <span>💬</span>
                  <span>{post.comments}</span>
                </button>
                <button className="hover:text-green-400 transition-colors">
                  <span>📤</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedScreen;