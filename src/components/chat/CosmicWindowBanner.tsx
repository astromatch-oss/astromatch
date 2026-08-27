'use client';

import React, { useState } from 'react';
import { UserProfile, SubscriptionTier } from '@/types/user';
import {
  calculateCosmicWindow,
  CosmicWindowResult,
} from '@/lib/astrology/compositeAndTransits';
import {
  Sparkles,
  Crown,
  Lock,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  CheckCircle2,
  Heart,
} from 'lucide-react';

interface CosmicWindowBannerProps {
  currentUser: Partial<UserProfile>;
  partner: Partial<UserProfile>;
  subscriptionTier: SubscriptionTier;
  isDemoMode?: boolean;
  onUnlockVip: () => void;
}

export const CosmicWindowBanner: React.FC<CosmicWindowBannerProps> = ({
  currentUser,
  partner,
  subscriptionTier,
  isDemoMode = false,
  onUnlockVip,
}) => {
  const isVip = subscriptionTier === 'vip' || isDemoMode;
  const [isExpanded, setIsExpanded] = useState(false);

  const windowData: CosmicWindowResult = calculateCosmicWindow(currentUser, partner);

  return (
    <div className="w-full px-3 sm:px-4 pt-2 pb-1 z-10 animate-in fade-in duration-200">
      <div
        className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
          isVip
            ? 'bg-gradient-to-r from-amber-500/15 via-purple-600/15 to-pink-500/15 border-amber-400/40 shadow-cosmic-gold'
            : 'bg-surface-100/90 border-white/10 hover:border-amber-400/30'
        }`}
      >
        {/* Main Bar */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isVip
                  ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-surface-400 shadow-md'
                  : 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
              }`}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white tracking-tight truncate">
                  Cosmic Window
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{windowData.resonanceScore}% Optimal</span>
                </span>
                {isVip ? (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                    <Crown className="w-2.5 h-2.5" /> VIP Unlocked
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                    <Lock className="w-2.5 h-2.5" /> VIP Feature
                  </span>
                )}
              </div>

              <p className="text-[11px] text-text-secondary truncate mt-0.5">
                {isVip
                  ? `Peak date window: ${windowData.optimalTime}`
                  : 'Cosmic Window active — Upgrade to AstroMatch VIP to unlock peak date timing & transit analysis.'}
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isVip ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2.5 py-1.5 rounded-xl bg-surface-200/80 hover:bg-surface-50 border border-white/10 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Toggle transit details"
              >
                <span>{isExpanded ? 'Hide' : 'View Timing'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <button
                onClick={onUnlockVip}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-surface-400 font-extrabold text-[11px] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <Crown className="w-3 h-3" />
                <span>Unlock Timing</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded VIP Transit Breakdown */}
        {isVip && isExpanded && (
          <div className="px-3 sm:px-4 pb-3.5 pt-1 border-t border-white/10 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-200/80 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Optimal Scheduling Window</span>
                </div>
                <p className="text-white font-semibold">{windowData.optimalTime}</p>
                <p className="text-[10px] text-text-secondary">
                  Primary Aspect: <span className="text-purple-300">{windowData.primaryAspect}</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-200/80 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Romantic Chemistry & Vibe</span>
                </div>
                <p className="text-white font-semibold">{windowData.romanticVibe}</p>
                <p className="text-[10px] text-text-secondary line-clamp-1">
                  {windowData.activeTransits[0]?.recommendedActivity}
                </p>
              </div>
            </div>

            {/* Advice summary */}
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-text-secondary leading-relaxed">
              <span className="font-bold text-purple-300">✨ Celestial Strategy: </span>
              {windowData.celestialAdvice}
            </div>

            {/* Active Transits Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Active Planetary Aspects
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {windowData.activeTransits.map((transit) => (
                  <div
                    key={transit.id}
                    className="p-2 rounded-xl bg-surface-200/60 border border-white/5 space-y-0.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{transit.planetaryPair}</span>
                      <span className="text-amber-300 text-[10px]">{transit.alignmentRating}%</span>
                    </div>
                    <p className="text-[10px] text-text-muted truncate">{transit.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
