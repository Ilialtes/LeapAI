export const BADGE_CATEGORIES = {
  FOCUS: 'focus',
  CONSISTENCY: 'consistency',
  GOALS: 'goals',
  MILESTONES: 'milestones',
  SPECIAL: 'special'
};

export const BADGE_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

export const BADGES = [
  // FOCUS BADGES
  {
    id: 'first_focus',
    name: 'First Steps',
    description: 'Complete your first focus session',
    icon: '🎯',
    category: BADGE_CATEGORIES.FOCUS,
    rarity: BADGE_RARITY.COMMON,
    requirement: 'Complete 1 focus session',
    checkCondition: (userData) => userData.totalFocusSessions >= 1
  },
  {
    id: 'focused_5',
    name: 'Getting Started',
    description: 'Complete 5 focus sessions',
    icon: '🔥',
    category: BADGE_CATEGORIES.FOCUS,
    rarity: BADGE_RARITY.COMMON,
    requirement: 'Complete 5 focus sessions',
    checkCondition: (userData) => userData.totalFocusSessions >= 5
  },
  {
    id: 'focused_25',
    name: 'Focus Warrior',
    description: 'Complete 25 focus sessions',
    icon: '⚔️',
    category: BADGE_CATEGORIES.FOCUS,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Complete 25 focus sessions',
    checkCondition: (userData) => userData.totalFocusSessions >= 25
  },
  {
    id: 'focused_100',
    name: 'Focus Master',
    description: 'Complete 100 focus sessions',
    icon: '👑',
    category: BADGE_CATEGORIES.FOCUS,
    rarity: BADGE_RARITY.EPIC,
    requirement: 'Complete 100 focus sessions',
    checkCondition: (userData) => userData.totalFocusSessions >= 100
  },
  {
    id: 'marathon_session',
    name: 'Marathon Runner',
    description: 'Complete a 2+ hour focus session',
    icon: '🏃‍♂️',
    category: BADGE_CATEGORIES.FOCUS,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Complete a session longer than 2 hours',
    checkCondition: (userData) => userData.longestSession >= 120
  },
  {
    id: 'deep_focus',
    name: 'Deep Dive',
    description: 'Complete a 4+ hour focus session',
    icon: '🤿',
    category: BADGE_CATEGORIES.FOCUS,
    rarity: BADGE_RARITY.EPIC,
    requirement: 'Complete a session longer than 4 hours',
    checkCondition: (userData) => userData.longestSession >= 240
  },

  // CONSISTENCY BADGES
  {
    id: 'daily_habit',
    name: 'Daily Habit',
    description: 'Focus for 3 consecutive days',
    icon: '📅',
    category: BADGE_CATEGORIES.CONSISTENCY,
    rarity: BADGE_RARITY.COMMON,
    requirement: 'Focus for 3 consecutive days',
    checkCondition: (userData) => userData.currentStreak >= 3
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Focus for 7 consecutive days',
    icon: '🗓️',
    category: BADGE_CATEGORIES.CONSISTENCY,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Focus for 7 consecutive days',
    checkCondition: (userData) => userData.currentStreak >= 7
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Focus for 30 consecutive days',
    icon: '🚀',
    category: BADGE_CATEGORIES.CONSISTENCY,
    rarity: BADGE_RARITY.EPIC,
    requirement: 'Focus for 30 consecutive days',
    checkCondition: (userData) => userData.currentStreak >= 30
  },
  {
    id: 'legendary_streak',
    name: 'Legendary Streak',
    description: 'Focus for 100 consecutive days',
    icon: '⭐',
    category: BADGE_CATEGORIES.CONSISTENCY,
    rarity: BADGE_RARITY.LEGENDARY,
    requirement: 'Focus for 100 consecutive days',
    checkCondition: (userData) => userData.currentStreak >= 100
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Start a focus session before 6 AM',
    icon: '🌅',
    category: BADGE_CATEGORIES.CONSISTENCY,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Start a session before 6 AM',
    checkCondition: (userData) => userData.hasEarlyMorningSession
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Start a focus session after 10 PM',
    icon: '🦉',
    category: BADGE_CATEGORIES.CONSISTENCY,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Start a session after 10 PM',
    checkCondition: (userData) => userData.hasLateNightSession
  },

  // GOALS BADGES
  {
    id: 'goal_setter',
    name: 'Goal Setter',
    description: 'Create your first goal',
    icon: '🎯',
    category: BADGE_CATEGORIES.GOALS,
    rarity: BADGE_RARITY.COMMON,
    requirement: 'Create your first goal',
    checkCondition: (userData) => userData.totalGoals >= 1
  },
  {
    id: 'achiever',
    name: 'Achiever',
    description: 'Complete your first goal',
    icon: '✅',
    category: BADGE_CATEGORIES.GOALS,
    rarity: BADGE_RARITY.COMMON,
    requirement: 'Complete your first goal',
    checkCondition: (userData) => userData.completedGoals >= 1
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Complete 5 goals',
    icon: '💪',
    category: BADGE_CATEGORIES.GOALS,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Complete 5 goals',
    checkCondition: (userData) => userData.completedGoals >= 5
  },
  {
    id: 'overachiever',
    name: 'Overachiever',
    description: 'Complete 10 goals',
    icon: '🏆',
    category: BADGE_CATEGORIES.GOALS,
    rarity: BADGE_RARITY.EPIC,
    requirement: 'Complete 10 goals',
    checkCondition: (userData) => userData.completedGoals >= 10
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a goal before its due date',
    icon: '⭐',
    category: BADGE_CATEGORIES.GOALS,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Complete a goal early',
    checkCondition: (userData) => userData.hasEarlyCompletion
  },

  // MILESTONE BADGES
  {
    id: 'time_tracker',
    name: 'Time Tracker',
    description: 'Accumulate 10 hours of focus time',
    icon: '⏰',
    category: BADGE_CATEGORIES.MILESTONES,
    rarity: BADGE_RARITY.COMMON,
    requirement: 'Accumulate 10 hours of focus time',
    checkCondition: (userData) => userData.totalFocusTime >= 600
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Accumulate 50 hours of focus time',
    icon: '🕐',
    category: BADGE_CATEGORIES.MILESTONES,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Accumulate 50 hours of focus time',
    checkCondition: (userData) => userData.totalFocusTime >= 3000
  },
  {
    id: 'master_of_time',
    name: 'Master of Time',
    description: 'Accumulate 100 hours of focus time',
    icon: '⏳',
    category: BADGE_CATEGORIES.MILESTONES,
    rarity: BADGE_RARITY.EPIC,
    requirement: 'Accumulate 100 hours of focus time',
    checkCondition: (userData) => userData.totalFocusTime >= 6000
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Accumulate 500 hours of focus time',
    icon: '🧘‍♂️',
    category: BADGE_CATEGORIES.MILESTONES,
    rarity: BADGE_RARITY.LEGENDARY,
    requirement: 'Accumulate 500 hours of focus time',
    checkCondition: (userData) => userData.totalFocusTime >= 30000
  },

  // SPECIAL BADGES
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Focus on both Saturday and Sunday',
    icon: '🎮',
    category: BADGE_CATEGORIES.SPECIAL,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Focus on both weekend days',
    checkCondition: (userData) => userData.hasWeekendStreak
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Return to focusing after a 7+ day break',
    icon: '💫',
    category: BADGE_CATEGORIES.SPECIAL,
    rarity: BADGE_RARITY.RARE,
    requirement: 'Return after a week break',
    checkCondition: (userData) => userData.hasComeback
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Try focus sessions at 5 different times of day',
    icon: '🗺️',
    category: BADGE_CATEGORIES.SPECIAL,
    rarity: BADGE_RARITY.EPIC,
    requirement: 'Focus at 5 different times',
    checkCondition: (userData) => userData.uniqueTimeSlots >= 5
  },
  {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'One of the first 100 users of SubtlePush',
    icon: '🏁',
    category: BADGE_CATEGORIES.SPECIAL,
    rarity: BADGE_RARITY.LEGENDARY,
    requirement: 'Be among first 100 users',
    checkCondition: (userData) => userData.userNumber <= 100
  }
];

export const RARITY_COLORS = {
  [BADGE_RARITY.COMMON]: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    glow: 'shadow-gray-200'
  },
  [BADGE_RARITY.RARE]: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    glow: 'shadow-blue-200'
  },
  [BADGE_RARITY.EPIC]: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    glow: 'shadow-purple-200'
  },
  [BADGE_RARITY.LEGENDARY]: {
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    glow: 'shadow-yellow-300'
  }
};

export const CATEGORY_COLORS = {
  [BADGE_CATEGORIES.FOCUS]: '#2E7D32',
  [BADGE_CATEGORIES.CONSISTENCY]: '#1565C0',
  [BADGE_CATEGORIES.GOALS]: '#7B1FA2',
  [BADGE_CATEGORIES.MILESTONES]: '#D84315',
  [BADGE_CATEGORIES.SPECIAL]: '#546E7A'
};