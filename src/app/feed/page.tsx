'use client';

import AppLayout from '@/components/AppLayout';
import AppHeader from '@/components/AppHeader';
import Post from '@/components/Post';
import { useVisibility } from '@/contexts/VisibilityContext';

// Sample posts data
const samplePosts = [
  {
    id: '1',
    author: {
      name: 'Alex Johnson',
      username: 'alexj',
      socialLinks: {
        instagram: 'alexj_dev',
        linkedin: 'alex-johnson-dev',
        twitter: 'alexjohnson_ai',
      },
    },
    content:
      'Just finished reading an amazing book on machine learning! The concepts around neural networks are fascinating. Anyone else diving into AI lately? 🤖📚',
    timestamp: '2h',
  },
  {
    id: '2',
    author: {
      name: 'Sarah Chen',
      username: 'sarahc',
      socialLinks: {
        instagram: 'sarahchen_design',
        linkedin: 'sarah-chen-ux',
        twitter: 'sarahdesigns',
      },
    },
    content:
      'Beautiful sunset from my balcony today. Sometimes you need to pause and appreciate the simple moments in life.',
    image: '/next.svg', // Using existing asset as placeholder
    timestamp: '4h',
  },
  {
    id: '3',
    author: {
      name: 'Mike Rodriguez',
      username: 'mikerod',
      socialLinks: {
        instagram: 'marcus_startup',
        linkedin: 'marcus-rodriguez-ceo',
        twitter: 'marcusfintech',
      },
    },
    content:
      'Working on a new React project and loving the new features in Next.js 14. The app directory structure makes everything so much cleaner!',
    timestamp: '6h',
  },
  {
    id: '4',
    author: {
      name: 'Emma Wilson',
      username: 'emmaw',
      socialLinks: {
        instagram: 'emmaw_coffee',
        linkedin: 'emma-wilson-dev',
        twitter: 'emmawilson_code',
      },
    },
    content:
      "Coffee shop vibes today ☕️ Perfect place to get some coding done. What's your favorite place to work from?",
    image: '/vercel.svg', // Using existing asset as placeholder
    timestamp: '8h',
  },
  {
    id: '5',
    author: {
      name: 'David Kim',
      username: 'davidk',
      socialLinks: {
        instagram: 'davidk_fullstack',
        linkedin: 'david-kim-developer',
        twitter: 'davidkim_dev',
      },
    },
    content:
      'Just deployed my first full-stack application! The feeling of seeing your code come to life is unmatched. Onto the next challenge! 🚀',
    timestamp: '12h',
  },
  {
    id: '6',
    author: {
      name: 'Lisa Thompson',
      username: 'lisat',
      socialLinks: {
        instagram: 'lisat_nature',
        linkedin: 'lisa-thompson-explorer',
        twitter: 'lisathompson_hike',
      },
    },
    content:
      'Exploring the mountains this weekend. Nature has a way of clearing your mind and sparking creativity.',
    image: '/globe.svg', // Using existing asset as placeholder
    timestamp: '1d',
  },
];

const FeedScreen = () => {
  const { selectedAccounts } = useVisibility();

  return (
    <AppLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4">
          <AppHeader title="Feed" />

          {/* Posts - card-based layout */}
          <div className="pb-8">
            {samplePosts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                author={post.author}
                content={post.content}
                image={post.image}
                timestamp={post.timestamp}
                selectedAccounts={selectedAccounts}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedScreen;

