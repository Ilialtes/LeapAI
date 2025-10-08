"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

export default function SubscriptionRequiredPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h1>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Your Free Trial Has Ended
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thanks for trying SubtlePush! To continue using the app and keep building momentum, choose a plan below.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Monthly</h3>
              <p className="text-gray-600 mb-4">Perfect for maximum flexibility</p>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-gray-900">$2</span>
                <span className="text-xl text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited focus sessions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Personalized AI coaching</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Automated progress tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Achievement system</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Cancel anytime</span>
              </li>
            </ul>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-150 text-lg">
              Choose Monthly Plan
            </button>
          </div>

          {/* Yearly Plan - Featured */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-green-500 relative transform md:scale-105">
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                BEST VALUE - SAVE $4
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Yearly</h3>
              <p className="text-gray-600 mb-4">Best value for long-term commitment</p>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-gray-900">$20</span>
                <span className="text-xl text-gray-600 ml-2">/year</span>
              </div>
              <p className="text-green-700 font-semibold text-sm">That&apos;s just $1.67/month!</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited focus sessions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Personalized AI coaching</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Automated progress tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Achievement system</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 font-semibold">Priority support</span>
              </li>
            </ul>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-150 flex items-center justify-center gap-2 text-lg shadow-lg">
              Choose Yearly Plan
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Why Continue Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why users love SubtlePush</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">5 min</div>
              <p className="text-gray-700">Average time to start focusing</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Zero</div>
              <p className="text-gray-700">Shame or pressure</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">100%</div>
              <p className="text-gray-700">Works with your brain</p>
            </div>
          </div>
        </div>

        {/* Money-Back Guarantee */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
          <p className="text-sm text-gray-500">
            Questions? <Link href="/settings?tab=billing" className="text-blue-600 hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
