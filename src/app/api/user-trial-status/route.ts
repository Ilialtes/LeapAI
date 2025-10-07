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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Fetch user subscription data from Firestore
    const userDoc = await db.collection('users').doc(email).get();

    if (!userDoc.exists) {
      // New user - create default trial
      const trialStartDate = new Date();
      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      await db.collection('users').doc(email).set({
        email,
        trialStartedAt: trialStartDate.toISOString(),
        trialEndsAt: trialEndDate.toISOString(),
        subscriptionStatus: 'trial',
        createdAt: trialStartDate.toISOString()
      });

      return NextResponse.json({
        success: true,
        trialActive: true,
        daysRemaining: 7,
        trialEndsAt: trialEndDate.toISOString(),
        subscriptionStatus: 'trial'
      });
    }

    const userData = userDoc.data();
    const now = new Date();

    // Check if user has an active subscription
    if (userData?.subscriptionStatus === 'active') {
      return NextResponse.json({
        success: true,
        trialActive: false,
        subscriptionStatus: 'active',
        plan: userData.plan || 'monthly',
        subscriptionEndsAt: userData.subscriptionEndsAt
      });
    }

    // Check trial status
    if (userData?.trialEndsAt) {
      const trialEndDate = new Date(userData.trialEndsAt);
      const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining > 0) {
        return NextResponse.json({
          success: true,
          trialActive: true,
          daysRemaining,
          trialEndsAt: userData.trialEndsAt,
          subscriptionStatus: 'trial'
        });
      } else {
        // Trial expired
        return NextResponse.json({
          success: true,
          trialActive: false,
          trialExpired: true,
          subscriptionStatus: 'expired',
          daysRemaining: 0
        });
      }
    }

    // No trial or subscription info
    return NextResponse.json({
      success: true,
      trialActive: false,
      subscriptionStatus: 'none',
      daysRemaining: 0
    });

  } catch (error) {
    console.error('Error fetching trial status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trial status' },
      { status: 500 }
    );
  }
}
