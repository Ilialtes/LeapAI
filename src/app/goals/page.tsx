"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProgressBar from '@/components/ui/ProgressBar';
import NewGoalModal from '@/components/modals/NewGoalModal';
import GoalSparkCoach from '@/components/GoalSparkCoach';
import { useAuth } from '@/context/AuthProvider';
import { useSearchParams } from 'next/navigation';
import { PlusCircle, Calendar, Target, X, Lightbulb, Play, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Goal {
  id: string;
  title: string;
  dueDate: string;
  progress: number;
  category: string;
  status?: 'active' | 'warning' | 'expired' | 'completed';
}

const getGoalStatus = (dueDate: string, progress: number): 'active' | 'warning' | 'in-progress' | 'completed' => {
  if (progress >= 100) return 'completed';

  const today = new Date();
  const goalDueDate = new Date(dueDate);

  // Changed: expired goals are now "in-progress" (neutral, shame-free)
  if (goalDueDate < today) return 'in-progress';

  // Check if goal is expiring within 7 days
  const diffTime = goalDueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 3 && diffDays > 0) return 'warning';

  return 'active';
};

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showGoalSpark, setShowGoalSpark] = useState(false);
  const [prefilledGoalData, setPrefilledGoalData] = useState<{
    title: string;
    description: string;
    category: string;
  } | null>(null);

  // Check if spark mode is enabled via URL parameter
  useEffect(() => {
    if (searchParams.get('spark') === 'true') {
      setShowGoalSpark(true);
    }

    // Check if user wants to save a task as a goal
    const savedTask = searchParams.get('saveTask');
    if (savedTask) {
      const decodedTask = decodeURIComponent(savedTask);
      setPrefilledGoalData({
        title: decodedTask,
        description: 'A small step towards my goals',
        category: 'Personal'
      });
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchGoals = async () => {
    console.log('fetchGoals called, user email:', user?.email);
    
    if (!user?.email) {
      console.log('No user email, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching goals for user:', user.email);
      const response = await fetch(`/api/goals?userEmail=${encodeURIComponent(user.email)}`);
      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch response data:', data);
        
        if (data.success) {
          console.log('Setting goals:', data.goals);
          setGoals(data.goals || []);
        } else {
          console.error('API returned success: false', data);
          setGoals([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Fetch error response:', errorText);
        setGoals([]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = () => {
    fetchGoals();
    setShowGoalSpark(false);
  };

  const handleGoalSparkSelection = (goalData: {
    title: string;
    description: string;
    category: string;
  }) => {
    setPrefilledGoalData(goalData);
    setShowGoalSpark(false);
    setIsModalOpen(true);
  };

  const seedSampleGoals = async () => {
    console.log('Seed button clicked, user email:', user?.email);
    
    if (!user?.email) {
      console.error('No user email found!');
      return;
    }
    
    try {
      console.log('Making seed request...');
      const response = await fetch('/api/goals/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
          fetchGoals(); // Refresh goals list
          console.log('Sample goals added successfully!');
        } else {
          console.error('Failed to add sample goals:', result.error || 'Unknown error');
        }
      } else {
        const errorText = await response.text();
        console.error('Response error:', errorText);
      }
    } catch (error) {
      console.error('Error seeding goals:', error);
    }
  };

  const deleteGoal = async (goalId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to goal detail
    e.stopPropagation();
    
    if (!user?.email) return;
    
    try {
      console.log('Deleting goal:', goalId);
      const response = await fetch(`/api/goals?goalId=${goalId}&userEmail=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchGoals(); // Refresh goals list
        } else {
          console.error('Failed to delete goal:', result.error || 'Unknown error');
        }
      } else {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      <main className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-10 my-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {showGoalSpark ? 'Goal Workshop' : 'My Goals'}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              {showGoalSpark ? 'Let\'s find a goal that feels right for you' : 'Track your progress and achieve your dreams'}
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {showGoalSpark && (
              <button
                onClick={() => setShowGoalSpark(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm whitespace-nowrap"
              >
                Back to Goals
              </button>
            )}
            {!showGoalSpark && (
              <>
                <button
                  onClick={() => setShowGoalSpark(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 whitespace-nowrap"
                  title="Feeling stuck? Let's find a goal"
                >
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Need Help?</span>
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={seedSampleGoals}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>🌱</span>
                    <span>Seed Goals</span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>New Goal</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Goal Spark Coach - Shows when spark=true */}
        {showGoalSpark && (
          <GoalSparkCoach onGoalSelected={handleGoalSparkSelection} />
        )}

        {!showGoalSpark && loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : !showGoalSpark ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
            const status = getGoalStatus(goal.dueDate, goal.progress);
            const isInProgress = status === 'in-progress';
            const isWarning = status === 'warning';
            const isCompleted = status === 'completed';

            return (
              <div key={goal.id} className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                isInProgress ? 'border-gray-300 bg-gray-50' :
                isWarning ? 'border-yellow-500 bg-yellow-50' :
                isCompleted ? 'border-green-500 bg-green-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <Link href={`/goals/${goal.id}`} className="block">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-800">
                        {goal.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded">
                          {goal.category}
                        </span>
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                          isInProgress ? 'bg-gray-100 text-gray-600' :
                          isWarning ? 'bg-yellow-100 text-yellow-800' :
                          isCompleted ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {isInProgress ? 'In Progress' : isWarning ? 'Due Soon' : isCompleted ? 'Completed' : 'Active'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-gray-400" />
                      <button
                        onClick={(e) => deleteGoal(goal.id, e)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors group"
                        title="Delete goal"
                      >
                        <X className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-indigo-600">{goal.progress}%</span>
                    </div>
                    <ProgressBar
                      progress={goal.progress}
                      barColor="bg-indigo-500"
                      height="h-2"
                    />
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Due: {goal.dueDate}</span>
                    {isWarning && <span className="ml-2 font-medium text-yellow-600">(Due Soon)</span>}
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Let Focus Room extract time from task text
                      router.push(`/focus-room?task=${encodeURIComponent(goal.title)}`);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    title="Start working on this goal"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/goals/${goal.id}`);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    title="View and edit goal details"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        ) : null}

        {!showGoalSpark && !loading && goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No goals yet</h3>
            <p className="text-gray-500 mb-6">Start your journey by creating your first goal</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 mx-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Goal</span>
            </button>
          </div>
        )}

        <NewGoalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPrefilledGoalData(null);
          }}
          onGoalCreated={handleGoalCreated}
          initialData={prefilledGoalData}
        />
      </main>
    </div>
  );
}