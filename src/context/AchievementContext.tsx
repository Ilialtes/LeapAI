"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BADGES } from '@/data/badges';

interface UserData {
  totalFocusSessions: number;
  totalFocusTime: number;
  longestSession: number;
  currentStreak: number;
  totalGoals: number;
  completedGoals: number;
  hasEarlyMorningSession: boolean;
  hasLateNightSession: boolean;
  hasEarlyCompletion: boolean;
  hasWeekendStreak: boolean;
  hasComeback: boolean;
  uniqueTimeSlots: number;
  userNumber: number;
}

interface UnlockedBadge {
  id: string;
  unlockedAt: string;
  isNew: boolean;
}

interface AchievementContextType {
  unlockedBadges: UnlockedBadge[];
  newBadges: UnlockedBadge[];
  userData: UserData;
  checkForNewAchievements: (newUserData: Partial<UserData>) => void;
  markBadgesAsViewed: (badgeIds: string[]) => void;
  updateUserData: (data: Partial<UserData>) => void;
  getBadgeById: (id: string) => typeof BADGES[number] | undefined;
  getUnlockedBadgesByCategory: (category: string) => typeof BADGES[number][];
  getTotalBadgesByRarity: (rarity: string) => number;
  getUserProgress: () => {
    totalBadges: number;
    unlockedCount: number;
    progressPercentage: number;
  };
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const DEFAULT_USER_DATA: UserData = {
  totalFocusSessions: 0,
  totalFocusTime: 0,
  longestSession: 0,
  currentStreak: 0,
  totalGoals: 0,
  completedGoals: 0,
  hasEarlyMorningSession: false,
  hasLateNightSession: false,
  hasEarlyCompletion: false,
  hasWeekendStreak: false,
  hasComeback: false,
  uniqueTimeSlots: 0,
  userNumber: 999
};

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);
  const [newBadges, setNewBadges] = useState<UnlockedBadge[]>([]);
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);

  useEffect(() => {
    const savedBadges = localStorage.getItem('leap-ai-unlocked-badges');
    const savedUserData = localStorage.getItem('leap-ai-user-data');

    if (savedBadges) {
      try {
        setUnlockedBadges(JSON.parse(savedBadges));
      } catch (error) {
        console.error('Error parsing saved badges:', error);
      }
    }

    if (savedUserData) {
      try {
        setUserData(JSON.parse(savedUserData));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
  }, []);

  const saveBadges = (badges: UnlockedBadge[]) => {
    localStorage.setItem('leap-ai-unlocked-badges', JSON.stringify(badges));
  };

  const saveUserData = (data: UserData) => {
    localStorage.setItem('leap-ai-user-data', JSON.stringify(data));
  };

  const getBadgeById = (id: string) => {
    return BADGES.find(badge => badge.id === id);
  };

  const checkForNewAchievements = (newUserData: Partial<UserData>) => {
    const updatedUserData = { ...userData, ...newUserData };
    setUserData(updatedUserData);
    saveUserData(updatedUserData);

    const currentUnlockedIds = unlockedBadges.map(badge => badge.id);
    const newlyUnlocked: UnlockedBadge[] = [];

    BADGES.forEach(badge => {
      if (!currentUnlockedIds.includes(badge.id) && badge.checkCondition(updatedUserData)) {
        const unlockedBadge: UnlockedBadge = {
          id: badge.id,
          unlockedAt: new Date().toISOString(),
          isNew: true
        };
        newlyUnlocked.push(unlockedBadge);
      }
    });

    if (newlyUnlocked.length > 0) {
      const updatedBadges = [...unlockedBadges, ...newlyUnlocked];
      setUnlockedBadges(updatedBadges);
      setNewBadges(prev => [...prev, ...newlyUnlocked]);
      saveBadges(updatedBadges);
    }
  };

  const markBadgesAsViewed = (badgeIds: string[]) => {
    const updatedBadges = unlockedBadges.map(badge => ({
      ...badge,
      isNew: badgeIds.includes(badge.id) ? false : badge.isNew
    }));

    setUnlockedBadges(updatedBadges);
    setNewBadges(prev => prev.filter(badge => !badgeIds.includes(badge.id)));
    saveBadges(updatedBadges);
  };

  const updateUserData = (data: Partial<UserData>) => {
    const updatedData = { ...userData, ...data };
    setUserData(updatedData);
    saveUserData(updatedData);
  };

  const getUnlockedBadgesByCategory = (category: string) => {
    const unlockedIds = unlockedBadges.map(badge => badge.id);
    return BADGES.filter(badge =>
      badge.category === category && unlockedIds.includes(badge.id)
    );
  };

  const getTotalBadgesByRarity = (rarity: string) => {
    const unlockedIds = unlockedBadges.map(badge => badge.id);
    return BADGES.filter(badge =>
      badge.rarity === rarity && unlockedIds.includes(badge.id)
    ).length;
  };

  const getUserProgress = () => {
    const totalBadges = BADGES.length;
    const unlockedCount = unlockedBadges.length;
    const progressPercentage = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0;

    return {
      totalBadges,
      unlockedCount,
      progressPercentage
    };
  };

  const value: AchievementContextType = {
    unlockedBadges,
    newBadges,
    userData,
    checkForNewAchievements,
    markBadgesAsViewed,
    updateUserData,
    getBadgeById,
    getUnlockedBadgesByCategory,
    getTotalBadgesByRarity,
    getUserProgress
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}