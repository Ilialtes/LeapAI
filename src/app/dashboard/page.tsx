"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useAchievements } from '@/context/AchievementContext';
import { useRouter } from 'next/navigation';
import { Focus } from 'lucide-react';
import Link from 'next/link';
import FirstStepModal from '@/components/modals/FirstStepModal';
import DailyIndicator from '@/components/DailyIndicator';
import AchievementUnlockedModal from '@/components/modals/AchievementUnlockedModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { newBadges } = useAchievements();
  const router = useRouter();
  const [showFirstStepModal, setShowFirstStepModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to start focusing</h1>
          <Link href="/auth/signin" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleFocusRoomClick = () => {
    // Navigate directly to the immediate immersion Focus Room
    router.push('/focus-room');
  };

  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 overflow-hidden" style={{height: '85vh', maxHeight: '85vh'}}>
      <div className="flex w-full max-w-7xl">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium mb-6" style={{color: '#546E7A'}}>
              Welcome back, {user.displayName || user.email?.split('@')[0]}.
            </h2>

            {/* Main Call to Action */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight" style={{color: '#2E7D32'}}>
              What's one small thing<br />we can do now?
            </h1>

            {/* Primary Action Button */}
            <button
              onClick={handleFocusRoomClick}
              className="text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 flex items-center gap-3 mx-auto"
              style={{backgroundColor: '#2E7D32'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
            >
              <Focus className="w-6 h-6" />
              Enter Focus Room
            </button>
          </div>

          {/* Secondary Navigation */}
          <div className="mt-8">
            <Link
              href="/goals-overview"
              className="underline transition-colors text-sm hover:opacity-80"
              style={{color: '#1565C0'}}
            >
              View My Goals
            </Link>
          </div>
        </div>

        {/* Side Panel */}
        <div className="hidden lg:block w-80 ml-8">
          <DailyIndicator
            onTrophyRoomClick={() => router.push('/trophy-room')}
            className="sticky top-8"
          />
        </div>
      </div>

      {/* First Step Modal */}
      <FirstStepModal
        isOpen={showFirstStepModal}
        onClose={() => setShowFirstStepModal(false)}
      />

      {/* Achievement Modal */}
      <AchievementUnlockedModal
        isOpen={newBadges.length > 0 || showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        onViewTrophyRoom={() => router.push('/trophy-room')}
      />
    </div>
  );
}
