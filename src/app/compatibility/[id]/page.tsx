import React from 'react';
import { MOCK_DISCOVER_PROFILES } from '@/lib/mockData';
import { CompatibilityClientView } from '@/components/compatibility/CompatibilityClientView';

export function generateStaticParams() {
  return MOCK_DISCOVER_PROFILES.map((p) => ({ id: p.userId }));
}

export default function CompatibilityPage({ params }: { params: { id: string } }) {
  return <CompatibilityClientView targetUserId={params.id} />;
}
