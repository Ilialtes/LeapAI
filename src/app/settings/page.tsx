"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Settings as SettingsIcon, User, Lock, Save, Plus, X, Eye, EyeOff, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';

interface UserProfile {
  name?: string;
  displayName?: string;
  bio?: string;
  age?: number;
  adhd?: {
    diagnosed: boolean;
    notes?: string;
    copingStrategies?: string[];
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>(
    (tabParam === 'security' ? 'security' : tabParam === 'billing' ? 'billing' : 'profile') as 'profile' | 'security' | 'billing'
  );
  const [subscriptionData, setSubscriptionData] = useState({
    status: 'trial',
    plan: 'none',
    trialEndsAt: '',
    daysRemaining: 7
  });
  const [profile, setProfile] = useState<UserProfile>({
    adhd: { diagnosed: false, copingStrategies: [] }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newCopingStrategy, setNewCopingStrategy] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Check if user signed up with email/password
  const isEmailPasswordUser = user?.providerData?.some(
    provider => provider.providerId === 'password'
  ) ?? false;

  useEffect(() => {
    fetchProfile();
    if (activeTab === 'billing') {
      fetchSubscriptionData();
    }
  }, [user?.email, activeTab]);

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

  const fetchSubscriptionData = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/user-trial-status?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubscriptionData({
            status: data.trialActive ? 'trial' : data.subscriptionStatus || 'none',
            plan: data.plan || 'none',
            trialEndsAt: data.trialEndsAt || '',
            daysRemaining: data.daysRemaining || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
  };

  const saveProfile = async () => {
    if (!user?.email) return;

    setSaving(true);
    setMessage('');
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        setPasswordMessage('No user found. Please sign in again.');
        return;
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      setPasswordMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordMessage(''), 5000);
    } catch (error: any) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordMessage('Current password is incorrect.');
      } else if (error.code === 'auth/weak-password') {
        setPasswordMessage('Password is too weak. Please choose a stronger password.');
      } else {
        setPasswordMessage('Failed to update password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to access settings</h1>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 my-6 sm:my-8">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security
              </div>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'billing'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Subscription & Billing
              </div>
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {message && (
              <div className={`p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profile.displayName || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="How you'd like to be addressed"
                  />
                </div>
              </div>
            </section>

            {/* Focus & Motivation Style */}
            <section className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Focus & Motivation Style</h2>

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
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="adhd-diagnosed" className="text-sm font-medium text-gray-700">
                    I often struggle with focus and motivation
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How do you experience focus challenges?</label>
                  <textarea
                    value={profile.adhd?.notes || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      adhd: { ...prev.adhd!, notes: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                    rows={3}
                    placeholder="Describe how your brain works best, or what makes it hard to focus..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What helps you get things done?</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCopingStrategy}
                      onChange={(e) => setNewCopingStrategy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Add a strategy or preference (e.g., 'listening to music', 'working in short bursts')..."
                      onKeyPress={(e) => e.key === 'Enter' && addCopingStrategy()}
                    />
                    <button
                      onClick={addCopingStrategy}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.adhd?.copingStrategies?.map((strategy, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {strategy}
                        <button onClick={() => removeCopingStrategy(index)} className="text-green-600 hover:text-green-800">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            {isEmailPasswordUser ? (
              <>
                <section className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>

                  {passwordMessage && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      passwordMessage.includes('successfully')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {passwordMessage}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </section>
              </>
            ) : (
              <section className="bg-blue-50 rounded-xl p-8 text-center">
                <div className="max-w-md mx-auto">
                  <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Password Management Not Available
                  </h3>
                  <p className="text-gray-600">
                    You manage your account through Google. To change your password, please visit your Google Account settings.
                  </p>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-8">
            {/* Current Plan Status */}
            <section className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {subscriptionData.status === 'trial' ? 'Free Trial' :
                     subscriptionData.status === 'active' ? 'Active Subscription' :
                     'No Active Subscription'}
                  </h2>
                  {subscriptionData.status === 'trial' && (
                    <p className="text-gray-700">
                      <span className="font-semibold">{subscriptionData.daysRemaining} days remaining</span> in your free trial
                    </p>
                  )}
                  {subscriptionData.status === 'active' && (
                    <p className="text-gray-700">
                      Current plan: <span className="font-semibold">{subscriptionData.plan === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                    </p>
                  )}
                </div>
                {subscriptionData.status === 'trial' && (
                  <span className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    TRIAL
                  </span>
                )}
                {subscriptionData.status === 'active' && (
                  <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>

              {subscriptionData.status === 'trial' && subscriptionData.daysRemaining <= 3 && (
                <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-4">
                  <p className="text-orange-800 font-medium">
                    Your trial is ending soon! Choose a plan below to continue using SubtlePush.
                  </p>
                </div>
              )}
            </section>

            {/* Plan Selection */}
            {(subscriptionData.status === 'trial' || subscriptionData.status === 'none') && (
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Choose Your Plan</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Monthly Plan */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-colors">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Monthly</h4>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-gray-900">$2</span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-gray-700">
                      <li>✓ Unlimited focus sessions</li>
                      <li>✓ AI coaching</li>
                      <li>✓ Progress tracking</li>
                      <li>✓ Cancel anytime</li>
                    </ul>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                      Choose Monthly
                    </button>
                  </div>

                  {/* Yearly Plan */}
                  <div className="bg-white rounded-xl border-2 border-green-500 p-6 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        SAVE $4
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Yearly</h4>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-gray-900">$20</span>
                      <span className="text-gray-600 ml-2">/year</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-gray-700">
                      <li>✓ Unlimited focus sessions</li>
                      <li>✓ AI coaching</li>
                      <li>✓ Progress tracking</li>
                      <li>✓ Priority support</li>
                    </ul>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                      Choose Yearly
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Manage Subscription */}
            {subscriptionData.status === 'active' && (
              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Manage Subscription</h3>
                <div className="space-y-4">
                  <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors">
                    Change Plan
                  </button>
                  <button className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-lg transition-colors">
                    Cancel Subscription
                  </button>
                </div>
              </section>
            )}

            {/* Billing History */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Billing History</h3>
              <p className="text-gray-600 text-sm">No billing history yet.</p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
