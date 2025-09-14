export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 
           className="text-3xl md:text-5xl mb-8 tracking-tight font-medium"
           style={{
             backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
             WebkitBackgroundClip: 'text',
             backgroundClip: 'text',
             color: 'transparent',
             fontFamily: 'var(--font-inter)'
           }}
         >
           Home Screen
         </h1>
         <p 
           className="text-gray-400 text-lg"
           style={{ fontFamily: 'var(--font-inter)' }}
         >
           This is a blank home screen. Content will be added later.
         </p>
      </div>
    </div>
  );
}