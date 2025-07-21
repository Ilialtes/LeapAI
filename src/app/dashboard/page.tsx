"use client";

import React, { useState, useEffect } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import GoalCoach from '@/components/GoalCoach';
import TopGoalsSection from '@/components/dashboard/TopGoalsSection';
import NewGoalModal from '@/components/modals/NewGoalModal';
import { useAuth } from '@/context/AuthProvider';
import { Bookmark, CheckCircle2, Flame, Sparkles, Target, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [totalStreak, setTotalStreak] = useState(0);
  const [todayCheckins, setTodayCheckins] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/goals?userEmail=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(data.goals);
          
          // Calculate total streak and today's checkins
          let maxStreak = 0;
          let checkins = 0;
          const today = new Date().toISOString().split('T')[0];
          
          data.goals.forEach((goal: any) => {
            if (goal.currentStreak && goal.currentStreak > maxStreak) {
              maxStreak = goal.currentStreak;
            }
            if (goal.checkinHistory) {
              const todayCheckins = goal.checkinHistory.filter((checkin: any) => {
                const checkinDate = new Date(checkin.timestamp || checkin.date).toISOString().split('T')[0];
                return checkinDate === today;
              });
              checkins += todayCheckins.length;
            }
          });
          
          setTotalStreak(maxStreak);
          setTodayCheckins(checkins);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.email]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your dashboard</h1>
          <Link href="/auth/signin" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-gray-800 font-sans">
      <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 my-6 sm:my-8">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome back, {user.displayName || user.email?.split('@')[0]}!
          </h1>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Active Goals</h3>
            </div>
            <p className="text-3xl font-bold text-blue-700">{goals.length}</p>
            <p className="text-sm text-blue-600">Keep pushing forward!</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Today's Check-ins</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">{todayCheckins}</p>
            <p className="text-sm text-green-600">Great progress today!</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">Best Streak</h3>
            </div>
            <p className="text-3xl font-bold text-orange-700">{totalStreak} days</p>
            <p className="text-sm text-orange-600">Keep the momentum!</p>
          </div>
        </div>

        <div className="flex flex-col gap-8 sm:gap-10">
          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Bookmark className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
                Your Goals
              </h2>
            </div>
            <TopGoalsSection />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
                AI Goal Coach
              </h2>
            </div>
            <GoalCoach userEmail={user.email || ''} />
          </section>
        </div>
      </main>
      
      <NewGoalModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGoalCreated={() => {
          fetchDashboardData(); // Refresh dashboard data
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}
