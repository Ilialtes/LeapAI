"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Clock } from 'lucide-react';

interface TrialBannerProps {
  userEmail: string;
}

export default function TrialBanner({ userEmail }: TrialBannerProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed for this session
    const dismissed = sessionStorage.getItem(`trial-banner-dismissed-${userEmail}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Fetch trial status from API
    const fetchTrialStatus = async () => {
      try {
        const response = await fetch(`/api/user-trial-status?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (data.success && data.trialActive) {
          setDaysRemaining(data.daysRemaining);
        }
      } catch (error) {
        console.error('Failed to fetch trial status:', error);
      }
    };

    fetchTrialStatus();
  }, [userEmail]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`trial-banner-dismissed-${userEmail}`, 'true');
  };

  // Don't show if dismissed or no trial data
  if (isDismissed || daysRemaining === null || daysRemaining < 0) {
    return null;
  }

  // Determine urgency styling
  const isUrgent = daysRemaining <= 2;
  const bgColor = isUrgent ? 'bg-orange-50' : 'bg-blue-50';
  const borderColor = isUrgent ? 'border-orange-200' : 'border-blue-200';
  const textColor = isUrgent ? 'text-orange-800' : 'text-blue-800';
  const buttonColor = isUrgent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className={`${bgColor} border-b ${borderColor} px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Clock className={`w-5 h-5 ${textColor}`} />
          <p className={`text-sm font-medium ${textColor}`}>
            {daysRemaining === 0 ? (
              <>Your free trial ends today!</>
            ) : daysRemaining === 1 ? (
              <>You have 1 day left in your free trial.</>
            ) : (
              <>You have {daysRemaining} days left in your free trial.</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings?tab=billing"
            className={`${buttonColor} text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap`}
          >
            Upgrade Now
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
