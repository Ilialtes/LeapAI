// Timestamp type will be imported from Firebase, so we can use a placeholder or a more generic type for now.
// For frontend (firebase/firestore): import { Timestamp } from 'firebase/firestore';
// For backend (firebase-admin/firestore): import { Timestamp } from 'firebase-admin/firestore';

// A generic placeholder, assuming Timestamp will be handled appropriately where used.
type Timestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp;
}

export interface Goal {
  goalId: string; // Document ID
  userId: string; // Foreign key to User
  title: string;
  description?: string;
  targetDate?: Timestamp;
  progress: number; // Percentage 0-100
  isAchieved: boolean;
  createdAt: Timestamp;
  lastCheckinDate?: Timestamp;
}

export interface DailyCheckin {
  checkinId: string; // Document ID
  userId: string; // Foreign key to User
  goalId: string; // Foreign key to Goal
  date: Timestamp;
  mood: 'great' | 'good' | 'okay' | 'bad';
  notes?: string;
  aiGeneratedFeedback?: string;
  createdAt: Timestamp; // It's good practice to have a createdAt for check-ins too
}
