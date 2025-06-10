// src/components/layout/AppHeader.tsx
import React from 'react';
import Link from 'next/link';
import { BookText, Settings, UserCircle2 } from 'lucide-react';

interface AppHeaderProps {
  showSettingsIcon?: boolean;
  isTransparent?: boolean; // New prop
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showSettingsIcon = false,
  isTransparent = false  // Default to not transparent
}) => {
  const headerClasses = `
    flex justify-between items-center px-6 sm:px-8 md:px-10 py-4
    ${isTransparent
      ? 'bg-transparent border-none'
      : 'bg-slate-50 border-b border-slate-200'
    }
  `;

  return (
    <header className={headerClasses}>
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <BookText className="w-7 h-7 text-blue-600 group-hover:text-blue-700 transition-colors" />
        <span className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">Leap AI</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-4">
        {showSettingsIcon && (
          <button
            aria-label="Settings"
            className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white" // Adjusted hover for potentially transparent bg
          >
            <Settings className="w-5 h-5 sm:w-6 sm:w-6" />
          </button>
        )}
        <div
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
          title="User Avatar"
        >
          {/* <UserCircle2 className="w-8 h-8 text-gray-500 dark:text-gray-400" /> */}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
