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
  milestones: Milestone[];
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityDate?: Date;
  activityCount?: number;
  isTopGoal?: boolean;
}

interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, dueDate, userEmail } = await request.json();
    
    if (!title || !category || !dueDate || !userEmail) {
      return NextResponse.json(
        { error: 'Title, category, due date, and user email are required' },
        { status: 400 }
      );
    }

    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newGoal: Goal = {
      id: goalId,
      title,
      description: description || '',
      category,
      dueDate,
      progress: 0,
      milestones: [],
      userEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection("goals").doc(goalId).set(newGoal);

    return NextResponse.json({ 
      goal: newGoal,
      success: true 
    });
    
  } catch (error) {
    console.error('Create goal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    console.log('GET goals request for user:', userEmail);
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('Querying Firestore for goals...');
    
    // Remove orderBy to avoid index issues for now
    const goalsSnapshot = await db.collection("goals")
      .where("userEmail", "==", userEmail)
      .get();
    
    console.log('Goals snapshot size:', goalsSnapshot.size);
    
    const goals = goalsSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Goal data:', data);
      
      // Convert Firestore timestamps to ISO strings
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as Goal;
    });

    console.log('Returning goals:', goals.length);

    return NextResponse.json({ 
      goals,
      success: true 
    });
    
  } catch (error) {
    console.error('Get goals API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');
    const userEmail = searchParams.get('userEmail');
    
    console.log('DELETE goal request:', { goalId, userEmail });
    
    if (!goalId || !userEmail) {
      return NextResponse.json(
        { error: 'Goal ID and user email are required' },
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
        { error: 'Unauthorized to delete this goal' },
        { status: 403 }
      );
    }

    // Delete the goal
    await db.collection("goals").doc(goalId).delete();

    console.log('Goal deleted successfully:', goalId);

    return NextResponse.json({ 
      message: 'Goal deleted successfully',
      success: true 
    });
    
  } catch (error) {
    console.error('Delete goal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}