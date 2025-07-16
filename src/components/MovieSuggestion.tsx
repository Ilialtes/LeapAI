"use client";

import React, { useState } from 'react';
import { Film, User, Send } from 'lucide-react';

interface MovieSuggestionProps {
  userEmail: string;
}

const MovieSuggestion: React.FC<MovieSuggestionProps> = ({ userEmail }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | ''>('');

  const handleGetSuggestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/movie-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuggestion(data.suggestion);
      } else {
        setError(data.error || 'Failed to get suggestion');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAge = async () => {
    if (!userAge || userAge < 1 || userAge > 120) {
      setError('Please enter a valid age between 1 and 120');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, age: userAge }),
      });

      const data = await response.json();
      
      if (data.success) {
        setError(null);
        alert('Age updated successfully!');
      } else {
        setError(data.error || 'Failed to update age');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Film className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-800">Movie Assistant</h2>
      </div>

      {/* Age Update Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Your Age</label>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={userAge}
            onChange={(e) => setUserAge(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter your age"
            min="1"
            max="120"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
          <button
            onClick={handleUpdateAge}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Update
          </button>
        </div>
      </div>

      {/* Movie Suggestion Section */}
      <div className="mb-4">
        <button
          onClick={handleGetSuggestion}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors duration-150"
        >
          {loading ? (
            <span>Getting suggestion...</span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Get Movie Suggestion</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Movie Suggestion Display */}
      {suggestion && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Movie Suggestion:</h3>
          <p className="text-purple-700 leading-relaxed">{suggestion}</p>
        </div>
      )}
    </div>
  );
};

export default MovieSuggestion;