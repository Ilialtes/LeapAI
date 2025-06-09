// src/components/layout/AppHeader.tsx
import React from 'react';
import Link from 'next/link'; // For the logo link
import { BookText, Settings, UserCircle2 } from 'lucide-react'; // Assuming UserCircle2 for avatar placeholder if no image

interface AppHeaderProps {
  showSettingsIcon?: boolean;
  // We can add other props like userName if needed, but for now, avatar is a placeholder
}

const AppHeader: React.FC<AppHeaderProps> = ({ showSettingsIcon = false }) => {
  return (
    <header className="flex justify-between items-center px-6 sm:px-8 md:px-10 py-4 border-b border-slate-200 bg-slate-50"> {/* Added bg-slate-50 to match page bg */}
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <BookText className="w-7 h-7 text-blue-600 group-hover:text-blue-700 transition-colors" />
        <span className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">Leap AI</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-4">
        {showSettingsIcon && (
          <button
            aria-label="Settings"
            className="p-2 rounded-full hover:bg-slate-200 transition-colors text-gray-600 hover:text-gray-800"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:w-6" />
          </button>
        )}
        {/* User Avatar Placeholder */}
        <div
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-300 flex items-center justify-center"
          title="User Avatar"
        >
           {/* Optionally, use an icon if no image is available */}
           {/* <UserCircle2 className="w-8 h-8 text-gray-500" /> */}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
