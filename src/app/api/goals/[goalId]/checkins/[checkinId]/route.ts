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

interface DeleteCheckinProps {
  params: Promise<{ goalId: string; checkinId: string }>;
}

export async function DELETE(request: NextRequest, { params }: DeleteCheckinProps) {
  try {
    const { goalId, checkinId } = await params;
    const { userEmail } = await request.json();
    
    console.log('Deleting check-in:', { goalId, checkinId, userEmail });
    
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

    // Get current check-ins and milestones
    const currentCheckins = goalData.checkinHistory || [];
    const currentMilestones = goalData.milestones || [];
    
    // Find and remove the check-in and corresponding milestone
    const updatedCheckins = currentCheckins.filter((checkin: { id: string }) => checkin.id !== checkinId);
    
    // Find the milestone that corresponds to this check-in
    // When check-ins are created, they create milestones with similar IDs and text
    const checkinToDelete = currentCheckins.find((checkin: { id: string }) => checkin.id === checkinId);
    let updatedMilestones = currentMilestones;
    
    if (checkinToDelete) {
      // Try to find milestone by matching text and similar creation time
      updatedMilestones = currentMilestones.filter((milestone: { text: string; createdAt?: Date; timestamp?: Date }) => {
        // Check if milestone text matches checkin text and was created around the same time
        if (milestone.text === (checkinToDelete as { text: string }).text) {
          // If we can extract timestamps, check if they're close (within a few seconds)
          try {
            const milestoneTime = new Date(milestone.createdAt || milestone.timestamp || '');
            const checkinTime = new Date((checkinToDelete as { timestamp?: Date; date?: string }).timestamp || (checkinToDelete as { date: string }).date);
            const timeDiff = Math.abs(milestoneTime.getTime() - checkinTime.getTime());
            return timeDiff > 10000; // Keep milestones that are more than 10 seconds apart
          } catch {
            // If we can't parse dates, just compare text
            return false; // Remove milestones with matching text
          }
        }
        return true; // Keep milestone
      });
    }
    
    if (updatedCheckins.length === currentCheckins.length) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }

    // Recalculate streak based on remaining check-ins
    let newStreak = 0;
    let lastCheckinDate = null;
    
    if (updatedCheckins.length > 0) {
      // Sort check-ins by date (most recent first) and group by date
      // First filter out any checkins with invalid dates
      const validCheckins = updatedCheckins.filter((checkin: any) => {
        try {
          const dateValue = checkin.timestamp || checkin.date;
          if (!dateValue) return false;
          const testDate = new Date(dateValue);
          return !isNaN(testDate.getTime());
        } catch {
          return false;
        }
      });
      
      const sortedCheckins = validCheckins.sort((a: any, b: any) => {
        try {
          const dateA = new Date(a.timestamp || a.date);
          const dateB = new Date(b.timestamp || b.date);
          return dateB.getTime() - dateA.getTime();
        } catch {
          return 0;
        }
      });
      
      // Group check-ins by date to handle multiple check-ins per day
      const checkinsByDate = new Map();
      for (const checkin of sortedCheckins) {
        let dateStr;
        try {
          // Try to parse timestamp first, then date, then use raw date if it's already a string
          const dateValue = checkin.timestamp || checkin.date;
          if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Already in YYYY-MM-DD format
            dateStr = dateValue;
          } else {
            // Try to parse as Date
            const parsedDate = new Date(dateValue);
            if (isNaN(parsedDate.getTime())) {
              console.warn('Invalid date found in checkin:', checkin);
              continue; // Skip this checkin if date is invalid
            }
            dateStr = parsedDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Error parsing date for checkin:', checkin, error);
          continue; // Skip this checkin if date parsing fails
        }
        
        if (!checkinsByDate.has(dateStr)) {
          checkinsByDate.set(dateStr, checkin);
        }
      }
      
      // Convert to array and sort by date (most recent first)
      const uniqueDateCheckins = Array.from(checkinsByDate.entries())
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, checkin]) => ({ ...checkin, date }));
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Start from today and count backwards
      let currentDateStr = todayStr;
      
      for (const checkin of uniqueDateCheckins) {
        if (checkin.date === currentDateStr) {
          newStreak++;
          lastCheckinDate = checkin.date;
          
          // Move to previous day
          const prevDate = new Date(currentDateStr);
          prevDate.setDate(prevDate.getDate() - 1);
          currentDateStr = prevDate.toISOString().split('T')[0];
        } else {
          // Check if this checkin is for the next expected consecutive day
          const expectedDate = new Date(todayStr);
          expectedDate.setDate(expectedDate.getDate() - newStreak);
          const expectedDateStr = expectedDate.toISOString().split('T')[0];
          
          if (checkin.date === expectedDateStr) {
            newStreak++;
            lastCheckinDate = checkin.date;
          } else {
            break; // No longer consecutive
          }
        }
      }
    }

    // Update the goal
    await db.collection("goals").doc(goalId).update({
      checkinHistory: updatedCheckins,
      milestones: updatedMilestones,
      currentStreak: newStreak,
      lastCheckinDate: lastCheckinDate,
      activityCount: Math.max(0, (goalData.activityCount || 1) - 1),
      updatedAt: new Date()
    });

    console.log('Check-in deleted successfully. New streak:', newStreak);

    return NextResponse.json({ 
      message: 'Check-in deleted successfully',
      newStreak: newStreak,
      success: true 
    });
    
  } catch (error) {
    console.error('Delete check-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}