'use client';

import { useRouter } from 'next/navigation';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Navigate to the get started page
    router.push('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-600 rounded-xl p-6 max-w-sm w-full mx-4 relative" style={{boxShadow: '4px 4px 8px rgba(255, 255, 255, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.05)'}}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        {/* Modal content */}
        <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-inter)' }}>Logout</h2>
        <p className="text-gray-300 mb-6" style={{ fontFamily: 'var(--font-inter)' }}>Are you sure you want to logout?</p>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;