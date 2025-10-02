"use client";

import React, { useEffect, useState } from 'react';
import { X, Trophy, Sparkles } from 'lucide-react';
import BadgeCard from '@/components/BadgeCard';
import { useAchievements } from '@/context/AchievementContext';

interface AchievementUnlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewTrophyRoom?: () => void;
}

export default function AchievementUnlockedModal({
  isOpen,
  onClose,
  onViewTrophyRoom
}: AchievementUnlockedModalProps) {
  const { newBadges, getBadgeById, markBadgesAsViewed } = useAchievements();
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentNewBadges = newBadges.slice(0, 3); // Show max 3 at once

  useEffect(() => {
    if (isOpen && currentNewBadges.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentNewBadges.length]);

  const handleClose = () => {
    if (currentNewBadges.length > 0) {
      markBadgesAsViewed(currentNewBadges.map(badge => badge.id));
    }
    setCurrentBadgeIndex(0);
    onClose();
  };

  const handleNext = () => {
    if (currentBadgeIndex < currentNewBadges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentBadgeIndex > 0) {
      setCurrentBadgeIndex(currentBadgeIndex - 1);
    }
  };

  const handleViewTrophyRoom = () => {
    if (currentNewBadges.length > 0) {
      markBadgesAsViewed(currentNewBadges.map(badge => badge.id));
    }
    onViewTrophyRoom?.();
    onClose();
  };

  if (!isOpen || currentNewBadges.length === 0) return null;

  const currentBadge = getBadgeById(currentNewBadges[currentBadgeIndex]?.id);

  if (!currentBadge) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-60">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${Math.random() * 20 + 15}px`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-orange-300/20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Achievement Unlocked!</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badge Counter */}
            {currentNewBadges.length > 1 && (
              <div className="flex items-center gap-2 text-yellow-100">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">
                  {currentBadgeIndex + 1} of {currentNewBadges.length} new badges
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Badge Display */}
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <BadgeCard
              badge={currentBadge}
              isUnlocked={true}
              isNew={true}
              size="large"
              showDetails={true}
              className="max-w-xs"
            />
          </div>

          {/* Congratulations Message */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-gray-600">
              You've unlocked the "{currentBadge.name}" badge! Keep up the amazing work.
            </p>
          </div>

          {/* Navigation */}
          {currentNewBadges.length > 1 && (
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handlePrevious}
                disabled={currentBadgeIndex === 0}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {currentNewBadges.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentBadgeIndex ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentBadgeIndex === currentNewBadges.length - 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleViewTrophyRoom}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Trophy Room
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-orange-200 rounded-full opacity-20 animate-pulse animation-delay-1000" />
        </div>
      </div>
    </div>
  );
}