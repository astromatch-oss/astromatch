import React from 'react';
import dynamic from 'next/dynamic';
import { MOCK_DISCOVER_PROFILES } from '@/lib/mockData';
import { CosmicSkeletonList } from '@/components/ui/CosmicSkeleton';

const ChatScreen = dynamic(
  () => import('@/components/chat/ChatScreen').then((mod) => mod.ChatScreen),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 max-w-7xl mx-auto w-full h-[calc(100dvh-4rem)] p-4 flex gap-4">
        <div className="w-full md:w-80 lg:w-96 bg-surface-200/90 rounded-3xl p-4">
          <CosmicSkeletonList />
        </div>
        <div className="hidden md:flex flex-1 bg-surface-200/90 rounded-3xl p-8 items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-cosmic-purple/30 border-t-amber-300 animate-spin" />
        </div>
      </div>
    ),
  }
);

export function generateStaticParams() {
  const ids = [
    { id: 'match-elena-aria' },
    { id: 'match-lucas-aria' },
    { id: 'match-default' },
    ...MOCK_DISCOVER_PROFILES.map((p) => ({ id: `match-${p.userId}` })),
    ...MOCK_DISCOVER_PROFILES.map((p) => ({ id: p.userId })),
  ];
  return ids;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  return <ChatScreen initialMatchId={params.id} />;
}
