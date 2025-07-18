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

interface ProgressProps {
  params: Promise<{ goalId: string }>;
}

export async function PUT(request: NextRequest, { params }: ProgressProps) {
  try {
    const { goalId } = await params;
    const { progress, userEmail } = await request.json();
    
    console.log('Updating progress for goal:', goalId);
    
    if (progress === undefined || progress === null || !userEmail) {
      return NextResponse.json(
        { error: 'Progress value and user email are required' },
        { status: 400 }
      );
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Progress must be between 0 and 100' },
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

    // Update the goal with new progress
    await db.collection("goals").doc(goalId).update({
      progress: progress,
      lastProgressUpdate: new Date(),
      updatedAt: new Date()
    });

    console.log('Progress updated successfully:', progress);

    return NextResponse.json({ 
      progress: progress,
      success: true 
    });
    
  } catch (error) {
    console.error('Update progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}