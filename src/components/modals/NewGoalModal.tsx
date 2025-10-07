"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useAchievements } from '@/context/AchievementContext';
import { Target, Calendar, Tag, FileText, X } from 'lucide-react';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
  initialData?: {
    title: string;
    description: string;
    category: string;
  } | null;
}

export default function NewGoalModal({ isOpen, onClose, onGoalCreated, initialData }: NewGoalModalProps) {
  const { user } = useAuth();
  const { checkForNewAchievements, userData } = useAchievements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    dueDate: ''
  });

  const categories = [
    'Career',
    'Health',
    'Personal',
    'Business',
    'Education',
    'Relationships',
    'Financial',
    'Creative'
  ];

  // Update form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        dueDate: ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      dueDate: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      alert('You must be logged in to create a goal');
      return;
    }

    if (!formData.title || !formData.category || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userEmail: user.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      const result = await response.json();
      
      if (result.success) {
        // Track achievement for creating a goal
        checkForNewAchievements({
          totalGoals: userData.totalGoals + 1
        });

        resetForm();
        onGoalCreated();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold" style={{color: '#2E7D32'}}>Create New Goal</h2>
            <p className="text-sm mt-1" style={{color: '#546E7A'}}>Set a new goal and start your journey to success</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {initialData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <span>✨</span>
                We&apos;ve filled in some details based on your conversation. Feel free to adjust anything!
              </p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium mb-2" style={{color: '#2E7D32'}}>
              <Target className="w-4 h-4" />
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Learn React and Next.js"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium mb-2" style={{color: '#546E7A'}}>
              <FileText className="w-4 h-4" />
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you want to achieve..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="flex items-center gap-2 text-sm font-medium mb-2" style={{color: '#1565C0'}}>
                <Tag className="w-4 h-4" />
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="flex items-center gap-2 text-sm font-medium mb-2" style={{color: '#8D6E63'}}>
                <Calendar className="w-4 h-4" />
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors"
              style={{color: '#546E7A'}}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{backgroundColor: loading ? undefined : '#2E7D32'}}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1B5E20';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2E7D32';
              }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Create Goal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}