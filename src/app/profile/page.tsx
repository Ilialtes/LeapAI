"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { User, Save, Plus, X, Info } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  name?: string;
  displayName?: string;
  bio?: string;
  age?: number;
  fears?: string[];
  motivationBlockers?: string[];
  adhd?: {
    diagnosed: boolean;
    notes?: string;
    copingStrategies?: string[];
  };
  personalityTraits?: string[];
  preferredWorkingTimes?: string[];
  energyLevels?: {
    morning: 'low' | 'medium' | 'high';
    afternoon: 'low' | 'medium' | 'high';
    evening: 'low' | 'medium' | 'high';
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    fears: [],
    motivationBlockers: [],
    adhd: { diagnosed: false, copingStrategies: [] },
    personalityTraits: [],
    preferredWorkingTimes: [],
    energyLevels: { morning: 'medium', afternoon: 'medium', evening: 'medium' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Temporary input states for adding new items
  const [newFear, setNewFear] = useState('');
  const [newBlocker, setNewBlocker] = useState('');
  const [newTrait, setNewTrait] = useState('');
  const [newWorkingTime, setNewWorkingTime] = useState('');
  const [newCopingStrategy, setNewCopingStrategy] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user?.email]);

  const fetchProfile = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/user-profile?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setProfile(prev => ({ ...prev, ...data.user }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.email) return;

    setSaving(true);
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...profile })
      });

      if (response.ok) {
        setMessage('Profile saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save profile. Please try again.');
      }
    } catch (error) {
      setMessage('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: keyof UserProfile, value: string, setValue: (val: string) => void) => {
    if (!value.trim()) return;

    const currentArray = (profile[field] as string[]) || [];
    setProfile(prev => ({
      ...prev,
      [field]: [...currentArray, value.trim()]
    }));
    setValue('');
  };

  const removeArrayItem = (field: keyof UserProfile, index: number) => {
    const currentArray = (profile[field] as string[]) || [];
    setProfile(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const addCopingStrategy = () => {
    if (!newCopingStrategy.trim()) return;

    setProfile(prev => ({
      ...prev,
      adhd: {
        ...prev.adhd!,
        copingStrategies: [...(prev.adhd?.copingStrategies || []), newCopingStrategy.trim()]
      }
    }));
    setNewCopingStrategy('');
  };

  const removeCopingStrategy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      adhd: {
        ...prev.adhd!,
        copingStrategies: prev.adhd?.copingStrategies?.filter((_, i) => i !== index) || []
      }
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your profile</h1>
          <Link href="/auth/signin" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 my-6 sm:my-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.displayName || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="How you'd like to be addressed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Your age"
                  min="1"
                  max="120"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </section>

          {/* Psychological Profile */}
          <section className="bg-red-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Fears & Blockers
              <span className="relative group">
                <Info className="w-4 h-4 text-gray-500" />
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  This helps the AI understand what might demotivate you
                </div>
              </span>
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fears</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFear}
                    onChange={(e) => setNewFear(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Add a fear..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('fears', newFear, setNewFear)}
                  />
                  <button
                    onClick={() => addArrayItem('fears', newFear, setNewFear)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.fears?.map((fear, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {fear}
                      <button onClick={() => removeArrayItem('fears', index)} className="text-red-600 hover:text-red-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivation Blockers</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBlocker}
                    onChange={(e) => setNewBlocker(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Add something that demotivates you..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('motivationBlockers', newBlocker, setNewBlocker)}
                  />
                  <button
                    onClick={() => addArrayItem('motivationBlockers', newBlocker, setNewBlocker)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.motivationBlockers?.map((blocker, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {blocker}
                      <button onClick={() => removeArrayItem('motivationBlockers', index)} className="text-red-600 hover:text-red-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ADHD Information */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ADHD Considerations</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="adhd-diagnosed"
                  checked={profile.adhd?.diagnosed || false}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    adhd: { ...prev.adhd!, diagnosed: e.target.checked }
                  }))}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="adhd-diagnosed" className="text-sm font-medium text-gray-700">
                  I have been diagnosed with ADHD
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ADHD Notes</label>
                <textarea
                  value={profile.adhd?.notes || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    adhd: { ...prev.adhd!, notes: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  rows={3}
                  placeholder="Any specific ADHD-related challenges or notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coping Strategies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCopingStrategy}
                    onChange={(e) => setNewCopingStrategy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Add a coping strategy..."
                    onKeyPress={(e) => e.key === 'Enter' && addCopingStrategy()}
                  />
                  <button
                    onClick={addCopingStrategy}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.adhd?.copingStrategies?.map((strategy, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {strategy}
                      <button onClick={() => removeCopingStrategy(index)} className="text-blue-600 hover:text-blue-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Personality & Preferences */}
          <section className="bg-green-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personality & Preferences</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Add a personality trait..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('personalityTraits', newTrait, setNewTrait)}
                  />
                  <button
                    onClick={() => addArrayItem('personalityTraits', newTrait, setNewTrait)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.personalityTraits?.map((trait, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {trait}
                      <button onClick={() => removeArrayItem('personalityTraits', index)} className="text-green-600 hover:text-green-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Working Times</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newWorkingTime}
                    onChange={(e) => setNewWorkingTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., Early morning, Late evening..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('preferredWorkingTimes', newWorkingTime, setNewWorkingTime)}
                  />
                  <button
                    onClick={() => addArrayItem('preferredWorkingTimes', newWorkingTime, setNewWorkingTime)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredWorkingTimes?.map((time, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {time}
                      <button onClick={() => removeArrayItem('preferredWorkingTimes', index)} className="text-green-600 hover:text-green-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Energy Levels Throughout the Day</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['morning', 'afternoon', 'evening'] as const).map((time) => (
                    <div key={time}>
                      <label className="block text-sm font-medium text-gray-600 mb-2 capitalize">{time}</label>
                      <select
                        value={profile.energyLevels?.[time] || 'medium'}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          energyLevels: {
                            ...prev.energyLevels!,
                            [time]: e.target.value as 'low' | 'medium' | 'high'
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </main>
    </div>
  );
}