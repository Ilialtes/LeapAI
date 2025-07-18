"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import ProgressBar from '@/components/ui/ProgressBar';
import { Target, Star } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string;
  progress: number;
  priorityScore?: number;
}

export default function TopGoalsSection() {
  const [topGoals, setTopGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTopGoals = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/goals/top?userEmail=${encodeURIComponent(user.email)}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTopGoals(data.goals);
        }
      }
    } catch (error) {
      console.error('Error fetching top goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopGoals();
  }, [user?.email]);

  const getGoalStatus = (dueDate: string, progress: number) => {
    if (progress >= 100) return 'completed';
    
    const today = new Date();
    const goalDueDate = new Date(dueDate);
    
    if (goalDueDate < today) return 'expired';
    
    const diffTime = goalDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3 && diffDays > 0) return 'warning';
    
    return 'active';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (topGoals.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">No goals yet. Create your first goal to get started!</p>
        <Link href="/goals" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Create Goal
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topGoals.map((goal, index) => {
        const status = getGoalStatus(goal.dueDate, goal.progress);
        return (
          <Link key={goal.id} href={`/goals/${goal.id}`}>
            <div className={`p-6 rounded-xl hover:shadow-md transition-all cursor-pointer relative border ${
              status === 'expired' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
              status === 'warning' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
              status === 'completed' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
              'border-blue-200 bg-blue-50 hover:bg-blue-100'
            }`}>
              {/* Priority indicator */}
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              )}
              
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{goal.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-white bg-opacity-80 text-gray-700 px-2 py-1 rounded">
                    {goal.category}
                  </span>
                  {goal.priorityScore && (
                    <span className="text-xs text-gray-600">
                      Score: {Math.round(goal.priorityScore)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Due: {goal.dueDate}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{goal.progress}%</span>
                </div>
                <ProgressBar
                  progress={goal.progress}
                  barColor={
                    status === 'expired' ? 'bg-red-500' :
                    status === 'warning' ? 'bg-yellow-500' :
                    status === 'completed' ? 'bg-green-500' :
                    'bg-blue-500'
                  }
                  height="h-2"
                />
              </div>
              
              <div className="mt-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  status === 'expired' ? 'bg-red-200 text-red-800' :
                  status === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                  status === 'completed' ? 'bg-green-200 text-green-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {status === 'expired' ? 'Overdue' : 
                   status === 'warning' ? 'Due Soon' : 
                   status === 'completed' ? 'Completed' :
                   'Active'}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}