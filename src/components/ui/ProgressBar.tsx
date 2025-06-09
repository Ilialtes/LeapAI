// src/components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  progress: number; // Percentage, 0 to 100
  barColor?: string; // Optional: Tailwind CSS class for the bar color, e.g., 'bg-green-500'
  bgColor?: string;  // Optional: Tailwind CSS class for the background track color, e.g., 'bg-gray-200'
  height?: string;   // Optional: Tailwind CSS class for height, e.g., 'h-2.5'
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  barColor = 'bg-green-500',
  bgColor = 'bg-gray-200',
  height = 'h-2.5'
}) => {
  const progressValue = Math.max(0, Math.min(100, progress)); // Ensure progress is between 0 and 100

  return (
    <div className={`w-full ${bgColor} rounded-full ${height} dark:bg-gray-700`}>
      <div
        className={`${barColor} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${progressValue}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
