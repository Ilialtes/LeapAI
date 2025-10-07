"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, X } from 'lucide-react';

interface FirstStepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FirstStepModal({ isOpen, onClose }: FirstStepModalProps) {
  const router = useRouter();
  const [bigPicture, setBigPicture] = useState('');
  const [firstStep, setFirstStep] = useState('');

  const handleStartFocusing = () => {
    // Use the first step as the task, fallback to default if empty
    const task = firstStep.trim() || 'Focus on one small thing';

    // Navigate to Focus Room with the specific task
    router.push(`/focus-room?task=${encodeURIComponent(task)}`);

    // Close modal
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setBigPicture('');
    setFirstStep('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold" style={{color: '#2E7D32'}}>Okay, let's begin!</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Big Picture Field (Optional) */}
          <div>
            <label htmlFor="bigPicture" className="block text-sm font-medium mb-2" style={{color: '#546E7A'}}>
              What's the big picture?
            </label>
            <input
              type="text"
              id="bigPicture"
              value={bigPicture}
              onChange={(e) => setBigPicture(e.target.value)}
              placeholder="e.g., Launch my side project, Get healthier, Learn a new skill..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - This helps us understand your bigger goal</p>
          </div>

          {/* First Step Field (Required) */}
          <div>
            <label htmlFor="firstStep" className="block text-sm font-medium mb-2" style={{color: '#2E7D32'}}>
              What's the tiniest first step for the next 5 minutes? *
            </label>
            <input
              type="text"
              id="firstStep"
              value={firstStep}
              onChange={(e) => setFirstStep(e.target.value)}
              placeholder="e.g., Open my laptop, Write one paragraph, Do 5 pushups..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Make it so small it feels almost silly not to do it</p>
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <button
              onClick={handleStartFocusing}
              disabled={!firstStep.trim()}
              className="w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 text-lg"
              style={{backgroundColor: firstStep.trim() ? '#2E7D32' : undefined}}
              onMouseEnter={(e) => {
                if (firstStep.trim()) e.currentTarget.style.backgroundColor = '#1B5E20';
              }}
              onMouseLeave={(e) => {
                if (firstStep.trim()) e.currentTarget.style.backgroundColor = '#2E7D32';
              }}
            >
              <Play className="w-5 h-5" />
              Start Focusing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}