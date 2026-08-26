import React from 'react';
import { CosmicSpinner } from '@/components/ui/CosmicSkeleton';

export default function Loading() {
  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <CosmicSpinner text="Aligning celestial coordinates..." />
    </div>
  );
}
