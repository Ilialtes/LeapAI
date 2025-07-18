"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProgressBar from '@/components/ui/ProgressBar';
import NewGoalModal from '@/components/modals/NewGoalModal';
import { useAuth } from '@/context/AuthProvider';
import { PlusCircle, Calendar, Target, X } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  dueDate: string;
  progress: number;
  category: string;
  status?: 'active' | 'warning' | 'expired' | 'completed';
}

const getGoalStatus = (dueDate: string, progress: number): 'active' | 'warning' | 'expired' | 'completed' => {
  if (progress >= 100) return 'completed';
  
  const today = new Date();
  const goalDueDate = new Date(dueDate);
  
  if (goalDueDate < today) return 'expired';
  
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
              My Goals
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Track your progress and achieve your dreams
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
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
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
            const status = getGoalStatus(goal.dueDate, goal.progress);
            const isExpired = status === 'expired';
            const isWarning = status === 'warning';
            const isCompleted = status === 'completed';
            
            return (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <div className={`border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  isExpired ? 'border-red-500 bg-red-50' : 
                  isWarning ? 'border-yellow-500 bg-yellow-50' :
                  isCompleted ? 'border-green-500 bg-green-50' : 
                  'border-blue-500 bg-blue-50'
                }`}>
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
                          isExpired ? 'bg-red-100 text-red-800' :
                          isWarning ? 'bg-yellow-100 text-yellow-800' :
                          isCompleted ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {isExpired ? 'Expired' : isWarning ? 'Due Soon' : isCompleted ? 'Completed' : 'Active'}
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

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Due: {goal.dueDate}</span>
                    {isExpired && <span className="ml-2 font-medium text-red-600">(Overdue)</span>}
                    {isWarning && <span className="ml-2 font-medium text-yellow-600">(Due Soon)</span>}
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        )}

        {!loading && goals.length === 0 && (
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
          onClose={() => setIsModalOpen(false)}
          onGoalCreated={handleGoalCreated}
        />
      </main>
    </div>
  );
}