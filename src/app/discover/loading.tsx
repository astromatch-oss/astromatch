import React from 'react';
import { CosmicSkeletonCard } from '@/components/ui/CosmicSkeleton';

export default function DiscoverLoading() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <CosmicSkeletonCard />
    </div>
  );
}
