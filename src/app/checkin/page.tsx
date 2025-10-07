// app/checkin/page.tsx
"use client"; // For potential future client-side interactions

import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Smile, TrendingUp, Send } from 'lucide-react'; // Import Send icon

export default function DailyCheckinPage() {
  const userName = "Sarah";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      <AppHeader showSettingsIcon={true} />

      {/* Main content now styled as a card */}
      <main className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 sm:p-8 md:p-10 my-6 sm:my-8 max-w-4xl mx-auto w-full"> {/* Added max-w-4xl mx-auto w-full for card width control */}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-10 md:mb-12">
          How's your day going, {userName}?
        </h1>

        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm p-2 sm:p-3 border border-slate-100"> {/* Added border */}
          <textarea
            className="w-full h-32 sm:h-36 border-none focus:ring-0 resize-none p-4 text-gray-700 placeholder-gray-400 text-sm sm:text-base"
            placeholder="Share your thoughts, progress, or any challenges you're facing today..."
            // Add state management (value, onChange) later
          />
        </div>

        {/* "Quick Check-in" Buttons Section */}
        <section className="w-full max-w-2xl mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Check-in</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4"> {/* Responsive flex direction */}
            <button className="flex-1 bg-blue-100 text-blue-700 rounded-lg py-3 px-4 font-semibold flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors">
              <Smile className="w-5 h-5" />
              <span>Feeling Great</span>
            </button>
            <button className="flex-1 bg-sky-100 text-sky-700 rounded-lg py-3 px-4 font-semibold flex items-center justify-center gap-2 hover:bg-sky-200 transition-colors">
              <TrendingUp className="w-5 h-5" />
              <span>Making Progress</span>
            </button>
          </div>
        </section>

        {/* "Leap AI's Response" Section */}
        <section className="w-full max-w-2xl mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Leap AI's Response</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100"> {/* Added border */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              That's fantastic, Sarah! Keep up the great work. Remember, consistency is key to achieving your goals. If you need any support or have questions, feel free to ask. I'm here to help you leap towards success!
            </p>
          </div>
        </section>

        <div className="w-full max-w-2xl mt-10 sm:mt-12">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 sm:px-12 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Send className="w-5 h-5" />
            <span>Submit Update</span>
          </button>
        </div>
      </main>

      {/* Optional Footer (can be added later if design requires) */}
      {/* <footer className="text-center text-xs text-gray-400 py-4">
           <p>© 2025 Leap AI. All rights reserved.</p>
         </footer> */}
    </div>
  );
}
