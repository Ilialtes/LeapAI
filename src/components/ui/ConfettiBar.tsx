// src/components/ui/ConfettiBar.tsx
import React from 'react';

interface DotProps {
  color: string; // Tailwind CSS background color class e.g., 'bg-red-400'
}

const Dot: React.FC<DotProps> = ({ color }) => {
  return <div className={`w-2 h-2 rounded-full ${color} animate-pulse`}></div>;
};

const ConfettiBar: React.FC = () => {
  const confettiColors = [
    'bg-pink-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400',
    'bg-purple-400', 'bg-orange-400', 'bg-teal-400', 'bg-red-400'
  ];

  // Create a long array of dots to ensure it covers wider screens and repeats.
  // Adjust 'numberOfSets' for density/length.
  const numberOfSets = 10;
  const dots = Array.from({ length: confettiColors.length * numberOfSets }).map((_, index) => (
    <Dot key={index} color={confettiColors[index % confettiColors.length]} />
  ));

  return (
    <div
      className="fixed top-0 left-0 w-full h-8 sm:h-10 bg-transparent overflow-hidden z-50 pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center">
        {/* This div will animate the confetti from right to left */}
        <div className="w-max flex items-center gap-2 sm:gap-3 animate-marquee">
          {dots}
          {/* Duplicate dots for seamless looping with marquee animation */}
          {dots}
        </div>
      </div>
      {/*
        Tailwind animation for 'marquee' needs to be defined in tailwind.config.js.
        Example for tailwind.config.js:
        theme: {
          extend: {
            animation: {
              marquee: 'marquee 30s linear infinite',
            },
            keyframes: {
              marquee: {
                '0%': { transform: 'translateX(0%)' },
                '100%': { transform: 'translateX(-50%)' }, // translateX(-50%) because we duplicate children
              },
            },
          },
        },
      */}
    </div>
  );
};

export default ConfettiBar;
