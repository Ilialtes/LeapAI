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

interface MilestoneProps {
  params: Promise<{ goalId: string }>;
}

export async function POST(request: NextRequest, { params }: MilestoneProps) {
  try {
    const { goalId } = await params;
    const { text, userEmail, duration } = await request.json();

    console.log('Adding milestone to goal:', goalId, 'with duration:', duration);

    if (!text || !userEmail) {
      return NextResponse.json(
        { error: 'Text and user email are required' },
        { status: 400 }
      );
    }

    // First verify the goal belongs to the user
    const goalDoc = await db.collection("goals").doc(goalId).get();
    
    if (!goalDoc.exists) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const goalData = goalDoc.data();
    if (goalData?.userEmail !== userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized to update this goal' },
        { status: 403 }
      );
    }

    // Create new milestone
    const newMilestone = {
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      completed: true, // Check-ins are automatically marked as completed
      createdAt: new Date(),
    };

    // Create new check-in history entry
    const newCheckin = {
      id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      timestamp: new Date(),
    };

    // Get current milestones and check-ins
    const currentMilestones = goalData.milestones || [];
    const currentCheckins = goalData.checkinHistory || [];
    
    // Calculate streak - check if user has been updating this goal daily
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's already a check-in today
    const hasCheckinToday = currentCheckins.some((checkin: any) => checkin.date === todayStr);
    
    let streak = goalData.currentStreak || 0;
    let lastCheckinDate = goalData.lastCheckinDate;
    
    if (!hasCheckinToday) {
      // Calculate new streak
      if (lastCheckinDate) {
        const lastDate = new Date(lastCheckinDate);
        const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day - increment streak
          streak += 1;
        } else if (daysDiff > 1) {
          // Gap in days - reset streak
          streak = 1;
        }
        // If daysDiff === 0, user already checked in today (shouldn't happen due to check above)
      } else {
        // First check-in ever
        streak = 1;
      }
      
      lastCheckinDate = todayStr;
    }

    // Extract duration from check-in text if provided
    const focusDuration = duration || 0; // Duration in minutes
    const isFocusSession = text.includes('Focused for');

    // Update stats if this is a focus session
    const totalFocusTime = (goalData.totalFocusTime || 0) + (isFocusSession ? focusDuration : 0);
    const sessionsCompleted = (goalData.sessionsCompleted || 0) + (isFocusSession ? 1 : 0);

    // Update the goal with new milestone, check-in, streak info, and session stats
    await db.collection("goals").doc(goalId).update({
      milestones: [...currentMilestones, newMilestone],
      checkinHistory: [...currentCheckins, newCheckin],
      currentStreak: streak,
      lastCheckinDate: lastCheckinDate,
      lastActivityDate: new Date(),
      activityCount: (goalData.activityCount || 0) + 1,
      totalFocusTime: totalFocusTime,
      sessionsCompleted: sessionsCompleted,
      updatedAt: new Date()
    });

    console.log('Milestone and check-in added successfully. Streak:', streak, 'Sessions:', sessionsCompleted, 'Total time:', totalFocusTime);

    return NextResponse.json({
      milestone: newMilestone,
      checkin: newCheckin,
      streak: streak,
      totalFocusTime: totalFocusTime,
      sessionsCompleted: sessionsCompleted,
      success: true
    });
    
  } catch (error) {
    console.error('Add milestone API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}