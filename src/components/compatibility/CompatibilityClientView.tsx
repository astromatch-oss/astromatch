'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { MOCK_DISCOVER_PROFILES } from '@/lib/mockData';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { ZODIAC_SIGNS } from '@/lib/astrology/zodiacData';
import {
  calculateCompositeDestiny,
  CompositeDestinyResult,
} from '@/lib/astrology/compositeAndTransits';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import {
  Sparkles,
  ArrowLeft,
  Heart,
  MessageCircle,
  Compass,
  Crown,
  Lock,
  Flame,
} from 'lucide-react';
import { ZodiacSign } from '@/types/astrology';

const CompatibilityMeter = dynamic(
  () => import('@/components/astrology/CompatibilityMeter').then((mod) => mod.CompatibilityMeter),
  { ssr: false }
);

const CheckoutModal = dynamic(
  () => import('@/components/subscription/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);

export function CompatibilityClientView({ targetUserId }: { targetUserId: string }) {
  const { profile: myProfile, subscriptionTier, isDemoMode } = useAuth();
  const isVip = subscriptionTier === 'vip' || isDemoMode;
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Find target profile
  const partnerProfile =
    MOCK_DISCOVER_PROFILES.find((p) => p.userId === targetUserId) || MOCK_DISCOVER_PROFILES[0];

  const userA = myProfile || {
    firstName: 'You',
    sunSign: 'Scorpio' as ZodiacSign,
    moonSign: 'Pisces' as ZodiacSign,
    risingSign: 'Sagittarius' as ZodiacSign,
    venusSign: 'Scorpio' as ZodiacSign,
    marsSign: 'Capricorn' as ZodiacSign,
  };

  const synastry = astrologyService.calculateSynastry(userA, partnerProfile);
  const compositeDestiny: CompositeDestinyResult = calculateCompositeDestiny(userA, partnerProfile);

  const signA = ZODIAC_SIGNS[(userA.sunSign as ZodiacSign) || 'Scorpio'];
  const signB = ZODIAC_SIGNS[partnerProfile.sunSign] || ZODIAC_SIGNS['Pisces'];

  const photoA = getOptimizedImageUrl(
    myProfile?.profilePhotos?.[0] ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    { width: 128, quality: 75 }
  );

  const photoB = getOptimizedImageUrl(
    partnerProfile.profilePhotos?.[0] ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    { width: 128, quality: 75 }
  );

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6 animate-in fade-in">
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

      {/* Feature 2: Composite Destiny Entity (Relationship Archetype Card) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/30 via-surface-200 to-amber-900/20 border-2 border-amber-400/40 space-y-4 shadow-cosmic-gold relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <span>{compositeDestiny.archetypeSymbol}</span>
            <span>Relationship Archetype</span>
          </div>

          <span className="text-xs text-purple-300 font-medium">
            {compositeDestiny.elementalBlend}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {compositeDestiny.archetype}
          </h2>
          <p className="text-xs sm:text-sm text-amber-300 font-semibold">
            {compositeDestiny.archetypeTagline}
          </p>
        </div>

        {/* 2-Sentence Dynamic AI Relationship Forecast */}
        <div className="p-4 rounded-2xl bg-surface-100/90 border border-white/10 text-xs sm:text-sm text-white leading-relaxed space-y-1">
          <span className="font-bold text-amber-300 block text-xs uppercase tracking-wider">
            ✨ AI Composite Destiny Forecast:
          </span>
          <p className="italic text-text-secondary leading-relaxed">{compositeDestiny.aiForecast}</p>
        </div>

        {/* Strengths Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {compositeDestiny.coreStrengths.map((str, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-xl bg-surface-100 border border-white/10 text-xs font-semibold text-purple-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{str}</span>
            </span>
          ))}
        </div>

        {/* Deep Composite Planetary Placements (VIP Gate vs Unlocked) */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Deep Composite Planetary Placements</span>
            </h3>
            {isVip ? (
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                VIP Full Analysis
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-surface-100 text-purple-300 border border-white/10">
                🔒 VIP Protected
              </span>
            )}
          </div>

          {isVip ? (
            <div className="space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {compositeDestiny.compositePlanets.map((planet, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-100 border border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <span className="text-amber-300 font-mono text-sm">{planet.symbol}</span>
                        <span>{planet.planet}</span>
                      </span>
                      <AstrologyBadge sign={planet.sign} size="sm" />
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {planet.meaning}
                    </p>
                  </div>
                ))}
              </div>

              {/* Karmic Evolution Lesson */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-1 text-xs">
                <span className="font-bold text-purple-300 text-xs uppercase tracking-wider block">
                  🌌 Karmic Evolution Lesson:
                </span>
                <p className="text-text-secondary leading-relaxed">
                  {compositeDestiny.karmicLesson}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative py-6 px-4 rounded-2xl bg-surface-100/90 border border-amber-400/30 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mx-auto shadow-cosmic">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-white">
                  Unlock Complete Composite Planetary Analysis
                </h4>
                <p className="text-xs text-text-secondary">
                  AstroMatch VIP members unlock the complete 4-point composite chart, midpoint houses, and karmic evolution lessons for this relationship.
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-surface-400 font-extrabold text-xs shadow-cosmic hover:opacity-95 transition-all hover:scale-105"
              >
                Unlock VIP Composite Blueprint
              </button>
            </div>
          )}
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

      {/* Compatibility Score Component (Lazy Loaded) */}
      <CompatibilityMeter compatibility={synastry} showBreakdown={true} />

      {/* VIP Checkout Paywall Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          tier="vip"
          billingCycle="yearly"
          price="$239.88"
          onSuccess={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
