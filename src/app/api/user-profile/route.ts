import { NextRequest, NextResponse } from 'next/server';
import { updateUserAge, getUserProfile } from '@/services/mcpAssistant';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const userProfile = await getUserProfile({ email });
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user: userProfile,
      success: true 
    });
    
  } catch (error) {
    console.error('Get user profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, age } = await request.json();
    
    if (!email || !age) {
      return NextResponse.json(
        { error: 'Email and age are required' },
        { status: 400 }
      );
    }

    const success = await updateUserAge({ email, age });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update user age' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'User age updated successfully',
      success: true 
    });
    
  } catch (error) {
    console.error('Update user age API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}