import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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
  }
}

const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const achievementDoc = await db
      .collection('achievements')
      .doc(userEmail)
      .get();

    if (!achievementDoc.exists) {
      return NextResponse.json({
        success: true,
        data: {
          unlockedBadges: [],
          userData: {
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
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: achievementDoc.data()
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, unlockedBadges, userData } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const achievementData = {
      unlockedBadges: unlockedBadges || [],
      userData: userData || {},
      updatedAt: new Date().toISOString()
    };

    await db
      .collection('achievements')
      .doc(userEmail)
      .set(achievementData, { merge: true });

    return NextResponse.json({
      success: true,
      data: achievementData
    });
  } catch (error) {
    console.error('Error saving achievements:', error);
    return NextResponse.json(
      { error: 'Failed to save achievements' },
      { status: 500 }
    );
  }
}
