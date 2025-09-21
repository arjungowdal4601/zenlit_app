'use client';
import { useRouter } from 'next/navigation';

export default function GetStarted() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl mb-12 tracking-tight font-medium"
          style={{
            backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontFamily: 'var(--font-inter)'
          }}
        >
          Zenlit
        </h1>
        
        <button
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-medium px-10 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}