// app/celebrate/page.tsx
"use client";

import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
// ConfettiBar import removed
import { Check, Share2 } from 'lucide-react'; // Keep other necessary icons

export default function CelebrationPage() {
  const userName = "Sarah";

  return (
    // Updated root div classes for background
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 to-slate-50 text-gray-800 font-sans flex flex-col relative">
      {/* ConfettiBar element removed */}

      <div className="absolute top-0 left-0 right-0 z-10">
        <AppHeader showSettingsIcon={false} isTransparent={true} />
      </div>

      {/* This div will center the main card and allow footer to be below it naturally */}
      <div className="flex flex-col items-center justify-center flex-grow w-full px-4 py-12 sm:py-16 md:py-20"> {/* Added flex-grow and padding */}
        <main className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-md flex flex-col items-center text-center z-0">

          <div className="mb-6">
            <div className="bg-green-100 p-3 rounded-full inline-block">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 stroke-[3]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">
              Congratulations, {userName}!
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
              You've smashed your goal and achieved a new milestone. Your dedication is inspiring! Keep up the fantastic work.
            </p>
          </div>

          <div className="mt-6 w-full aspect-video bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-sm text-slate-500 p-4">
            Shareable Graphic Placeholder
          </div>

          <div className="mt-8 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 text-sm sm:text-base">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Share Your Win</span>
            </button>
            <button className="bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-lg border border-slate-300 shadow-sm transition-colors duration-150 text-sm sm:text-base">
              Continue
            </button>
          </div>
        </main>
      </div> {/* End of centering div */}

      {/* Footer Section */}
      <footer className="w-full text-center text-xs text-gray-500 py-6"> {/* Changed mt-8 to py-6 for consistent padding */}
        <p>© 2024 Leap AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
