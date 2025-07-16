"use client";

import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import MovieSuggestion from '@/components/MovieSuggestion';

export default function TestMCPPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      <AppHeader showSettingsIcon={false} />

      <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 my-6 sm:my-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
          Movie Recommendation Assistant (MCP)
        </h1>

        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            This is a demonstration of the Movie Recommendation Assistant powered by OpenAI and Firebase.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• First, set your age to get personalized movie recommendations</li>
            <li>• Click "Get Movie Suggestion" to receive an AI-powered movie recommendation</li>
            <li>• Your profile is stored in Firebase Firestore</li>
            <li>• The AI considers your age when making recommendations</li>
          </ul>
        </div>

        <MovieSuggestion userEmail="test@example.com" />

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Technical Details:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Uses OpenAI GPT-4o for movie recommendations</li>
            <li>• Firebase Firestore for user profile storage</li>
            <li>• Next.js API routes for backend processing</li>
            <li>• Secure API key handling with environment variables</li>
          </ul>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        <p>© 2025 Leap AI. All rights reserved.</p>
      </footer>
    </div>
  );
}