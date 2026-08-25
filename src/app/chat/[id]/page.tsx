import React from 'react';
import { ChatScreen } from '@/components/chat/ChatScreen';
import { MOCK_DISCOVER_PROFILES } from '@/lib/mockData';

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
