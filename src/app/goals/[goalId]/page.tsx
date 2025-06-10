// src/app/goals/[goalId]/page.tsx
"use client"; // Mark as a Client Component if using hooks like useParams, or for event handlers

import React from 'react';
import AppNavbar from '@/components/layout/AppNavbar';
import ProgressBar from '@/components/ui/ProgressBar';
// Import new icons for check-in history
import { FilePenLine, CheckSquare2, Square, PlusCircle, CheckCheck, Code, UsersRound } from 'lucide-react';

interface GoalDetailPageProps {
  params: { goalId: string };
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
  const goalTitle = "Launch my startup";
  const goalDueDate = "Dec 31, 2024";
  const overallProgress = 60;
  const progressChange = "+10%";
  const milestones = [
    { id: 'm1', text: "Market research completed", completed: true },
    { id: 'm2', text: "MVP development underway", completed: false },
    { id: 'm3', text: "Secure seed funding", completed: false },
  ];
  const checkinHistory = [
    { id: 'c1', icon: <CheckCheck className="w-5 h-5 text-green-600" />, title: "Feeling positive and making good progress!", date: "Oct 26, 2023", iconBg: "bg-green-50" },
    { id: 'c2', icon: <Code className="w-5 h-5 text-blue-600" />, title: "Finalized the new feature implementation.", date: "Oct 24, 2023", iconBg: "bg-blue-50" },
    { id: 'c3', icon: <UsersRound className="w-5 h-5 text-purple-600" />, title: "Met with potential investors.", date: "Oct 22, 2023", iconBg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      <AppNavbar />

      <main className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-10 my-8">
        {/* Goal Header Section ... */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Goal: {goalTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Due date: {goalDueDate}
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 mt-4 sm:mt-0 whitespace-nowrap">
            <FilePenLine className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Edit Goal</span>
          </button>
        </div>

        {/* Overall Progress Section */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-gray-700">Overall Progress</span>
            <span className="text-base font-semibold text-indigo-600">{overallProgress}%</span>
          </div>
          <ProgressBar
            progress={overallProgress}
            barColor="bg-indigo-500"
            height="h-3" // Standard height for progress bars
          />
        </section>

        {/* Progress & Milestones Grid Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8"> {/* Added sm:gap-8 */}
          {/* Left Column: Progress Over Time */}
          <div className="border border-slate-200 rounded-lg p-6">
            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-bold text-gray-800">{overallProgress}%</span>
              <span className="text-sm font-semibold text-green-500 ml-2">{progressChange}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Last 6 Months</p>
            {/* Chart Placeholder */}
            <div className="h-48 bg-slate-100 rounded flex items-center justify-center text-sm text-slate-500">
              {/* Chart will be displayed here. Library like Recharts will be integrated later. */}
              Chart Placeholder
            </div>
          </div>

          {/* Right Column: Milestones */}
          <div className="border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Milestones</h3>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center">
                  <button aria-label={milestone.completed ? 'Mark as incomplete' : 'Mark as complete'} className="p-1 mr-3">
                    {milestone.completed ? (
                      <CheckSquare2 className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <span className={`text-sm ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {milestone.text}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 mt-6 transition-colors">
              <PlusCircle className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>
        </section>

        {/* Check-in History Section will go here */}
        <div className="TEMP_CHECKIN_HISTORY_PLACEHOLDER mt-8">Check-in History Placeholder</div>
      </main>

      {/* Optional Footer */}
      {/* <footer className="text-center text-xs text-gray-400 py-6 mt-auto">
           <p>© 2025 Leap AI. All rights reserved.</p>
         </footer> */}
    </div>
  );
}
