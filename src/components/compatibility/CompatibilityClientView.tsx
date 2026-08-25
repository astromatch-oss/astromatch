'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { MOCK_DISCOVER_PROFILES } from '@/lib/mockData';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { ZODIAC_SIGNS } from '@/lib/astrology/zodiacData';
import { CompatibilityMeter } from '@/components/astrology/CompatibilityMeter';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import {
  Sparkles,
  ArrowLeft,
  Heart,
  MessageCircle,
  Compass,
} from 'lucide-react';
import { ZodiacSign } from '@/types/astrology';

export function CompatibilityClientView({ targetUserId }: { targetUserId: string }) {
  const { profile: myProfile } = useAuth();

  // Find target profile
  const partnerProfile = MOCK_DISCOVER_PROFILES.find((p) => p.userId === targetUserId) || MOCK_DISCOVER_PROFILES[0];
  const userA = myProfile || {
    firstName: 'You',
    sunSign: 'Scorpio' as ZodiacSign,
    moonSign: 'Pisces' as ZodiacSign,
    risingSign: 'Sagittarius' as ZodiacSign,
    venusSign: 'Scorpio' as ZodiacSign,
    marsSign: 'Capricorn' as ZodiacSign,
  };

  const synastry = astrologyService.calculateSynastry(userA, partnerProfile);

  const signA = ZODIAC_SIGNS[(userA.sunSign as ZodiacSign) || 'Scorpio'];
  const signB = ZODIAC_SIGNS[partnerProfile.sunSign] || ZODIAC_SIGNS['Pisces'];

  const photoA = getOptimizedImageUrl(
    myProfile?.profilePhotos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    { width: 128, quality: 75 }
  );

  const photoB = getOptimizedImageUrl(
    partnerProfile.profilePhotos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    { width: 128, quality: 75 }
  );

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/matches"
          className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cosmic-purple/15 text-purple-300 border border-cosmic-purple/30 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-amber-300" />
          <span>Synastry Analysis</span>
        </div>
      </div>

      {/* Hero Comparison Card */}
      <div className="bg-surface-200/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {/* User A */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden relative border-2 border-cosmic-purple shadow-cosmic">
              <Image
                src={photoA}
                alt={myProfile?.firstName || 'You'}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <h3 className="font-bold text-white text-base">{myProfile?.firstName || 'You'}</h3>
            <AstrologyBadge sign={userA.sunSign as any} label="Sun" size="sm" />
          </div>

          {/* Center Synergy Ring */}
          <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-surface-300/80 border border-white/10 shadow-inner">
            <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {synastry.overallScore}%
            </span>
            <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
              Celestial Resonance
            </span>
          </div>

          {/* User B */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden relative border-2 border-cosmic-pink shadow-cosmic-rose">
              <Image
                src={photoB}
                alt={partnerProfile.firstName}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <h3 className="font-bold text-white text-base">{partnerProfile.firstName}</h3>
            <AstrologyBadge sign={partnerProfile.sunSign} label="Sun" size="sm" />
          </div>
        </div>

        <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
          {synastry.summary}
        </p>

        {/* CTA to chat */}
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href={`/chat`}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold text-sm shadow-cosmic hover:opacity-90 transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with {partnerProfile.firstName}</span>
          </Link>
        </div>
      </div>

      {/* Detailed Planetary Aspects Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Sun & Element Harmony */}
        <div className="p-5 rounded-3xl bg-surface-200/70 border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Sun & Elemental Dynamics</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {signA.name} ({signA.element}) meets {signB.name} ({signB.element}). When these two elements merge,
            they foster deep mutual validation and natural flow in shared life goals.
          </p>
          <div className="flex gap-2 pt-1">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-surface-100 text-amber-300 border border-white/5">
              {signA.element} + {signB.element} Chemistry
            </span>
          </div>
        </div>

        {/* Moon & Emotional Resonance */}
        <div className="p-5 rounded-3xl bg-surface-200/70 border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-sm">Emotional Vulnerability (Moon Signs)</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Emotional wavelengths align seamlessly. Both charts possess intuitive antennae that sense each other&apos;s moods before words are spoken.
          </p>
          <div className="flex gap-2 pt-1">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-surface-100 text-rose-300 border border-white/5">
              Emotional Depth: 95%
            </span>
          </div>
        </div>
      </div>

      {/* Compatibility Score Component */}
      <CompatibilityMeter compatibility={synastry} showBreakdown={true} />
    </div>
  );
}
