// src/app/goals/[goalId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ActionPanel from '@/components/goal-detail/ActionPanel';
import StatsCard from '@/components/goal-detail/StatsCard';
import CheckinHistory from '@/components/goal-detail/CheckinHistory';

interface GoalDetailPageProps {
  params: Promise<{ goalId: string }>;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string;
  progress: number;
  milestones: Milestone[];
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  checkinHistory?: CheckinEntry[];
  currentStreak?: number;
  totalFocusTime?: number;
  sessionsCompleted?: number;
}

interface CheckinEntry {
  id: string;
  text: string;
  date: string;
  timestamp: string;
}

interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Unwrap the params Promise
  const { goalId } = React.use(params);

  const fetchGoal = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching goal:', goalId);
      const response = await fetch(`/api/goals?userEmail=${encodeURIComponent(user.email)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const foundGoal = data.goals.find((g: Goal) => g.id === goalId);
          if (foundGoal) {
            setGoal(foundGoal);
          } else {
            console.error('Goal not found');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [goalId, user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Goal Not Found</h1>
          <p className="text-gray-600 mb-6">The goal you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/goals" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Back to Goals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/goals">
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              {goal.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-gray-500">
                Due: {new Date(goal.dueDate).toLocaleDateString()}
              </p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                {goal.category}
              </span>
            </div>
            {goal.description && (
              <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
            )}
          </div>
        </div>
        <ActionPanel goal={{ id: goal.id, title: goal.title }} />
        <StatsCard
          stats={{
            totalFocusTime: goal.totalFocusTime || 0,
            sessionsCompleted: goal.sessionsCompleted || 0,
            currentStreak: goal.currentStreak || 0,
            progress: goal.progress,
            dueDate: goal.dueDate
          }}
        />
        <CheckinHistory
          goalId={goal.id}
          checkins={goal.checkinHistory || []}
          userEmail={user?.email || ''}
          onCheckinAdded={fetchGoal}
        />
      </main>
    </div>
  );
}
