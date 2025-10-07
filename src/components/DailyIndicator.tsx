"use client";

import React from 'react';
import { Trophy, Flame, Target, Award } from 'lucide-react';
import { useAchievements } from '@/context/AchievementContext';
import { BADGE_RARITY } from '@/data/badges';

interface DailyIndicatorProps {
  onTrophyRoomClick?: () => void;
  className?: string;
}

export default function DailyIndicator({ onTrophyRoomClick, className = '' }: DailyIndicatorProps) {
  const {
    newBadges,
    getUserProgress,
    getTotalBadgesByRarity,
    userData
  } = useAchievements();

  const { unlockedCount, totalBadges } = getUserProgress();
  const hasNewBadges = newBadges.length > 0;

  const rarityStats = {
    common: getTotalBadgesByRarity(BADGE_RARITY.COMMON),
    rare: getTotalBadgesByRarity(BADGE_RARITY.RARE),
    epic: getTotalBadgesByRarity(BADGE_RARITY.EPIC),
    legendary: getTotalBadgesByRarity(BADGE_RARITY.LEGENDARY)
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-800">Daily Progress</h3>
        </div>

        {hasNewBadges && (
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Streak</span>
          </div>
          <p className="text-lg font-bold text-orange-800">{userData.currentStreak}</p>
          <p className="text-xs text-orange-600">days</p>
        </div>

        {/* Focus Sessions */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Sessions</span>
          </div>
          <p className="text-lg font-bold text-green-800">{userData.totalFocusSessions}</p>
          <p className="text-xs text-green-600">total</p>
        </div>
      </div>

      {/* Badge Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Badges Collected</span>
          <span className="text-sm text-gray-500">{unlockedCount}/{totalBadges}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{width: `${totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0}%`}}
          />
        </div>

        {/* Rarity Breakdown */}
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs font-medium text-gray-600 mb-1">Common</div>
            <div className="text-sm font-bold text-gray-700">{rarityStats.common}</div>
          </div>
          <div className="bg-blue-50 rounded p-2">
            <div className="text-xs font-medium text-blue-600 mb-1">Rare</div>
            <div className="text-sm font-bold text-blue-700">{rarityStats.rare}</div>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <div className="text-xs font-medium text-green-600 mb-1">Epic</div>
            <div className="text-sm font-bold text-green-700">{rarityStats.epic}</div>
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <div className="text-xs font-medium text-yellow-600 mb-1">Legend</div>
            <div className="text-sm font-bold text-yellow-700">{rarityStats.legendary}</div>
          </div>
        </div>
      </div>

      {/* New Badges Alert */}
      {hasNewBadges && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-yellow-700" />
            <span className="text-sm font-semibold text-yellow-800">New Achievement!</span>
          </div>
          <p className="text-xs text-yellow-700 mb-2">
            You've unlocked {newBadges.length} new badge{newBadges.length > 1 ? 's' : ''}!
          </p>
          <button
            onClick={onTrophyRoomClick}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
          >
            View Now
          </button>
        </div>
      )}

      {/* Trophy Room Button */}
      <button
        onClick={onTrophyRoomClick}
        className={`
          w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors
          ${hasNewBadges
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }
        `}
      >
        <Trophy className="w-4 h-4" />
        Trophy Room
        {hasNewBadges && (
          <span className="bg-white bg-opacity-30 text-xs px-1.5 py-0.5 rounded-full">
            {newBadges.length}
          </span>
        )}
      </button>
    </div>
  );
}