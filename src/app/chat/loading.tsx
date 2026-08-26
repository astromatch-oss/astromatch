import React from 'react';
import { CosmicSkeletonList } from '@/components/ui/CosmicSkeleton';

export default function ChatLoading() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full h-[calc(100dvh-4rem)] p-2 sm:p-4 flex gap-4">
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden p-3">
        <CosmicSkeletonList />
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl">
        <div className="w-10 h-10 rounded-full border-2 border-cosmic-purple/40 border-t-amber-300 animate-spin" />
      </div>
    </div>
  );
}
