"use client";

import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Loader, Lightbulb, TrendingUp, MessageCircle } from 'lucide-react';

interface GoalCoachProps {
  userEmail: string;
}

interface CoachingResponse {
  suggestion: string;
  type: 'motivation' | 'strategy' | 'tips' | 'reflection';
  category: string;
}

export default function GoalCoach({ userEmail }: GoalCoachProps) {
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<{role: string, content: string, type?: string, category?: string}[]>([]);

  // Persist coaching state to localStorage
  const saveToStorage = (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`coaching_${userEmail}`, JSON.stringify(data));
    }
  };

  const loadFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`coaching_${userEmail}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing saved coaching data:', error);
        }
      }
    }
    return null;
  };

  // Load saved state on component mount
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setCoaching(savedData.coaching);
      setConversation(savedData.conversation || []);
    }
  }, [userEmail]);

  const getCoaching = async (input?: string) => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/goal-coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          input: input || '',
          conversation
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoaching(data);
        
        if (input) {
          const newConversation = [
            ...conversation,
            { role: 'user', content: input },
            { role: 'assistant', content: data.suggestion, type: data.type, category: data.category }
          ];
          setConversation(newConversation);
          setUserInput('');
          
          // Save to localStorage
          saveToStorage({
            coaching: data,
            conversation: newConversation
          });
        }
      }
    } catch (err) {
      console.error('Error getting coaching:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskCoach = () => {
    if (userInput.trim()) {
      getCoaching(userInput.trim());
    }
  };

  const getRandomCoaching = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/goal-coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          requestType: 'random'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoaching(data);
        // Clear conversation history when showing random coaching
        setConversation([]);
        
        // Save to localStorage
        saveToStorage({
          coaching: data,
          conversation: []
        });
      }
    } catch (err) {
      console.error('Error getting random coaching:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'motivation': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'strategy': return <Target className="w-5 h-5 text-blue-600" />;
      case 'tips': return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'reflection': return <MessageCircle className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'motivation': return 'border-green-200 bg-green-50';
      case 'strategy': return 'border-blue-200 bg-blue-50';
      case 'tips': return 'border-yellow-200 bg-yellow-50';
      case 'reflection': return 'border-purple-200 bg-purple-50';
      default: return 'border-indigo-200 bg-indigo-50';
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
      <div className="flex flex-col gap-4">
        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-3 mb-4 p-4 bg-white rounded-lg border">
            {conversation.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white p-3' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.role === 'user' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="p-3">
                      {message.type && message.category && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                          {getTypeIcon(message.type)}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium capitalize text-gray-600">{message.type}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{message.category}</span>
                          </div>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Coaching Response - only show if no conversation or if it's a random coaching tip */}
        {coaching && conversation.length === 0 && (
          <div className={`p-6 rounded-xl border-2 ${getTypeColor(coaching.type)}`}>
            <div className="flex items-center gap-3 mb-4">
              {getTypeIcon(coaching.type)}
              <div>
                <h3 className="font-semibold text-gray-800 capitalize">{coaching.type}</h3>
                <p className="text-sm text-gray-600">{coaching.category}</p>
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed">{coaching.suggestion}</p>
          </div>
        )}

        {/* Input Section */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskCoach()}
              placeholder="Ask your AI coach anything about your goals..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
            <button
              onClick={handleAskCoach}
              disabled={loading || !userInput.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              Ask
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={getRandomCoaching}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Get Coaching Tip
            </button>
            {(coaching || conversation.length > 0) && (
              <button
                onClick={() => {
                  setCoaching(null);
                  setConversation([]);
                  saveToStorage({ coaching: null, conversation: [] });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                title="Clear session"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {!coaching && !loading && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your AI Goal Coach</h3>
            <p className="text-gray-600 mb-4">
              Get personalized coaching, motivation, and strategies to achieve your goals.
            </p>
            <button
              onClick={() => getRandomCoaching()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Start Coaching Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}