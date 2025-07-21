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
    const { userEmail, input, conversation, requestType } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Fetch user's goals for context
    const goalsSnapshot = await db.collection("goals")
      .where("userEmail", "==", userEmail)
      .get();
    
    const goals = goalsSnapshot.docs.map(doc => doc.data());
    
    // Analyze goals for coaching context
    const goalsSummary = goals.map(goal => ({
      title: goal.title,
      category: goal.category,
      progress: goal.progress,
      dueDate: goal.dueDate,
      currentStreak: goal.currentStreak || 0,
      checkinCount: goal.checkinHistory?.length || 0
    }));

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (requestType === 'random') {
      systemPrompt = `You are an AI Goal Coach specializing in personal development and achievement. You provide personalized, actionable coaching based on the user's goals and progress.

Your coaching should be:
- Encouraging and motivational
- Specific and actionable
- Based on proven goal-setting methodologies
- Tailored to the user's current situation

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown formatting.

Example response format:
{"suggestion": "Your advice here", "type": "motivation", "category": "Encouragement"}

Fields:
- suggestion: Your coaching advice (2-3 sentences)
- type: One of "motivation", "strategy", "tips", "reflection"
- category: A brief category like "Progress Review", "Time Management", etc.`;

      userPrompt = `Provide coaching advice for a user with these goals:
${JSON.stringify(goalsSummary, null, 2)}

Give me a random piece of coaching advice that would be helpful based on their current goals and progress.`;
    } else {
      systemPrompt = `You are an AI Goal Coach specializing in personal development and achievement. You have access to the user's current goals and can provide personalized coaching advice.

The user has these goals:
${JSON.stringify(goalsSummary, null, 2)}

Provide helpful, specific, and actionable coaching advice. Be encouraging while being practical.

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown formatting.

Example response format:
{"suggestion": "Your advice here", "type": "motivation", "category": "Encouragement"}

Fields:
- suggestion: Your coaching response (2-4 sentences)
- type: One of "motivation", "strategy", "tips", "reflection" 
- category: A brief category describing the advice`;

      userPrompt = input;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversation || []),
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const coachingText = data.choices[0]?.message?.content;

    if (!coachingText) {
      throw new Error('No coaching response generated');
    }

    try {
      const coachingResponse = JSON.parse(coachingText);
      return NextResponse.json(coachingResponse);
    } catch (parseError) {
      // Try to extract data from markdown-formatted text
      const extractFromMarkdown = (text: string) => {
        const suggestionMatch = text.match(/\*\*suggestion\*\*:\s*(.+?)(?=\s*\*\*type\*\*:|$)/s);
        const typeMatch = text.match(/\*\*type\*\*:\s*(\w+)/);
        const categoryMatch = text.match(/\*\*category\*\*:\s*(.+?)(?=\s*\*\*|$)/);
        
        return {
          suggestion: suggestionMatch ? suggestionMatch[1].trim() : text,
          type: typeMatch ? typeMatch[1].trim() : 'tips',
          category: categoryMatch ? categoryMatch[1].trim() : 'General Advice'
        };
      };
      
      const extractedData = extractFromMarkdown(coachingText);
      return NextResponse.json(extractedData);
    }

  } catch (error) {
    console.error('Goal coaching API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching advice' },
      { status: 500 }
    );
  }
}