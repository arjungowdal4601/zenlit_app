'use client';

interface AppHeaderProps {
  title: string;
  right?: React.ReactNode;
}

const AppHeader = ({ title, right }: AppHeaderProps) => {
  return (
    <div>
      <div className="flex items-center justify-between pt-4 pb-2">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl tracking-tight font-medium"
          style={{
            backgroundImage: 'linear-gradient(to right, #2563eb, #7e22ce)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontFamily: 'var(--font-inter)'
          }}
        >
          {title}
        </h1>
        {right && <div className="flex items-center space-x-4">{right}</div>}
      </div>
      <hr className="border-t border-gray-600 mb-6" />
    </div>
  );
};

export default AppHeader;
