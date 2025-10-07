"use client";

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a 7-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200 hover:border-blue-300 transition-colors">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Monthly</h3>
              <p className="text-gray-600 mb-4">Pay as you go. Perfect for maximum flexibility.</p>
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
                <span className="text-gray-700">Achievement badges & gamification</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Cancel anytime</span>
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-150"
            >
              Start Your 7-Day Free Trial
            </Link>
          </div>

          {/* Yearly Plan - Featured */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-500 relative">
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                BEST VALUE
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Yearly</h3>
              <p className="text-gray-600 mb-4">Our best value. Commit for a year and get 2 months free.</p>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-gray-900">$20</span>
                <span className="text-xl text-gray-600 ml-2">/year</span>
              </div>
              <p className="text-green-700 font-semibold text-sm">Save $4 compared to monthly!</p>
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
                <span className="text-gray-700">Achievement badges & gamification</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-150 flex items-center justify-center gap-2"
            >
              Start Your 7-Day Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* FAQ / Additional Info */}
        <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">What happens after my free trial?</h3>
              <p className="text-gray-600">
                After 7 days, you&apos;ll be prompted to choose a plan. Your data and progress are saved, so you can pick up right where you left off.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Absolutely. You can cancel your subscription at any time from your Settings page. No questions asked, no hidden fees.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Do I need a credit card for the free trial?</h3>
              <p className="text-gray-600">
                No! We don&apos;t require a credit card to start your 7-day free trial. You&apos;ll only need to add payment information if you decide to continue after the trial.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Can I switch between monthly and yearly plans?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time from your Subscription & Billing settings.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Ready to get started?</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-md transition-colors duration-150 text-lg"
          >
            Start Your 7-Day Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
