'use client';

import React from 'react';

export const CosmicSpinner: React.FC<{ text?: string }> = ({ text = 'Aligning the cosmos...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-cosmic-purple/30" />
        <div className="absolute inset-0 rounded-full border-2 border-t-amber-300 border-r-cosmic-pink border-b-transparent border-l-transparent animate-spin" />
      </div>
      {text && (
        <span className="text-xs font-semibold text-text-secondary tracking-wider uppercase animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};
