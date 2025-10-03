import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/services/mcpAssistant';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface OnRampSuggestion {
  id: string;
  type: 'warmup' | 'direct' | 'mindset' | 'physical' | 'social' | 'environmental';
  action: string;
  coachingTip: string;
  duration?: number; // in minutes
  metadata?: {
    timerPreset?: number;
    taskDescription?: string;
    requiresModal?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { goal, email } = await request.json();

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // Fetch user profile for deep personalization
    let userContext = '';
    if (email) {
      try {
        const userProfile = await getUserProfile({ email });
        if (userProfile) {
          const contextParts = [];

          if (userProfile.age) {
            contextParts.push(`Age: ${userProfile.age}`);
          }
          if (userProfile.adhd?.diagnosed) {
            contextParts.push('Has ADHD');
            if (userProfile.adhd.copingStrategies && userProfile.adhd.copingStrategies.length > 0) {
              contextParts.push(`Coping mechanisms: ${userProfile.adhd.copingStrategies.join(', ')}`);
            }
          }
          if (userProfile.motivationBlockers && userProfile.motivationBlockers.length > 0) {
            contextParts.push(`Motivation blockers: ${userProfile.motivationBlockers.join(', ')}`);
          }
          if (userProfile.fears && userProfile.fears.length > 0) {
            contextParts.push(`Fears: ${userProfile.fears.join(', ')}`);
          }
          if (userProfile.personalityTraits && userProfile.personalityTraits.length > 0) {
            contextParts.push(`Personality: ${userProfile.personalityTraits.join(', ')}`);
          }
          if (userProfile.energyLevels) {
            const energyInfo = `Energy levels - Morning: ${userProfile.energyLevels.morning}, Afternoon: ${userProfile.energyLevels.afternoon}, Evening: ${userProfile.energyLevels.evening}`;
            contextParts.push(energyInfo);
          }
          if (userProfile.preferredWorkingTimes && userProfile.preferredWorkingTimes.length > 0) {
            contextParts.push(`Preferred working times: ${userProfile.preferredWorkingTimes.join(', ')}`);
          }

          if (contextParts.length > 0) {
            userContext = `\n\nUser Profile:\n${contextParts.join('\n')}`;
          }
        }
      } catch (error) {
        console.log('Could not fetch user profile, continuing without personalization:', error);
      }
    }

    const prompt = `The user's goal is: "${goal}"${userContext}

You are a compassionate AI coach specializing in helping neurodivergent people overcome task initiation barriers.

Your job is to generate 5 personalized "on-ramp" suggestions - preparatory actions that help the user get into the right mental, emotional, and physical state to begin their main task.

Each on-ramp should be:
1. Directly personalized to their profile (use their coping mechanisms, avoid their blockers, match their energy patterns)
2. Small and achievable (5-30 minutes max)
3. Varied in type: warmup, direct action, mindset reset, physical movement, social connection, or environmental setup
4. Include both the ACTION and a COACHING TIP (the "why" that teaches them about their own productivity)

Return a JSON array with exactly 5 objects, each with this structure:
{
  "type": "warmup" | "direct" | "mindset" | "physical" | "social" | "environmental",
  "action": "Clear, actionable instruction with time-box",
  "coachingTip": "Brief explanation of the psychological benefit",
  "duration": 15, // estimated minutes
  "metadata": {
    "timerPreset": 30, // optional: if this should set a timer
    "taskDescription": "Brief task", // optional: for direct actions
    "requiresModal": true // optional: if this needs a journaling modal
  }
}

IMPORTANT: Return ONLY the JSON array, no other text.`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert AI coach specializing in neurodivergent productivity. You understand ADHD, executive dysfunction, and compassionate coaching. Always return valid JSON arrays."
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    // Parse the JSON array from AI response
    let suggestions: OnRampSuggestion[];
    try {
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const rawSuggestions = JSON.parse(cleanedResponse);

      if (!Array.isArray(rawSuggestions)) {
        throw new Error('Response is not an array');
      }

      // Add unique IDs and validate
      suggestions = rawSuggestions.map((suggestion, index) => ({
        id: `onramp-${Date.now()}-${index}`,
        ...suggestion
      }));

    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);

      // Fallback suggestions
      suggestions = [
        {
          id: 'onramp-fallback-1',
          type: 'physical',
          action: 'Take a 5-minute walk or stretch to reset your body and mind',
          coachingTip: 'Physical movement increases dopamine and helps with task initiation',
          duration: 5
        },
        {
          id: 'onramp-fallback-2',
          type: 'direct',
          action: 'Set a timer for 15 minutes and work on just one small piece',
          coachingTip: 'Short time-boxes reduce overwhelm and make starting feel possible',
          duration: 15,
          metadata: { timerPreset: 15, taskDescription: 'Work on one small piece' }
        },
        {
          id: 'onramp-fallback-3',
          type: 'mindset',
          action: 'Write 3 sentences about why this goal matters to you',
          coachingTip: 'Connecting to your "why" strengthens intrinsic motivation',
          duration: 5,
          metadata: { requiresModal: true }
        },
        {
          id: 'onramp-fallback-4',
          type: 'environmental',
          action: 'Clear your workspace and gather everything you need for this task',
          coachingTip: 'Reducing environmental friction makes it easier to stay focused',
          duration: 10
        },
        {
          id: 'onramp-fallback-5',
          type: 'warmup',
          action: 'Spend 10 minutes reviewing what you accomplished yesterday',
          coachingTip: 'Building on past success creates momentum and confidence',
          duration: 10
        }
      ];
    }

    return NextResponse.json({
      suggestions,
      goal,
      success: true
    });

  } catch (error) {
    console.error('On-ramp suggestions API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
