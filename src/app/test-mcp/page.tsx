"use client";

import React from 'react';
import MovieSuggestion from '@/components/MovieSuggestion';

export default function TestMCPPage() {
  return (
    <div className="bg-slate-50 text-gray-800 font-sans">
      <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 my-6 sm:my-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
          Movie Recommendation Assistant
        </h1>

        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            Get personalized movie recommendations powered by AI and tailored to your preferences.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• First, set your age to get personalized movie recommendations</li>
            <li>• Click "Get Movie Suggestion" to receive an AI-powered movie recommendation</li>
            <li>• Your profile is stored securely in our database</li>
            <li>• The AI considers your age when making recommendations</li>
          </ul>
        </div>

        <MovieSuggestion userEmail="test@example.com" />

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• AI analyzes your preferences and age</li>
            <li>• Suggests movies from various genres and time periods</li>
            <li>• Provides brief descriptions to help you decide</li>
            <li>• Updates recommendations based on your profile</li>
          </ul>
        </div>
      </main>
    </div>
  );
}