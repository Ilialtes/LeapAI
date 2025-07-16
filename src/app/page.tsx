"use client";

import React from 'react';
import Link from 'next/link';
import { BookText, ArrowRight, Target, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 sm:px-8 md:px-10 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BookText className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">Leap AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/auth/signin"
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 my-6 sm:my-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Leap Towards Your
            <span className="text-blue-600 block">Goals</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track your progress, get AI-powered coaching, and achieve your dreams with personalized guidance every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors duration-150"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/auth/signin"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition-colors duration-150"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Goal Tracking</h3>
            <p className="text-gray-600">Set meaningful goals and track your progress with intuitive visual indicators.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Coaching</h3>
            <p className="text-gray-600">Get personalized insights and encouragement from your AI coach.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Daily Check-ins</h3>
            <p className="text-gray-600">Stay accountable with daily progress updates and reflections.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-8 text-center border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Make Progress?</h2>
          <p className="text-gray-600 mb-6 text-lg">Join thousands of users who are already achieving their goals with Leap AI.</p>
          <Link 
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md inline-flex items-center gap-2 transition-colors duration-150"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4">
        <p>© 2025 Leap AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
