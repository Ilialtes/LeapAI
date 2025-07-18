// src/app/goals/[goalId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/AuthProvider';
import { FilePenLine, CheckSquare2, Square, PlusCircle, CheckCheck, Code, UsersRound, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

interface GoalDetailPageProps {
  params: Promise<{ goalId: string }>;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string;
  progress: number;
  milestones: Milestone[];
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  checkinHistory?: CheckinEntry[];
  currentStreak?: number;
}

interface CheckinEntry {
  id: string;
  text: string;
  date: string;
  timestamp: string;
}

interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [milestoneText, setMilestoneText] = useState('');
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const { user } = useAuth();
  
  // Unwrap the params Promise
  const { goalId } = React.use(params);

  const fetchGoal = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching goal:', goalId);
      // We need to fetch this specific goal from the user's goals
      const response = await fetch(`/api/goals?userEmail=${encodeURIComponent(user.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const foundGoal = data.goals.find((g: Goal) => g.id === goalId);
          if (foundGoal) {
            setGoal(foundGoal);
          } else {
            console.error('Goal not found');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [goalId, user?.email]);

  const addMilestone = async () => {
    if (!milestoneText.trim() || !user?.email || !goal) return;
    
    try {
      const response = await fetch(`/api/goals/${goalId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: milestoneText.trim(),
          userEmail: user.email
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchGoal(); // Refresh goal data
          setMilestoneText('');
          setIsAddingMilestone(false);
        }
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const deleteCheckin = async (checkinId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.email || !goal) return;
    
    try {
      console.log('Deleting checkin:', checkinId, 'for user:', user.email);
      const response = await fetch(`/api/goals/${goalId}/checkins/${checkinId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email
        }),
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result);
        if (result.success) {
          fetchGoal(); // Refresh goal data
        } else {
          console.error('Delete failed:', result.error);
        }
      } else {
        const errorText = await response.text();
        console.error('Delete request failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error deleting check-in:', error);
    }
  };

  const updateProgress = async () => {
    if (!user?.email || !goal || newProgress < 0 || newProgress > 100) return;
    
    try {
      const response = await fetch(`/api/goals/${goalId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: newProgress,
          userEmail: user.email
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchGoal(); // Refresh goal data
          setIsEditingProgress(false);
          setNewProgress(0);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };


  // Default data for demo purposes
  const progressChange = "+10%";
  const milestones = goal?.milestones || [
    { id: 'm1', text: "Set up project structure", completed: true },
    { id: 'm2', text: "Complete initial planning", completed: false },
    { id: 'm3', text: "Reach first milestone", completed: false },
  ];
  
  // Convert check-in history to display format
  const checkinHistory = goal?.checkinHistory ? 
    goal.checkinHistory.map((checkin: CheckinEntry) => {
      let displayDate = "Unknown date";
      try {
        // Try parsing the timestamp or date
        const dateObj = checkin.timestamp ? new Date(checkin.timestamp) : new Date(checkin.date);
        if (!isNaN(dateObj.getTime())) {
          displayDate = dateObj.toLocaleDateString();
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
      
      return {
        id: checkin.id,
        icon: <CheckCheck className="w-5 h-5 text-green-600" />,
        title: checkin.text,
        date: displayDate,
        iconBg: "bg-green-50"
      };
    }).reverse() : // Most recent first
    [
      { id: 'c1', icon: <CheckCheck className="w-5 h-5 text-green-600" />, title: "Making good progress!", date: "Today", iconBg: "bg-green-50" },
      { id: 'c2', icon: <Code className="w-5 h-5 text-blue-600" />, title: "Started working on implementation.", date: "Yesterday", iconBg: "bg-blue-50" },
    ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Goal Not Found</h1>
          <p className="text-gray-600 mb-6">The goal you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/goals" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
            Back to Goals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
      `}</style>
      <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
        <main className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-10 my-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/goals">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {goal.title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm sm:text-base text-gray-500">
                    Due: {goal.dueDate}
                  </p>
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded">
                    {goal.category}
                  </span>
                </div>
                {goal.description && (
                  <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                )}
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 mt-4 sm:mt-0 whitespace-nowrap">
                <FilePenLine className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Edit Goal</span>
              </button>
            </div>
          </div>
        </div>
        
        <section className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-gray-700">Overall Progress</span>
            <div className="flex items-center gap-2">
              {isEditingProgress ? (
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-1 max-w-xs">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => setNewProgress(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${newProgress}%, #e5e7eb ${newProgress}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-indigo-600 min-w-[3rem]">{newProgress}%</span>
                  <div className="flex gap-1">
                    <button
                      onClick={updateProgress}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProgress(false);
                        setNewProgress(0);
                      }}
                      className="px-3 py-1 text-gray-600 text-xs rounded hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-base font-semibold text-indigo-600">{goal.progress}%</span>
                  <button
                    onClick={() => {
                      setIsEditingProgress(true);
                      setNewProgress(goal.progress);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit progress"
                  >
                    <FilePenLine className="w-4 h-4 text-gray-400" />
                  </button>
                </>
              )}
            </div>
          </div>
          <ProgressBar
            progress={goal.progress}
            barColor="bg-indigo-500"
            height="h-3"
          />
          <div className="mt-2 text-xs text-gray-500">
            Manual progress tracking - edit by clicking the pencil icon
          </div>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8">
          <div className="border border-slate-200 rounded-lg p-6">
            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-bold text-gray-800">{goal.progress}%</span>
              <span className="text-sm font-semibold text-green-500 ml-2">{progressChange}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Progress Overview</p>
            <div className="h-48 bg-slate-100 rounded flex items-center justify-center text-sm text-slate-500">
              Chart Placeholder
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Daily Check-ins</h3>
              {goal?.currentStreak && goal.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                  🔥 {goal.currentStreak} day streak
                </div>
              )}
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {goal?.checkinHistory && goal.checkinHistory.length > 0 ? (
                goal.checkinHistory
                  .slice(-5) // Show last 5 check-ins
                  .reverse() // Most recent first
                  .map((checkin: CheckinEntry) => (
                    <div key={checkin.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                      <CheckSquare2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 break-words">
                          {checkin.text}
                        </p>
                        <span className="text-xs text-gray-500">
                          {(() => {
                            try {
                              const date = checkin.timestamp ? new Date(checkin.timestamp) : new Date(checkin.date);
                              return !isNaN(date.getTime()) ? date.toLocaleDateString() : checkin.date;
                            } catch {
                              return checkin.date;
                            }
                          })()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => deleteCheckin(checkin.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all flex-shrink-0"
                        title="Delete check-in"
                      >
                        <X className="w-3 h-3 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No check-ins yet. Add your first check-in below!
                </div>
              )}
            </div>
            {isAddingMilestone ? (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={milestoneText}
                  onChange={(e) => setMilestoneText(e.target.value)}
                  placeholder="What did you accomplish today?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={addMilestone}
                    disabled={!milestoneText.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Add Check-in
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingMilestone(false);
                      setMilestoneText('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingMilestone(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 mt-6 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Check-in</span>
              </button>
            )}
          </div>
        </section>

        {/* Corrected Check-in History Section */}
        <section className="mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6">Check-in History</h2>
          <div className="space-y-6">
            {checkinHistory.map((checkin) => (
              <div key={checkin.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className={`p-2 rounded-full ${checkin.iconBg}`}>
                  {checkin.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-700 text-sm sm:text-base">{checkin.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{checkin.date}</p>
                </div>
                {/* Only show delete button for real check-ins (not demo data) */}
                {goal?.checkinHistory && (
                  <button
                    onClick={(e) => deleteCheckin(checkin.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all"
                    title="Delete check-in"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
        </main>
      </div>
    </>
  );
}
