'use client';

import React from 'react';

export const CosmicSkeletonCard: React.FC = () => {
  return (
    <div className="w-full max-w-sm mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-3xl bg-surface-200/60 border border-white/5 overflow-hidden p-4 flex flex-col justify-end space-y-3 relative skeleton-shimmer">
      <div className="space-y-2 relative z-10">
        <div className="h-6 w-3/4 bg-white/10 rounded-xl" />
        <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-purple-500/20 rounded-full" />
          <div className="h-6 w-20 bg-pink-500/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const CosmicSkeletonList: React.FC = () => {
  return (
    <div className="space-y-3 w-full p-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-2xl bg-surface-200/50 border border-white/5 skeleton-shimmer"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-28 bg-white/10 rounded-md" />
            <div className="h-3 w-40 bg-white/5 rounded-md" />
          </div>
          <div className="h-4 w-8 bg-purple-500/20 rounded-full" />
        </div>
      ))}
    </div>
  );
};

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
