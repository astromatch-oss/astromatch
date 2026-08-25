'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import {
  Sparkles,
  Compass,
  Heart,
  Moon,
  Shield,
  UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { matches, discoverProfiles } = useMatch();

  const sunSign = profile?.sunSign || 'Scorpio';
  const dailyTransit = astrologyService.getDailyTransitForecast(sunSign);
  const avatarPhoto = getOptimizedImageUrl(
    profile?.profilePhotos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    { width: 128, quality: 75 }
  );

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden relative border-2 border-cosmic-purple shadow-cosmic flex-shrink-0">
            <Image
              src={avatarPhoto}
              alt={profile?.firstName || 'User'}
              fill
              className="object-cover"
              sizes="88px"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Greetings, {profile?.firstName || 'Stargazer'}
              </h1>
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              <AstrologyBadge sign={sunSign} label="Sun" size="sm" />
              {profile?.moonSign && (
                <AstrologyBadge sign={profile.moonSign} label="Moon" size="sm" />
              )}
              {profile?.risingSign && (
                <AstrologyBadge sign={profile.risingSign} label="Rising" size="sm" />
              )}
            </div>
          </div>
        </div>

        <Link
          href="/discover"
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white text-sm font-semibold shadow-cosmic hover:opacity-90 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Launch Discover Deck</span>
        </Link>
      </div>

      {/* Daily Cosmic Forecast Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-surface-100 via-surface-200 to-surface-100 border border-cosmic-purple/30 shadow-cosmic space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300">
            <Moon className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Celestial Forecast</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-300 text-purple-300 border border-white/5 font-medium">
            {dailyTransit.aspect}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {dailyTransit.headline}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-surface-300/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-text-muted uppercase font-bold">Romantic Frequency</span>
            <p className="text-xs font-semibold text-rose-300">{dailyTransit.romanticEnergy}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-300/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-text-muted uppercase font-bold">Dominant Element</span>
            <p className="text-xs font-semibold text-cyan-300">{dailyTransit.elementFocus} Element Focus</p>
          </div>
        </div>
      </div>

      {/* Quick Metrics & Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/matches"
          className="p-5 rounded-3xl bg-surface-200/80 hover:bg-surface-100 border border-white/10 space-y-2 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Heart className="w-6 h-6 text-cosmic-pink" />
            <span className="text-2xl font-bold text-white">{matches.length}</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Active Matches</h4>
            <p className="text-xs text-text-secondary mt-0.5">Aligned astrological connections</p>
          </div>
        </Link>

        <Link
          href="/discover"
          className="p-5 rounded-3xl bg-surface-200/80 hover:bg-surface-100 border border-white/10 space-y-2 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Compass className="w-6 h-6 text-amber-300" />
            <span className="text-2xl font-bold text-white">{discoverProfiles.length}</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Profiles In Orbit</h4>
            <p className="text-xs text-text-secondary mt-0.5">Ready for discovery</p>
          </div>
        </Link>

        <Link
          href="/settings"
          className="p-5 rounded-3xl bg-surface-200/80 hover:bg-surface-100 border border-white/10 space-y-2 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Verified
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Profile Sanctuary</h4>
            <p className="text-xs text-text-secondary mt-0.5">Safety & Privacy Settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
