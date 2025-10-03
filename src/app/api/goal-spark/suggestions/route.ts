import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/services/mcpAssistant';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const { userInput, selectedArea, email } = await request.json();

    if (!userInput || !selectedArea) {
      return NextResponse.json(
        { error: 'User input and selected area are required' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // Fetch user profile for personalization
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
              contextParts.push(`Coping strategies: ${userProfile.adhd.copingStrategies.join(', ')}`);
            }
          }
          if (userProfile.motivationBlockers && userProfile.motivationBlockers.length > 0) {
            contextParts.push(`Motivation blockers: ${userProfile.motivationBlockers.join(', ')}`);
          }
          if (userProfile.personalityTraits && userProfile.personalityTraits.length > 0) {
            contextParts.push(`Personality: ${userProfile.personalityTraits.join(', ')}`);
          }
          if (userProfile.energyLevels) {
            const energyInfo = `Energy levels - Morning: ${userProfile.energyLevels.morning}, Afternoon: ${userProfile.energyLevels.afternoon}, Evening: ${userProfile.energyLevels.evening}`;
            contextParts.push(energyInfo);
          }

          if (contextParts.length > 0) {
            userContext = `\n\nUser context:\n${contextParts.join('\n')}`;
          }
        }
      } catch (error) {
        console.log('Could not fetch user profile, continuing without personalization:', error);
      }
    }

    const prompt = `The user said: "${userInput}"

They want to focus on their ${selectedArea.toLowerCase()} life.${userContext}

IMPORTANT: If the user mentioned a specific time duration (e.g., "10 minutes", "20 min", "30m"), you MUST use that exact time in your suggestions. Do NOT default to 5 minutes if they specified a different time.

Generate 5 small, specific, achievable goals that:
1. Are directly related to what they mentioned
2. RESPECT the time duration they mentioned - if they said "10 minutes", make it "10 minutes", NOT "5 minutes"
3. If they didn't mention a time, suggest 5-15 minute sessions
4. Feel manageable and non-overwhelming
5. Are actionable and concrete
6. Are compassionate and neurodivergent-friendly
${userContext ? '7. Are personalized based on their profile (age, ADHD considerations, motivation blockers, energy levels, etc.)' : ''}

Focus area: ${selectedArea}

Return ONLY a JSON array of 5 goal strings, nothing else. Example format:
["Goal 1", "Goal 2", "Goal 3", "Goal 4", "Goal 5"]

Example: If user says "do a 10 minutes workout", return goals like "Do a 10-minute workout focusing on...", NOT "Do a 5-minute workout"`;

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
            content: "You are a compassionate goal coach who specializes in helping neurodivergent people break down overwhelming tasks into small, achievable steps. Always return valid JSON arrays."
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    // Parse the JSON array from AI response
    let suggestions: string[];
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      suggestions = JSON.parse(cleanedResponse);

      // Validate it's an array
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }

      // Ensure we have exactly 5 suggestions
      if (suggestions.length !== 5) {
        suggestions = suggestions.slice(0, 5);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to generic suggestions
      suggestions = [
        'Take 5 minutes to organize one small area',
        'Write down 3 things you want to accomplish',
        'Take a short walk or stretch',
        'Clear out one drawer or shelf',
        'Reach out to someone you care about'
      ];
    }

    return NextResponse.json({
      suggestions,
      success: true
    });

  } catch (error) {
    console.error('Goal suggestion API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
