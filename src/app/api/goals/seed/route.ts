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

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const sampleGoals = [
      {
        id: `goal_expired_1_${Date.now()}`,
        title: "Complete annual fitness challenge",
        description: "Run 1000 miles in 2024",
        category: "Health",
        dueDate: "2024-12-31",
        progress: 75,
        milestones: [],
        userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `goal_expired_2_${Date.now() + 1}`,
        title: "Learn Python programming",
        description: "Master Python for data science",
        category: "Career",
        dueDate: "2024-11-15",
        progress: 40,
        milestones: [],
        userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `goal_warning_1_${Date.now() + 2}`,
        title: "Finish React project",
        description: "Complete the e-commerce website",
        category: "Career",
        dueDate: "2025-01-25",
        progress: 60,
        milestones: [],
        userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `goal_warning_2_${Date.now() + 3}`,
        title: "Plan vacation trip",
        description: "Organize summer vacation to Europe",
        category: "Personal",
        dueDate: "2025-01-30",
        progress: 25,
        milestones: [],
        userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `goal_active_1_${Date.now() + 4}`,
        title: "Build investment portfolio",
        description: "Diversify investments across stocks and bonds",
        category: "Financial",
        dueDate: "2025-06-15",
        progress: 30,
        milestones: [],
        userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `goal_completed_1_${Date.now() + 5}`,
        title: "Complete online course",
        description: "Finish the full-stack web development course",
        category: "Education",
        dueDate: "2025-03-01",
        progress: 100,
        milestones: [],
        userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add all sample goals to Firestore
    const batch = db.batch();
    
    sampleGoals.forEach(goal => {
      const goalRef = db.collection("goals").doc(goal.id);
      batch.set(goalRef, goal);
    });

    await batch.commit();

    return NextResponse.json({ 
      message: `Added ${sampleGoals.length} sample goals successfully`,
      success: true 
    });
    
  } catch (error) {
    console.error('Seed goals API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}