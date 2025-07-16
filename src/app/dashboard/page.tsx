// app/dashboard/page.tsx
"use client";

import React from 'react';
import AppHeader from '@/components/layout/AppHeader'; // IMPORT AppHeader
import GoalCard from '@/components/dashboard/GoalCard';
import ProgressBar from '@/components/ui/ProgressBar';
import MovieSuggestion from '@/components/MovieSuggestion';
// Remove BookText from here if it's only used in AppHeader now
import { Bookmark, Rocket, Trophy, CheckCircle2, Flame, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const userName = "Alex"; // This could be sourced from context/auth state later

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      {/* Use AppHeader */}
      <AppHeader showSettingsIcon={false} />

      {/* The rest of the dashboard main content card and footer remains */}
      <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 my-6 sm:my-8">

        {/* Welcome Message - no longer in its own header, direct child of main card */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-10">
          Welcome back, {userName}!
        </h1>

        {/* Sections Container - now a single column flow */}
        <div className="flex flex-col gap-8 sm:gap-10"> {/* Replaced grid with flex flex-col and gap */}

          {/* "Top Goals" Section */}
          <section> {/* Removed lg:col-span-2 */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Bookmark className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
                Top Goals
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GoalCard
                icon={<Rocket />}
                title="Launch new product"
                dueDate="Due: August 15th"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
              <GoalCard
                icon={<Trophy />}
                title="Run a marathon"
                dueDate="Due: November 5th"
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
              />
            </div>
          </section>

          {/* "Daily Check-in" Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-700">Daily Check-in</h2>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-3">Today's check-in progress</p>
              <div className="flex items-center gap-3 mb-1">
                <ProgressBar progress={75} barColor="bg-green-500" height="h-3" />
                <span className="text-sm font-medium text-green-600">75%</span>
              </div>
              <p className="text-xs text-gray-500">3 of 4 questions answered</p>
            </div>
          </section>

          {/* "AI Encouragement" Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
                AI Encouragement
              </h2>
            </div>
            <div className="bg-violet-50 rounded-xl shadow-md p-8 border border-violet-100">
              <blockquote>
                <p className="italic text-lg sm:text-xl text-purple-800 leading-relaxed">
                  "The only way to do great work is to love what you do."
                </p>
                <footer className="mt-4 text-sm text-purple-600 text-right">
                  - AI Coach
                </footer>
              </blockquote>
            </div>
          </section>

          {/* "Momentum" Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-700">Momentum</h2>
            </div>
            <div className="bg-amber-50 rounded-xl shadow-md p-6 text-center border border-amber-100">
              <p className="text-amber-800 font-semibold">Current Streak</p>
              <p className="text-5xl font-bold text-amber-600 my-2">7 days</p>
              <p className="text-sm text-amber-700">Keep up the great work!</p>
            </div>
          </section>

          {/* Movie Suggestion Section */}
          <section>
            <MovieSuggestion userEmail="alex@example.com" />
          </section>
        </div>

        {/* Footer Section (remains outside the main card) */}
        <footer className="text-center text-xs text-gray-400 mt-12 py-4">
          <p>© 2025 Leap AI. All rights reserved.</p>
        </footer>
      </main> 
    </div>
  );
}
