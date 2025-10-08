"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import CommonHeader from "@/components/layout/CommonHeader";
import OnboardingModal from "@/components/modals/OnboardingModal";
import TrialBanner from "@/components/TrialBanner";

interface LayoutContentProps {
  children: React.ReactNode;
}

interface OnboardingData {
  struggleWithFocus: boolean;
  focusChallenges: string;
  helpfulStrategies: string[];
}

function LayoutContent({ children }: LayoutContentProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isAuthPage = pathname === '/auth/signin' || pathname === '/auth/signup';
  const isHomePage = pathname === '/';

  // Check if user needs onboarding (new user)
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user?.email) return;

      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem(`onboarding-completed-${user.email}`);

      if (!hasCompletedOnboarding && !isAuthPage) {
        // Small delay to let the page settle after login
        setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
      }
    };

    checkOnboarding();
  }, [user?.email, isAuthPage]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user?.email) return;

    try {
      // Save onboarding data to user profile
      await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          adhd: {
            diagnosed: data.struggleWithFocus,
            notes: data.focusChallenges,
            copingStrategies: data.helpfulStrategies
          }
        })
      });

      // Mark onboarding as completed
      localStorage.setItem(`onboarding-completed-${user.email}`, 'true');
      setShowOnboarding(false);

      // Navigate to focus room
      router.push('/focus-room');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setShowOnboarding(false);
    }
  };

  const handleOnboardingClose = () => {
    if (user?.email) {
      localStorage.setItem(`onboarding-completed-${user.email}`, 'true');
    }
    setShowOnboarding(false);
  };

  // Always show header now, but it will conditionally show content based on auth state
  const showHeader = true;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {showHeader && <CommonHeader />}
      {user?.email && !isAuthPage && !isHomePage && <TrialBanner userEmail={user.email} />}
      <div className="flex-1 bg-slate-50">
        {children}
      </div>
      <footer className="text-center text-xs text-gray-400 py-4 bg-slate-50">
        <p>© 2025 SubtlePush. All rights reserved.</p>
      </footer>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
        userName={user?.displayName || user?.email?.split('@')[0] || 'there'}
      />
    </div>
  );
}

export default LayoutContent;