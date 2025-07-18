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

interface ToggleMilestoneProps {
  params: Promise<{ goalId: string; milestoneId: string }>;
}

export async function PUT(request: NextRequest, { params }: ToggleMilestoneProps) {
  try {
    const { goalId, milestoneId } = await params;
    const { userEmail } = await request.json();
    
    console.log('Toggling milestone:', { goalId, milestoneId, userEmail });
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
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

    // Get current milestones
    const currentMilestones = goalData.milestones || [];
    
    // Find and toggle the milestone
    const milestoneIndex = currentMilestones.findIndex((milestone: any) => milestone.id === milestoneId);
    
    if (milestoneIndex === -1) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Toggle the completed status
    const updatedMilestones = [...currentMilestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      completed: !updatedMilestones[milestoneIndex].completed,
      lastModified: new Date()
    };

    // Calculate new automatic progress based on milestones
    const completedMilestones = updatedMilestones.filter((m: { completed: boolean }) => m.completed).length;
    const autoProgress = updatedMilestones.length > 0 ? Math.round((completedMilestones / updatedMilestones.length) * 100) : 0;

    // Update the goal with new milestones and auto-calculated progress
    await db.collection("goals").doc(goalId).update({
      milestones: updatedMilestones,
      progress: autoProgress, // Auto-update progress based on completed milestones
      lastProgressUpdate: new Date(),
      updatedAt: new Date()
    });

    console.log('Milestone toggled successfully:', {
      milestoneId,
      newStatus: updatedMilestones[milestoneIndex].completed
    });

    return NextResponse.json({ 
      milestone: updatedMilestones[milestoneIndex],
      success: true 
    });
    
  } catch (error) {
    console.error('Toggle milestone API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}