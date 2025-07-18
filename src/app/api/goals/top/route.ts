import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://leapai-15129-default-rtdb.firebaseio.com"
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
}

const db = getFirestore();

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string;
  progress: number;
  milestones: any[];
  userEmail: string;
  createdAt: any;
  updatedAt: any;
  lastActivityDate?: any;
  activityCount?: number;
  currentStreak?: number;
  lastCheckinDate?: string;
  checkinHistory?: any[];
}

// Algorithm to calculate goal priority score
const calculateGoalPriority = (goal: Goal): number => {
  let score = 0;
  const today = new Date();
  
  // 1. Recent activity score (0-30 points)
  if (goal.updatedAt?.toDate) {
    const daysSinceUpdate = Math.floor((today.getTime() - goal.updatedAt.toDate().getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate <= 1) score += 30;
    else if (daysSinceUpdate <= 3) score += 20;
    else if (daysSinceUpdate <= 7) score += 15;
    else if (daysSinceUpdate <= 14) score += 10;
  }
  
  // 2. Daily streak bonus (0-35 points) - NEW! This is the key factor
  const currentStreak = goal.currentStreak || 0;
  if (currentStreak >= 7) score += 35; // Week streak - massive boost
  else if (currentStreak >= 5) score += 30; // 5 days - big boost
  else if (currentStreak >= 3) score += 25; // 3 days - good boost
  else if (currentStreak >= 2) score += 15; // 2 days - some boost
  else if (currentStreak >= 1) score += 10; // 1 day - small boost
  
  // 3. Progress momentum (0-20 points)
  const progress = goal.progress || 0;
  if (progress >= 80) score += 20;
  else if (progress >= 60) score += 15;
  else if (progress >= 40) score += 12;
  else if (progress >= 20) score += 8;
  else if (progress > 0) score += 5;
  
  // 4. Due date urgency (0-15 points)
  const dueDate = new Date(goal.dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue <= 3 && daysUntilDue > 0) score += 15;
  else if (daysUntilDue <= 7 && daysUntilDue > 0) score += 12;
  else if (daysUntilDue <= 14 && daysUntilDue > 0) score += 10;
  else if (daysUntilDue <= 30 && daysUntilDue > 0) score += 5;
  else if (daysUntilDue < 0) score -= 10; // Penalty for overdue
  
  return score;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const limit = parseInt(searchParams.get('limit') || '3');
    
    console.log('GET top goals request for user:', userEmail);
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('Querying Firestore for goals...');
    
    const goalsSnapshot = await db.collection("goals")
      .where("userEmail", "==", userEmail)
      .get();
    
    console.log('Goals snapshot size:', goalsSnapshot.size);
    
    const goals = goalsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to ISO strings
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        lastActivityDate: data.lastActivityDate?.toDate ? data.lastActivityDate.toDate().toISOString() : data.lastActivityDate,
      } as Goal;
    });

    // Calculate priority scores and sort
    const goalsWithScores = goals.map(goal => ({
      ...goal,
      priorityScore: calculateGoalPriority(goal)
    }));

    // Sort by priority score (highest first) and take top goals
    const topGoals = goalsWithScores
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);

    console.log('Returning top goals:', topGoals.length);

    return NextResponse.json({ 
      goals: topGoals,
      success: true 
    });
    
  } catch (error) {
    console.error('Get top goals API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}