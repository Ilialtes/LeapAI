"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { ArrowRight, Zap, Brain, Heart } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to focus room
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/focus-room');
    }
  }, [isAuthenticated, user, router]);

  // Show nothing while checking auth or redirecting
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="bg-slate-50 text-gray-800 font-sans">
      <main className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 my-6 sm:my-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Finally, a Focus App That Works
            <span className="text-green-600 block">With Your Brain, Not Against It.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            SubtlePush is a compassionate partner that helps you overcome motivational hurdles with personalized AI coaching, automated tracking, and a shame-free environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors duration-150 text-lg"
            >
              Start Your 7-Day Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold py-4 px-8 rounded-lg transition-colors duration-150 text-lg"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required • Cancel anytime</p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">The Frictionless Focus Room</h3>
            <p className="text-gray-600">Start a focus session in a single click. Our minimalist design removes distractions and helps you build momentum, one 5-minute win at a time.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">The AI Action Hub</h3>
            <p className="text-gray-600">Feeling stuck? Our AI coach helps you break down big goals into tiny, achievable steps and provides personalized &quot;on-ramps&quot; to get you into a state of flow.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Compassionate Gamification</h3>
            <p className="text-gray-600">Earn badges for your effort, not perfection. Our achievement system is designed to be a delightful surprise that celebrates your progress without creating pressure.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-md p-8 text-center border border-green-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Work With Your Brain?</h2>
          <p className="text-gray-600 mb-6 text-lg">Join users who are finally making progress without the shame and pressure.</p>
          <Link
            href="/auth/signup"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-md inline-flex items-center gap-2 transition-colors duration-150 text-lg"
          >
            Start Your 7-Day Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
