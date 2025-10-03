"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { Sparkles, Clock, Brain, Activity, Users, Home, Target, X } from 'lucide-react';

interface OnRampSuggestion {
  id: string;
  type: 'warmup' | 'direct' | 'mindset' | 'physical' | 'social' | 'environmental';
  action: string;
  coachingTip: string;
  duration?: number;
  metadata?: {
    timerPreset?: number;
    taskDescription?: string;
    requiresModal?: boolean;
  };
}

interface OnRampMenuProps {
  goal: string;
}

const typeIcons = {
  warmup: Sparkles,
  direct: Target,
  mindset: Brain,
  physical: Activity,
  social: Users,
  environmental: Home
};

const typeColors = {
  warmup: 'from-purple-50 to-purple-100 border-purple-300 hover:border-purple-500',
  direct: 'from-green-50 to-green-100 border-green-300 hover:border-green-500',
  mindset: 'from-blue-50 to-blue-100 border-blue-300 hover:border-blue-500',
  physical: 'from-orange-50 to-orange-100 border-orange-300 hover:border-orange-500',
  social: 'from-pink-50 to-pink-100 border-pink-300 hover:border-pink-500',
  environmental: 'from-teal-50 to-teal-100 border-teal-300 hover:border-teal-500'
};

const typeTextColors = {
  warmup: 'text-purple-700',
  direct: 'text-green-700',
  mindset: 'text-blue-700',
  physical: 'text-orange-700',
  social: 'text-pink-700',
  environmental: 'text-teal-700'
};

export default function OnRampMenu({ goal }: OnRampMenuProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<OnRampSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMindsetModal, setShowMindsetModal] = useState(false);
  const [mindsetNote, setMindsetNote] = useState('');
  const [currentAction, setCurrentAction] = useState('');

  useEffect(() => {
    fetchOnRamps();
  }, [goal]);

  const fetchOnRamps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-coach/on-ramps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal,
          email: user?.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('On-ramp suggestions received:', data.suggestions);
        setSuggestions(data.suggestions);
      } else {
        console.error('Failed to fetch on-ramps:', response.status);
      }
    } catch (error) {
      console.error('Error fetching on-ramps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnRampClick = (suggestion: OnRampSuggestion) => {
    console.log('On-ramp clicked:', suggestion);

    // Handle mindset suggestions that need a modal
    if (suggestion.metadata?.requiresModal || suggestion.type === 'mindset') {
      setCurrentAction(suggestion.action);
      setShowMindsetModal(true);
      console.log('Opening mindset modal');
      return;
    }

    // Handle direct action suggestions that navigate to Focus Room
    if (suggestion.type === 'direct') {
      const taskDescription = suggestion.metadata?.taskDescription || suggestion.action;
      console.log('Navigating to focus room:', taskDescription);
      // Let Focus Room extract timer from task text, no hardcoded timer
      router.push(`/focus-room?task=${encodeURIComponent(taskDescription)}`);
      return;
    }

    // For other types, navigate to focus room with the action as the task
    // Let Focus Room extract timer from task text, no hardcoded timer
    console.log('Navigating to focus room:', suggestion.action);
    router.push(`/focus-room?task=${encodeURIComponent(suggestion.action)}`);
  };

  const handleSaveMindsetNote = () => {
    console.log('Saving mindset note and navigating to focus room');

    // Save the note (could be to localStorage or API)
    if (mindsetNote.trim()) {
      localStorage.setItem('last-mindset-note', JSON.stringify({
        note: mindsetNote,
        goal,
        timestamp: new Date().toISOString()
      }));
    }

    setShowMindsetModal(false);
    setMindsetNote('');

    // Navigate to focus room with the goal
    router.push(`/focus-room?task=${encodeURIComponent(goal)}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Your AI coach is preparing personalized suggestions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Coach Introduction */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
            <p className="text-gray-800 leading-relaxed font-medium">
              Perfect! Here are some personalized on-ramps based on what you shared. Pick the one that feels right:
            </p>
          </div>
        </div>
      </div>

      {/* On-Ramp Suggestions */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const Icon = typeIcons[suggestion.type];
          return (
            <button
              key={suggestion.id}
              onClick={() => handleOnRampClick(suggestion)}
              className={`w-full text-left bg-gradient-to-r ${typeColors[suggestion.type]} border-2 rounded-xl p-5 transition-all hover:shadow-md group`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${typeTextColors[suggestion.type]} bg-white/50 flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${typeTextColors[suggestion.type]} mb-2 group-hover:underline`}>
                    {suggestion.action}
                  </p>
                  {suggestion.duration && (
                    <div className="flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{suggestion.duration} min</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 italic">
                    💡 {suggestion.coachingTip}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mindset Modal */}
      {showMindsetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                Mindset Moment
              </h3>
              <button
                onClick={() => {
                  setShowMindsetModal(false);
                  setMindsetNote('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <p className="text-gray-700 mb-4">{currentAction}</p>

            <textarea
              value={mindsetNote}
              onChange={(e) => setMindsetNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-white"
              rows={6}
              placeholder="Take a moment to write your thoughts..."
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowMindsetModal(false);
                  setMindsetNote('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMindsetNote}
                disabled={!mindsetNote.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
