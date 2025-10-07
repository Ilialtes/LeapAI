"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { useAchievements } from '@/context/AchievementContext';
import { BADGES, BADGE_CATEGORIES, BADGE_RARITY, RARITY_COLORS, CATEGORY_COLORS } from '@/data/badges';
import { Trophy, ArrowLeft, Filter, Search, Award, Target, Calendar, Flame, Star, Sparkles } from 'lucide-react';

const CATEGORY_ICONS = {
  [BADGE_CATEGORIES.FOCUS]: Target,
  [BADGE_CATEGORIES.CONSISTENCY]: Calendar,
  [BADGE_CATEGORIES.GOALS]: Award,
  [BADGE_CATEGORIES.MILESTONES]: Flame,
  [BADGE_CATEGORIES.SPECIAL]: Star
};

export default function TrophyRoomPage() {
  const { user } = useAuth();
  const { unlockedBadges, getUserProgress } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { unlockedCount, totalBadges, progressPercentage } = getUserProgress();
  const unlockedBadgeIds = unlockedBadges.map(badge => badge.id);

  const filteredBadges = BADGES.filter(badge => {
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesRarity && matchesSearch;
  });

  const unlockedFiltered = filteredBadges.filter(badge => unlockedBadgeIds.includes(badge.id));
  const lockedFiltered = filteredBadges.filter(badge => !unlockedBadgeIds.includes(badge.id));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your achievements</h1>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 my-6 sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-colors hover:opacity-80"
              style={{color: CATEGORY_COLORS[BADGE_CATEGORIES.CONSISTENCY]}}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Focus
            </Link>
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" style={{color: CATEGORY_COLORS[BADGE_CATEGORIES.GOALS]}} />
              <h1 className="text-3xl font-bold" style={{color: CATEGORY_COLORS[BADGE_CATEGORIES.FOCUS]}}>
                Trophy Room
              </h1>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold" style={{color: CATEGORY_COLORS[BADGE_CATEGORIES.FOCUS]}}>
                Your Progress
              </h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-700">{unlockedCount}/{totalBadges}</p>
              <p className="text-sm text-green-600">Badges Unlocked</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{width: `${progressPercentage}%`}}
            />
          </div>
          <p className="text-sm text-green-600">{progressPercentage.toFixed(1)}% Complete</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search badges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                <option value={BADGE_CATEGORIES.FOCUS}>Focus</option>
                <option value={BADGE_CATEGORIES.CONSISTENCY}>Consistency</option>
                <option value={BADGE_CATEGORIES.GOALS}>Goals</option>
                <option value={BADGE_CATEGORIES.MILESTONES}>Milestones</option>
                <option value={BADGE_CATEGORIES.SPECIAL}>Special</option>
              </select>
            </div>

            {/* Rarity Filter */}
            <div className="min-w-40">
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Rarities</option>
                <option value={BADGE_RARITY.COMMON}>Common</option>
                <option value={BADGE_RARITY.RARE}>Rare</option>
                <option value={BADGE_RARITY.EPIC}>Epic</option>
                <option value={BADGE_RARITY.LEGENDARY}>Legendary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Unlocked Badges */}
        {unlockedFiltered.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-6" style={{color: CATEGORY_COLORS[BADGE_CATEGORIES.FOCUS]}}>
              Unlocked Badges ({unlockedFiltered.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {unlockedFiltered.map(badge => {
                const CategoryIcon = CATEGORY_ICONS[badge.category];
                const colors = RARITY_COLORS[badge.rarity];

                return (
                  <div
                    key={badge.id}
                    className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 ${colors.glow}`}
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CategoryIcon className="w-4 h-4" style={{color: CATEGORY_COLORS[badge.category]}} />
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.text} bg-white bg-opacity-50`}>
                          {badge.rarity.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <h3 className={`font-bold text-lg mb-2 text-center ${colors.text}`}>
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-3">
                      {badge.description}
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      {badge.requirement}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedFiltered.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6" style={{color: CATEGORY_COLORS[BADGE_CATEGORIES.SPECIAL]}}>
              Locked Badges ({lockedFiltered.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lockedFiltered.map(badge => {
                const CategoryIcon = CATEGORY_ICONS[badge.category];

                return (
                  <div
                    key={badge.id}
                    className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6 opacity-60 hover:opacity-80 transition-opacity duration-300"
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3 filter grayscale">🔒</div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CategoryIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full text-gray-500 bg-white bg-opacity-50">
                          {badge.rarity.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2 text-center text-gray-600">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-3">
                      {badge.description}
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      {badge.requirement}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No badges found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
}