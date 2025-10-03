"use client";

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

type ConversationStep = 'greeting' | 'area-selection' | 'goal-suggestions' | 'confirmation';

interface GoalSparkCoachProps {
  onGoalSelected: (goalData: {
    title: string;
    description: string;
    category: string;
  }) => void;
}

const AREA_TO_CATEGORY: Record<string, string> = {
  'Home': 'Personal',
  'Work': 'Career',
  'Personal': 'Personal'
};

const GOAL_SUGGESTIONS: Record<string, string[]> = {
  'Home': [
    'Tidy my desk',
    'Organize one kitchen drawer',
    'Deal with that pile of mail',
    'Make my bed every morning for a week',
    'Clear out one shelf in the closet'
  ],
  'Work': [
    'Respond to 3 pending emails',
    'Organize my digital files',
    'Update my task list',
    'Schedule that meeting I\'ve been postponing',
    'Clean up my workspace'
  ],
  'Personal': [
    'Take a 10-minute walk today',
    'Call or text a friend',
    'Journal for 5 minutes',
    'Try one new recipe',
    'Read for 15 minutes before bed'
  ]
};

export default function GoalSparkCoach({ onGoalSelected }: GoalSparkCoachProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<ConversationStep>('greeting');
  const [userInput, setUserInput] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string | JSX.Element;
  }>>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [originalUserInput, setOriginalUserInput] = useState('');

  const handleUserSubmit = async () => {
    if (!userInput.trim()) return;

    // Store original user input for AI context
    setOriginalUserInput(userInput);

    // Add user message to history
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: userInput
    }]);

    setUserInput('');
    setStep('goal-suggestions');
    setIsLoadingSuggestions(true);

    // Fetch AI-generated suggestions directly without area selection
    try {
      const response = await fetch('/api/goal-spark/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput,
          selectedArea: 'General', // No area selection needed
          email: user?.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions);
      } else {
        // Fallback to generic suggestions
        setAiSuggestions([
          'Take 5 minutes to organize one small area',
          'Write down 3 things you want to accomplish',
          'Take a short walk or stretch',
          'Clear out one drawer or shelf',
          'Reach out to someone you care about'
        ]);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      // Fallback to generic suggestions
      setAiSuggestions([
        'Take 5 minutes to organize one small area',
        'Write down 3 things you want to accomplish',
        'Take a short walk or stretch',
        'Clear out one drawer or shelf',
        'Reach out to someone you care about'
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAreaSelect = async (area: string) => {
    setSelectedArea(area);

    // Add user selection to history
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: (
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {area === 'Home' ? '🏡' : area === 'Work' ? '💼' : '👤'}
          </span>
          <span>{area}</span>
        </div>
      )
    }]);

    setStep('goal-suggestions');
    setIsLoadingSuggestions(true);

    // Fetch AI-generated suggestions
    try {
      const response = await fetch('/api/goal-spark/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: originalUserInput,
          selectedArea: area,
          email: user?.email // Pass user email for personalization
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions);
      } else {
        // Fallback to static suggestions
        setAiSuggestions(GOAL_SUGGESTIONS[area]);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      // Fallback to static suggestions
      setAiSuggestions(GOAL_SUGGESTIONS[area]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);

    // Add user selection to history
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: goal
    }]);

    setStep('confirmation');
  };

  const handleCreateGoal = () => {
    if (!selectedGoal) return;

    const goalData = {
      title: selectedGoal,
      description: 'A small, achievable goal to help me make progress.',
      category: 'Personal'
    };

    onGoalSelected(goalData);
  };

  return (
    <div className="mb-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-200 shadow-sm">
      <div className="space-y-6">
        {/* AI Greeting */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
              <p className="text-gray-800 leading-relaxed">
                Welcome to your Goal Workshop! 👋
              </p>
              <p className="text-gray-800 leading-relaxed mt-2">
                What's on your mind? Feel free to share a big, messy, or vague idea. There's no wrong answer.
              </p>
            </div>
          </div>
        </div>

        {/* Conversation History */}
        {conversationHistory.map((message, index) => (
          <div key={index}>
            {message.type === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-blue-100 rounded-2xl rounded-tr-none p-4 max-w-md">
                  <div className="text-gray-800">{message.content}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
                    {message.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Step 1: User Input */}
        {step === 'greeting' && (
          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type anything that's on your mind... (e.g., 'I need to get my life organized')"
              className="w-full px-3 py-2 border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleUserSubmit}
                disabled={!userInput.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}


        {/* Step 2: Goal Suggestions */}
        {step === 'goal-suggestions' && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
                <p className="text-gray-800 leading-relaxed mb-4">
                  Perfect! {isLoadingSuggestions ? "Let me think of some personalized goals for you..." : "Here are some small, manageable goals based on what you shared. Pick the one that feels right:"}
                </p>

                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aiSuggestions.map((goal, index) => (
                      <button
                        key={`${goal}-${index}`}
                        onClick={() => handleGoalSelect(goal)}
                        className="w-full text-left bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-500 rounded-lg py-3 px-4 transition-all"
                      >
                        <span className="font-medium text-gray-700">{goal}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmation' && selectedGoal && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
                <p className="text-gray-800 leading-relaxed mb-6">
                  Perfect! "{selectedGoal}" can make a huge difference in how you feel. Ready to add it to your goals?
                </p>

                <button
                  onClick={handleCreateGoal}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Yes, Add This Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
