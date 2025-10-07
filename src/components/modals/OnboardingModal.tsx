"use client";

import React, { useState } from 'react';
import { X, CheckCircle, Rocket } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
  userName?: string;
}

interface OnboardingData {
  struggleWithFocus: boolean;
  focusChallenges: string;
  helpfulStrategies: string[];
}

export default function OnboardingModal({ isOpen, onClose, onComplete, userName = 'there' }: OnboardingModalProps) {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Form, 3: Confirmation
  const [data, setData] = useState<OnboardingData>({
    struggleWithFocus: false,
    focusChallenges: '',
    helpfulStrategies: []
  });
  const [currentStrategy, setCurrentStrategy] = useState('');

  if (!isOpen) return null;

  const handleSkip = () => {
    onClose();
  };

  const handleGetStarted = () => {
    setStep(2);
  };

  const handleContinue = () => {
    setStep(3);
  };

  const handleComplete = () => {
    onComplete(data);
    onClose();
  };

  const addStrategy = () => {
    if (currentStrategy.trim()) {
      setData(prev => ({
        ...prev,
        helpfulStrategies: [...prev.helpfulStrategies, currentStrategy.trim()]
      }));
      setCurrentStrategy('');
    }
  };

  const removeStrategy = (index: number) => {
    setData(prev => ({
      ...prev,
      helpfulStrategies: prev.helpfulStrategies.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Step 1: Welcome Screen */}
        {step === 1 && (
          <div className="p-8 md:p-12 text-center">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Leap AI, {userName}!
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Let&apos;s take 60 seconds to personalize your experience. This helps your AI Coach give you the best possible support.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGetStarted}
                className="w-full max-w-sm mx-auto block bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105 text-lg shadow-lg"
              >
                Get Started
              </button>
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Focus & Motivation Style Form */}
        {step === 2 && (
          <div className="p-8 md:p-12">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Focus & Motivation Style
                </h2>
                <span className="text-sm text-gray-500">Step 1 of 2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-1/2 transition-all"></div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="struggle-focus"
                  checked={data.struggleWithFocus}
                  onChange={(e) => setData(prev => ({ ...prev, struggleWithFocus: e.target.checked }))}
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                />
                <label htmlFor="struggle-focus" className="text-base font-medium text-gray-700 cursor-pointer">
                  I often struggle with focus and motivation
                </label>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How do you experience focus challenges?
                </label>
                <textarea
                  value={data.focusChallenges}
                  onChange={(e) => setData(prev => ({ ...prev, focusChallenges: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white resize-none"
                  rows={4}
                  placeholder="Describe how your brain works best, or what makes it hard to focus..."
                />
              </div>

              {/* Strategies Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What helps you get things done?
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentStrategy}
                    onChange={(e) => setCurrentStrategy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrategy())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Add a strategy (e.g., 'listening to music', 'working in short bursts')..."
                  />
                  <button
                    onClick={addStrategy}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.helpfulStrategies.map((strategy, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {strategy}
                      <button
                        onClick={() => removeStrategy(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg mt-6"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation Screen */}
        {step === 3 && (
          <div className="p-8 md:p-12 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                All set! Your AI Coach is ready.
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Remember, you can always update your style in the settings.
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full max-w-sm mx-auto block bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105 text-lg shadow-lg"
            >
              Start Focusing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
