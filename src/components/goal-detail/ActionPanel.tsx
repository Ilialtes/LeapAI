"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Sparkles } from 'lucide-react';

interface ActionPanelProps {
  goal: {
    id: string;
    title: string;
  };
}

export default function ActionPanel({ goal }: ActionPanelProps) {
  const router = useRouter();
  const [tinyStep, setTinyStep] = useState(''); // Always starts empty

  // Input should always start empty - no auto-loading from localStorage
  // User can start a session with an empty task

  const handleStartSession = () => {
    // Navigate to focus room with goal context
    const params = new URLSearchParams({
      goalId: goal.id,
      task: tinyStep || `Work on: ${goal.title}`,
      timer: '5'
    });

    router.push(`/focus-room?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartSession();
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
      {/* AI Prompt Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <Sparkles className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Ready to work on &ldquo;{goal.title}&rdquo;?
          </h2>
          <p className="text-gray-600">
            What&apos;s the next tiny step you can take in just 5 minutes?
          </p>
        </div>
      </div>

      {/* Task Input */}
      <div className="mb-6">
        <input
          type="text"
          value={tinyStep}
          onChange={(e) => setTinyStep(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Outline the first chapter, Draft opening paragraph..."
          className="w-full px-4 py-4 text-lg text-gray-800 placeholder-gray-400 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all bg-white"
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Keep it small! Breaking momentum is harder than starting.
        </p>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleStartSession}
        className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-5 px-8 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
      >
        <Play className="w-6 h-6" fill="white" />
        Start 5-Min Focus Session
      </button>

      {/* Helper Text */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Just 5 minutes. No pressure. Let&apos;s get started.
      </p>
    </div>
  );
}
