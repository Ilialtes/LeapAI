"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, Clock, Zap } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface CheckinEntry {
  id: string;
  text: string;
  date: string;
  timestamp: string;
  type?: 'focus' | 'manual' | 'milestone';
  duration?: number;
}

interface CheckinHistoryProps {
  goalId: string;
  checkins: CheckinEntry[];
  userEmail: string;
  onCheckinAdded?: () => void;
}

export default function CheckinHistory({ goalId, checkins, userEmail, onCheckinAdded }: CheckinHistoryProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  /**
   * AUTOMATION LOGIC:
   *
   * This component automatically creates check-ins when the user completes a focus session.
   *
   * Flow:
   * 1. User starts a focus session from ActionPanel → navigates to /focus-room
   * 2. User completes session → /focus-room redirects back with query params:
   *    - sessionComplete=true
   *    - task=[what they worked on]
   *    - duration=[minutes focused]
   * 3. This useEffect detects those params and creates a check-in automatically
   * 4. The manual "Add Check-in" button is completely removed
   */
  useEffect(() => {
    const sessionComplete = searchParams.get('sessionComplete');
    const task = searchParams.get('task');
    const duration = searchParams.get('duration');

    if (sessionComplete === 'true' && task) {
      // Automatically create a check-in entry
      createAutomaticCheckin(task, duration ? parseInt(duration) : 5);

      // Clean up URL params
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, goalId, router]);

  const createAutomaticCheckin = async (task: string, duration: number) => {
    try {
      if (!userEmail) {
        console.error('No user email found');
        return;
      }

      const checkinText = `Focused for ${duration} minutes: ${task}`;

      const response = await fetch(`/api/goals/${goalId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: checkinText,
          userEmail: userEmail
        }),
      });

      if (response.ok) {
        console.log('Automatic check-in created successfully');
        // Trigger parent component refresh
        if (onCheckinAdded) {
          onCheckinAdded();
        }
      }
    } catch (error) {
      console.error('Error creating automatic check-in:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return dateString;
    }
  };

  const getCheckinIcon = (checkin: CheckinEntry) => {
    if (checkin.text.includes('Focused for')) {
      return <Zap className="w-5 h-5 text-yellow-600" />;
    }
    return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  };

  const getCheckinBg = (checkin: CheckinEntry) => {
    if (checkin.text.includes('Focused for')) {
      return 'bg-yellow-50';
    }
    return 'bg-green-50';
  };

  if (checkins.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No activity yet</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Start your first focus session above, and your progress will automatically appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        Activity Timeline
        <span className="ml-auto text-sm font-normal text-gray-500">
          {checkins.length} {checkins.length === 1 ? 'entry' : 'entries'}
        </span>
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {checkins
          .slice()
          .reverse()
          .map((checkin) => (
            <div
              key={checkin.id}
              className={`flex items-start gap-4 p-4 rounded-xl ${getCheckinBg(checkin)} hover:shadow-md transition-all`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getCheckinIcon(checkin)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 break-words">
                  {checkin.text}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(checkin.timestamp || checkin.date)}
                </p>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ✨ Your activity is tracked automatically after each focus session
        </p>
      </div>
    </div>
  );
}
