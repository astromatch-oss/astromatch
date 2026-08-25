'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { Sparkles, MessageCircle, Heart, Clock, Compass } from 'lucide-react';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { ZodiacSign } from '@/types/astrology';

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { matches } = useMatch();

  const myId = user?.uid || 'demo-user-1';

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Celestial Matches</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cosmic-purple/20 text-purple-300 border border-cosmic-purple/30 font-semibold">
              {matches.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Souls whose planetary placements align with your chart
          </p>
        </div>
        <Link
          href="/discover"
          className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">Stargaze</span>
        </Link>
      </div>

      {/* New Matches Row / Story Avatars */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Recent Planetary Connections
          </span>
          <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {matches.map((match) => {
              const partnerId = match.users.find((id) => id !== myId) || match.users[1];
              const partner = match.profiles[partnerId] || {
                firstName: 'Celestial Soul',
                photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
                sunSign: 'Pisces',
                age: 25,
              };

              return (
                <button
                  key={match.id}
                  onClick={() => router.push(`/chat?matchId=${encodeURIComponent(match.id)}`)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 bg-gradient-to-tr from-cosmic-purple via-cosmic-pink to-amber-300 group-hover:scale-105 transition-transform duration-200 shadow-cosmic">
                    <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-surface-300">
                      <Image
                        src={partner.photo}
                        alt={partner.firstName}
                        fill
                        className="object-cover pointer-events-none"
                        sizes="72px"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-white max-w-[70px] truncate">
                    {partner.firstName}
                  </span>
                  <span className="text-[10px] text-cosmic-purple -mt-1 font-semibold">
                    {partner.sunSign}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Conversations
        </span>

        {matches.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface-200/50 border border-white/5 text-center space-y-4">
            <Heart className="w-10 h-10 text-cosmic-pink mx-auto opacity-80" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No active matches yet</h3>
              <p className="text-xs text-text-secondary">
                Head to the Discover deck to like profiles and ignite cosmic matches!
              </p>
            </div>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cosmic-purple hover:bg-cosmic-violet text-white text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Stargazing Deck</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => {
              const partnerId = match.users.find((id) => id !== myId) || match.users[1];
              const partner = match.profiles[partnerId] || {
                firstName: 'Elena',
                photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
                sunSign: 'Pisces',
                age: 25,
              };

              const hasUnread = (match.unreadCount?.[myId] || 0) > 0;
              const lastMsgText = match.lastMessage?.text || 'Connected under the stars ✨';

              return (
                <button
                  key={match.id}
                  onClick={() => router.push(`/chat?matchId=${encodeURIComponent(match.id)}`)}
                  className="w-full text-left flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-surface-200/80 hover:bg-surface-100 border border-white/5 hover:border-cosmic-purple/40 transition-all duration-200 group focus:outline-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pointer-events-none">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/10">
                      <Image
                        src={partner.photo}
                        alt={partner.firstName}
                        fill
                        className="object-cover pointer-events-none"
                        sizes="56px"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-purple-300 transition-colors truncate">
                          {partner.firstName}, {partner.age}
                        </h4>
                        <AstrologyBadge sign={partner.sunSign as ZodiacSign} size="sm" />
                      </div>
                      <p className={`text-xs mt-1 truncate ${hasUnread ? 'text-white font-semibold' : 'text-text-secondary'}`}>
                        {lastMsgText}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pl-3 pointer-events-none">
                    <div className="flex items-center gap-1 text-[10px] text-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>Recent</span>
                    </div>

                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    )}

                    {match.compatibility && (
                      <span className="text-[11px] font-bold text-amber-300">
                        {match.compatibility.overallScore}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
