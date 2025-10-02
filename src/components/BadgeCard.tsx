"use client";

import React from 'react';
import { RARITY_COLORS, CATEGORY_COLORS, BADGE_CATEGORIES } from '@/data/badges';
import { Target, Calendar, Award, Flame, Star } from 'lucide-react';

const CATEGORY_ICONS = {
  [BADGE_CATEGORIES.FOCUS]: Target,
  [BADGE_CATEGORIES.CONSISTENCY]: Calendar,
  [BADGE_CATEGORIES.GOALS]: Award,
  [BADGE_CATEGORIES.MILESTONES]: Flame,
  [BADGE_CATEGORIES.SPECIAL]: Star
};

interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
    requirement: string;
  };
  isUnlocked: boolean;
  isNew?: boolean;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function BadgeCard({
  badge,
  isUnlocked,
  isNew = false,
  size = 'medium',
  showDetails = true,
  onClick,
  className = ''
}: BadgeCardProps) {
  const CategoryIcon = CATEGORY_ICONS[badge.category];
  const colors = RARITY_COLORS[badge.rarity];

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4 md:p-6',
    large: 'p-6 md:p-8'
  };

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl md:text-4xl',
    large: 'text-4xl md:text-5xl'
  };

  const titleSizes = {
    small: 'text-sm',
    medium: 'text-base md:text-lg',
    large: 'text-lg md:text-xl'
  };

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${isUnlocked
          ? `${colors.bg} ${colors.border} hover:shadow-lg hover:scale-105 ${colors.glow}`
          : 'bg-gray-100 border-gray-300 opacity-60 hover:opacity-80'
        }
        ${sizeClasses[size]}
        ${isNew ? 'animate-pulse ring-4 ring-yellow-300' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* New Badge Indicator */}
      {isNew && isUnlocked && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
          NEW!
        </div>
      )}

      {/* Badge Content */}
      <div className="text-center">
        {/* Icon */}
        <div className={`${iconSizes[size]} mb-2 md:mb-3`}>
          {isUnlocked ? badge.icon : '🔒'}
        </div>

        {/* Category and Rarity */}
        {showDetails && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <CategoryIcon
              className="w-3 h-3 md:w-4 md:h-4"
              style={{
                color: isUnlocked ? CATEGORY_COLORS[badge.category] : '#9CA3AF'
              }}
            />
            <span
              className={`
                text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50
                ${isUnlocked ? colors.text : 'text-gray-500'}
              `}
            >
              {badge.rarity.toUpperCase()}
            </span>
          </div>
        )}

        {/* Name */}
        <h3
          className={`
            font-bold mb-1 md:mb-2 text-center
            ${titleSizes[size]}
            ${isUnlocked ? colors.text : 'text-gray-600'}
          `}
        >
          {badge.name}
        </h3>

        {/* Description */}
        {showDetails && (
          <>
            <p
              className={`
                text-xs md:text-sm text-center mb-2 md:mb-3
                ${isUnlocked ? 'text-gray-600' : 'text-gray-500'}
              `}
            >
              {badge.description}
            </p>

            {/* Requirement */}
            <p
              className={`
                text-xs text-center
                ${isUnlocked ? 'text-gray-500' : 'text-gray-400'}
              `}
            >
              {badge.requirement}
            </p>
          </>
        )}
      </div>

      {/* Unlock Animation Overlay */}
      {isNew && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-200 opacity-20 rounded-xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-2xl animate-spin">✨</div>
          </div>
        </div>
      )}
    </div>
  );
}