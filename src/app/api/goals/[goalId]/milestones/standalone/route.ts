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

interface StandaloneMilestoneProps {
  params: Promise<{ goalId: string }>;
}

export async function POST(request: NextRequest, { params }: StandaloneMilestoneProps) {
  try {
    const { goalId } = await params;
    const { text, userEmail } = await request.json();
    
    console.log('Adding standalone milestone to goal:', goalId);
    
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
      completed: false, // Standalone milestones start as incomplete
      createdAt: new Date(),
      isStandalone: true, // Mark as standalone (not from check-in)
    };

    // Get current milestones
    const currentMilestones = goalData.milestones || [];

    // Calculate new automatic progress based on milestones
    const updatedMilestones = [...currentMilestones, newMilestone];
    const completedMilestones = updatedMilestones.filter((m: { completed: boolean }) => m.completed).length;
    const autoProgress = updatedMilestones.length > 0 ? Math.round((completedMilestones / updatedMilestones.length) * 100) : 0;

    // Update the goal with new milestone and auto-calculated progress
    await db.collection("goals").doc(goalId).update({
      milestones: updatedMilestones,
      progress: autoProgress, // Auto-update progress based on completed milestones
      lastProgressUpdate: new Date(),
      updatedAt: new Date()
    });

    console.log('Standalone milestone added successfully');

    return NextResponse.json({ 
      milestone: newMilestone,
      success: true 
    });
    
  } catch (error) {
    console.error('Add standalone milestone API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}