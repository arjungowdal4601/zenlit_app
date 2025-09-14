import Navigation from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="pb-20">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default AppLayout;