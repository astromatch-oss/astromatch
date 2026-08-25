'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { useChat } from '@/context/ChatContext';
import { Sparkles, MessageCircle, Heart, Compass, Crown, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, subscriptionTier } = useAuth();
  const { matches } = useMatch();
  const { unreadTotalCount } = useChat();

  // If user is not logged in or in onboarding/admin, hide bottom nav
  if (!user || pathname === '/onboarding') return null;

  const unreadMatchesCount = matches.reduce((acc, m) => {
    const myUnread = m.unreadCount?.[user.uid] || 0;
    return acc + (myUnread > 0 ? 1 : 0);
  }, 0);

  const displayBadge = unreadTotalCount > 0 ? unreadTotalCount : unreadMatchesCount;

  const tabs = [
    { href: '/discover', label: 'Discover', icon: Sparkles },
    { href: '/chat', label: 'Chat', icon: MessageCircle, badge: displayBadge },
    { href: '/matches', label: 'Matches', icon: Heart },
    { href: '/dashboard', label: 'Celestial', icon: Compass },
    { href: '/pricing', label: subscriptionTier === 'vip' ? 'VIP' : 'Premium', icon: Crown, highlight: true },
    { href: '/settings', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-300/95 backdrop-blur-2xl border-t border-border/80 px-1 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[50px] min-h-[48px] ${
                isActive
                  ? 'text-cosmic-purple scale-105 font-semibold'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'stroke-[2.5px] text-cosmic-purple'
                      : tab.highlight && subscriptionTier !== 'vip'
                      ? 'text-amber-300'
                      : ''
                  }`}
                />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[55px]">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-cosmic-purple mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
