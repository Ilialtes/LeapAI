import { NextRequest, NextResponse } from 'next/server';
import { handleUserRequest } from '@/services/mcpAssistant';

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/movie-suggestion called");
    
    const { email } = await request.json();
    console.log("Email received:", email);
    
    if (!email) {
      console.log("Email is missing");
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log("Calling handleUserRequest...");
    const movieSuggestion = await handleUserRequest({ email });
    console.log("Movie suggestion result:", movieSuggestion);
    
    return NextResponse.json({ 
      suggestion: movieSuggestion,
      success: true 
    });
    
  } catch (error) {
    console.error('Movie suggestion API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}