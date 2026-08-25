import React from 'react';
import { MOCK_DISCOVER_PROFILES } from '@/lib/mockData';
import { ProfileClientView } from '@/components/profile/ProfileClientView';

export function generateStaticParams() {
  return MOCK_DISCOVER_PROFILES.map((p) => ({ id: p.userId }));
}

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  return <ProfileClientView targetId={params.id} />;
}
