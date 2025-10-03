"use client";

import React from 'react';
import { Clock, Target, Flame, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  stats: {
    totalFocusTime?: number;
    sessionsCompleted?: number;
    currentStreak?: number;
    progress?: number;
    dueDate?: string;
  };
}

export default function StatsCard({ stats }: StatsCardProps) {
  const {
    totalFocusTime = 0,
    sessionsCompleted = 0,
    currentStreak = 0,
    progress = 0,
    dueDate
  } = stats;

  // Calculate days until due date
  const getDaysUntilDue = () => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();

  // Format focus time in hours and minutes
  const formatFocusTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        Your Progress
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Focus Time */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {formatFocusTime(totalFocusTime)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Focus Time</div>
        </div>

        {/* Sessions Completed */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {sessionsCompleted}
          </div>
          <div className="text-sm text-gray-500 mt-1">Sessions</div>
        </div>

        {/* Current Streak */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {currentStreak}
          </div>
          <div className="text-sm text-gray-500 mt-1">Day Streak</div>
        </div>

        {/* Days Until Due */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {daysUntilDue !== null ? daysUntilDue : '—'}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {daysUntilDue !== null && daysUntilDue < 0 ? 'Overdue' : 'Days Left'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Progress</span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
