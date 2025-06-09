// app/dashboard/page.tsx
"use client";

import React from 'react';
import GoalCard from '@/components/dashboard/GoalCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { Bookmark, Rocket, Trophy, CheckCircle2, Flame, Sparkles } from 'lucide-react'; // Import Sparkles

export default function DashboardPage() {
  const userName = "Alex";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      <main className="max-w-7xl mx-auto p-6 sm:p-8 md:p-10">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome back, {userName}!
          </h1>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-300" title="User Avatar"></div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* "Top Goals" Section - Spanning 2 columns on larger screens */}
          <section className="lg:col-span-2">
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

          {/* Sidebar for "Daily Check-in" & "Momentum" - Spanning 1 column */}
          <aside className="lg:col-span-1 flex flex-col gap-6 sm:gap-8">
            {/* Daily Check-in Card */}
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

            {/* Momentum Card */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-700">Momentum</h2>
              </div>
              <div className="bg-amber-50 rounded-xl shadow-md p-6 text-center"> {/* Using bg-amber-50 for a soft orange/peach */}
                <p className="text-amber-800 font-semibold">Current Streak</p>
                <p className="text-5xl font-bold text-amber-600 my-2">7 days</p>
                <p className="text-sm text-amber-700">Keep up the great work!</p>
              </div>
            </section>
          </aside>
        </div>

        {/* AI Encouragement Section - Placed after the main grid */}
        <section> {/* Removed TEMP_AI_ENCOURAGEMENT_PLACEHOLDER div */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" /> {/* Using Sparkles icon */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
              AI Encouragement
            </h2>
          </div>
          <div className="bg-violet-50 rounded-xl shadow-md p-8"> {/* Using bg-violet-50 for light purple/lavender */}
            <blockquote className="text-center">
              <p className="italic text-lg sm:text-xl text-purple-800 leading-relaxed">
                "The only way to do great work is to love what you do."
              </p>
              <footer className="mt-4 text-sm text-purple-600 text-right">
                - AI Coach
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="text-center text-xs text-gray-400 mt-12 py-4"> {/* Added py-4 for some padding */}
          <p>© 2025 Leap AI. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
