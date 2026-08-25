'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { UserProfile } from '@/types/user';
import { AstrologicalElement } from '@/types/astrology';
import { ZODIAC_SIGNS } from '@/lib/astrology/zodiacData';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { DiscoverCard } from '@/components/discover/DiscoverCard';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { CompatibilityMeter } from '@/components/astrology/CompatibilityMeter';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import {
  Sparkles,
  RefreshCw,
  Compass,
  Heart,
  LogIn,
  LayoutGrid,
  Layers,
  X,
  Flame,
  Droplets,
  Wind,
  Mountain,
} from 'lucide-react';

// Lazy load modals for reduced mobile bundle weight
const MatchModal = dynamic(
  () => import('@/components/discover/MatchModal').then((mod) => mod.MatchModal),
  { ssr: false }
);

const ReportModal = dynamic(
  () => import('@/components/safety/ReportModal').then((mod) => mod.ReportModal),
  { ssr: false }
);

export default function DiscoverPage() {
  const { user, profile: currentUserProfile, loginAsDemoUser } = useAuth();
  const {
    currentProfile,
    discoverProfiles,
    currentProfileIndex,
    likeProfile,
    passProfile,
    newMatchModalData,
    closeMatchModal,
    reportProfile,
    refreshDiscover,
  } = useMatch();

  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [elementFilter, setElementFilter] = useState<'All' | AstrologicalElement>('All');
  const [reportingProfile, setReportingProfile] = useState<UserProfile | null>(null);

  // Keyboard navigation for Tinder-style swiping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'deck' || !currentProfile) return;
      if (e.key === 'ArrowLeft') {
        passProfile(currentProfile);
      } else if (e.key === 'ArrowRight') {
        likeProfile(currentProfile, 'like');
      } else if (e.key === 'ArrowUp') {
        likeProfile(currentProfile, 'superlike');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentProfile, passProfile, likeProfile]);

  // Next card in stack for 3D depth effect
  const nextProfile = discoverProfiles[currentProfileIndex + 1];

  // Filtered profiles for Grid mode
  const gridProfiles = discoverProfiles.filter((p) => {
    if (elementFilter === 'All') return true;
    const signInfo = ZODIAC_SIGNS[p.sunSign];
    return signInfo?.element === elementFilter;
  });

  // If user is unauthenticated, show demo entrance
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-cosmic-purple/20 border border-cosmic-purple/40 text-cosmic-purple flex items-center justify-center mx-auto shadow-cosmic">
            <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Unlock Your Celestial Deck</h2>
            <p className="text-sm text-text-secondary">
              Sign in or test with instant demo mode to browse verified astrological matches.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={loginAsDemoUser}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-400 hover:opacity-95 text-white font-semibold text-sm shadow-cosmic transition-all"
            >
              Enter Instant Demo Mode
            </button>
            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-surface-100 hover:bg-surface-50 text-white font-medium text-sm border border-white/10 flex items-center justify-center gap-2 transition-colors block"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-4 sm:py-6 max-w-5xl mx-auto w-full space-y-4">
      {/* Top Header & View Controls */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cosmic-purple animate-spin-slow" />
          <h1 className="text-lg font-bold text-white tracking-tight">Cosmic Discovery</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-text-muted border border-white/5">
            {discoverProfiles.length - currentProfileIndex > 0
              ? `${discoverProfiles.length - currentProfileIndex} souls nearby`
              : 'End of deck'}
          </span>
        </div>

        {/* View Switcher: Card Deck vs Grid */}
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('deck')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'deck'
                  ? 'bg-cosmic-purple text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
              title="Swipe Deck View"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Deck</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-cosmic-purple text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
              title="Celestial Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          <button
            onClick={refreshDiscover}
            className="p-2 rounded-xl text-text-muted hover:text-white bg-surface-100 hover:bg-surface-50 border border-white/10 transition-colors"
            title="Refresh Deck"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODE 1: Swipe Deck (Tinder Style) */}
      {viewMode === 'deck' && (
        <div className="w-full max-w-md flex flex-col items-center relative pt-2">
          {currentProfile ? (
            <div className="w-full relative">
              {/* Underlying Card for 3D Stack Depth */}
              {nextProfile && (
                <div className="absolute inset-0 scale-[0.94] translate-y-3 opacity-40 blur-[1px] pointer-events-none rounded-3xl overflow-hidden border border-white/10 bg-surface-300 z-0">
                  <Image
                    src={getOptimizedImageUrl(
                      nextProfile.profilePhotos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                      { width: 480, quality: 70 }
                    )}
                    alt="Next profile"
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Active Top Swiping Card */}
              <div className="relative z-10 animate-in fade-in zoom-in-95 duration-200">
                <DiscoverCard
                  profile={currentProfile}
                  onLike={(p) => likeProfile(p, 'like')}
                  onPass={(p) => passProfile(p)}
                  onSuperlike={(p) => likeProfile(p, 'superlike')}
                  onReport={(p) => setReportingProfile(p)}
                />
              </div>

              {/* Keyboard shortcuts hint */}
              <p className="text-center text-[11px] text-text-muted mt-3">
                Tip: Use <kbd className="px-1.5 py-0.5 rounded bg-surface-100 border border-white/10 text-white font-mono text-[10px]">←</kbd> to Pass, <kbd className="px-1.5 py-0.5 rounded bg-surface-100 border border-white/10 text-white font-mono text-[10px]">→</kbd> to Like, <kbd className="px-1.5 py-0.5 rounded bg-surface-100 border border-white/10 text-white font-mono text-[10px]">↑</kbd> to Superlike
              </p>
            </div>
          ) : (
            <div className="w-full aspect-[3/4.2] rounded-3xl bg-surface-200/70 backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center p-8 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-cosmic-purple/20 border border-cosmic-purple/30 flex items-center justify-center text-amber-300">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">The Cosmos is Recalibrating</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xs">
                  You&apos;ve viewed all celestial souls in your vicinity. Check back as new stars align or reset your deck.
                </p>
              </div>
              <div className="space-y-3 w-full max-w-xs">
                <button
                  onClick={refreshDiscover}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold text-xs sm:text-sm shadow-cosmic hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Stargaze Again (Reset Deck)</span>
                </button>
                <Link
                  href="/matches"
                  className="w-full py-2.5 px-4 rounded-2xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors block"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>View Your Active Matches</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Celestial Grid Interface */}
      {viewMode === 'grid' && (
        <div className="w-full space-y-5 animate-in fade-in">
          {/* Elemental Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <button
              onClick={() => setElementFilter('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                elementFilter === 'All'
                  ? 'bg-cosmic-purple text-white border-cosmic-purple shadow-sm'
                  : 'bg-surface-100 text-text-secondary border-white/5 hover:text-white'
              }`}
            >
              All Elements ✨
            </button>
            <button
              onClick={() => setElementFilter('Fire')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                elementFilter === 'Fire'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                  : 'bg-surface-100 text-text-secondary border-white/5 hover:text-amber-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Fire Signs (Aries, Leo, Sag)</span>
            </button>
            <button
              onClick={() => setElementFilter('Water')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                elementFilter === 'Water'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-sm'
                  : 'bg-surface-100 text-text-secondary border-white/5 hover:text-purple-300'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-purple-400" />
              <span>Water Signs (Cancer, Scorpio, Pisces)</span>
            </button>
            <button
              onClick={() => setElementFilter('Air')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                elementFilter === 'Air'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                  : 'bg-surface-100 text-text-secondary border-white/5 hover:text-cyan-300'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Air Signs (Gemini, Libra, Aqua)</span>
            </button>
            <button
              onClick={() => setElementFilter('Earth')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                elementFilter === 'Earth'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                  : 'bg-surface-100 text-text-secondary border-white/5 hover:text-emerald-300'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Earth Signs (Taurus, Virgo, Cap)</span>
            </button>
          </div>

          {/* Grid Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {gridProfiles.map((p) => {
              const synastry = astrologyService.calculateSynastry(
                currentUserProfile || { sunSign: 'Scorpio' },
                p
              );
              const optimizedGridPhoto = getOptimizedImageUrl(
                p.profilePhotos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                { width: 450, quality: 75 }
              );

              return (
                <div
                  key={p.userId}
                  className="bg-surface-200/90 rounded-3xl overflow-hidden border border-white/10 hover:border-cosmic-purple/50 shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3.8] overflow-hidden">
                    <Image
                      src={optimizedGridPhoto}
                      alt={p.firstName}
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-400 via-transparent to-black/30" />
                    
                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <AstrologyBadge sign={p.sunSign} size="sm" />
                      <CompatibilityMeter compatibility={synastry} compact />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold">{p.firstName},</span>
                        <span className="text-lg font-light text-white/80">{p.age}</span>
                      </div>
                      <span className="text-xs text-text-secondary">{p.location.city}, {p.location.country}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-text-secondary line-clamp-2">{p.bio}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        {p.moonSign && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-purple-300 border border-white/5">
                            🌙 {p.moonSign}
                          </span>
                        )}
                        {p.risingSign && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-pink-300 border border-white/5">
                            🌅 {p.risingSign}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => passProfile(p)}
                          className="p-2 rounded-full bg-surface-100 hover:bg-rose-500/20 text-text-muted hover:text-rose-400 border border-white/5 transition-colors"
                          title="Pass"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => likeProfile(p, 'like')}
                          className="p-2 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white shadow-cosmic hover:scale-105 transition-transform"
                          title="Cosmic Like"
                        >
                          <Heart className="w-4 h-4 fill-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mutual Match Modal (Lazy Loaded) */}
      {newMatchModalData && (
        <MatchModal
          matchData={newMatchModalData}
          onClose={closeMatchModal}
        />
      )}

      {/* Report Modal (Lazy Loaded) */}
      {reportingProfile && (
        <ReportModal
          profile={reportingProfile}
          isOpen={Boolean(reportingProfile)}
          onClose={() => setReportingProfile(null)}
          onSubmitReport={async (userId, reason, details) => {
            await reportProfile(userId, reason, details);
          }}
        />
      )}
    </div>
  );
}
