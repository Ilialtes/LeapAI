// src/components/dashboard/GoalCard.tsx
import React from 'react';

interface GoalCardProps {
  icon: React.ReactNode; // Expect a lucide-react icon component instance
  title: string;
  dueDate: string;
  iconBgColor: string; // e.g., 'bg-blue-100'
  iconColor: string;   // e.g., 'text-blue-600'
}

const GoalCard: React.FC<GoalCardProps> = ({ icon, title, dueDate, iconBgColor, iconColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start">
      {/* Icon with colored background */}
      <div className={`p-3 rounded-full ${iconBgColor} mb-4`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${iconColor}` })}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mt-2 mb-1">
        {title}
      </h3>

      {/* Due Date */}
      <p className="text-sm text-gray-500">
        {dueDate}
      </p>
    </div>
  );
};

export default GoalCard;
