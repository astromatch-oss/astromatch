'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { AstrologyBadge } from '../astrology/AstrologyBadge';
import { CompatibilityMeter } from '../astrology/CompatibilityMeter';
import {
  Heart,
  X,
  Star,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Compass,
  Sun,
  Moon,
  Sunrise,
} from 'lucide-react';

interface DiscoverCardProps {
  profile: UserProfile;
  onLike: (profile: UserProfile) => void;
  onPass: (profile: UserProfile) => void;
  onSuperlike: (profile: UserProfile) => void;
  onReport: (profile: UserProfile) => void;
  isStacked?: boolean;
}

export const DiscoverCard: React.FC<DiscoverCardProps> = ({
  profile,
  onLike,
  onPass,
  onSuperlike,
  onReport,
  isStacked = false,
}) => {
  const { profile: currentUserProfile } = useAuth();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'like' | 'pass' | 'superlike' | null>(null);

  // Compute synastry compatibility
  const synastry = astrologyService.calculateSynastry(
    currentUserProfile || { sunSign: 'Scorpio', moonSign: 'Pisces' },
    profile
  );

  const photos = profile.profilePhotos?.length > 0
    ? profile.profilePhotos
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'];

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleAction = (action: 'like' | 'pass' | 'superlike') => {
    setSwipeAction(action);
    setTimeout(() => {
      if (action === 'like') onLike(profile);
      else if (action === 'pass') onPass(profile);
      else onSuperlike(profile);
      setSwipeAction(null);
    }, 250);
  };

  return (
    <div
      className={`relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4.5] sm:aspect-[3/4.7] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-surface-200 transition-all duration-300 select-none flex flex-col justify-end ${
        swipeAction === 'like'
          ? 'translate-x-28 rotate-6 opacity-0'
          : swipeAction === 'pass'
          ? '-translate-x-28 -rotate-6 opacity-0'
          : swipeAction === 'superlike'
          ? '-translate-y-28 scale-105 opacity-0'
          : ''
      }`}
    >
      {/* Background Photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={photos[activePhotoIdx]}
          alt={profile.firstName}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 450px"
          className="object-cover"
        />

        {/* Swipe Tap Zones for Photos */}
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/2 h-full cursor-pointer" onClick={prevPhoto} />
          <div className="w-1/2 h-full cursor-pointer" onClick={nextPhoto} />
        </div>

        {/* Indicator Bars */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
            {photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === activePhotoIdx ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-400 via-surface-400/50 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Swipe Stamp Indicators */}
      {swipeAction === 'like' && (
        <div className="absolute top-12 left-6 z-30 px-4 py-1.5 rounded-xl border-4 border-emerald-400 bg-emerald-500/20 text-emerald-300 font-extrabold text-2xl rotate-[-15deg] uppercase tracking-wider animate-pulse">
          Cosmic Like 💖
        </div>
      )}
      {swipeAction === 'pass' && (
        <div className="absolute top-12 right-6 z-30 px-4 py-1.5 rounded-xl border-4 border-rose-500 bg-rose-500/20 text-rose-300 font-extrabold text-2xl rotate-[15deg] uppercase tracking-wider animate-pulse">
          Pass ✕
        </div>
      )}
      {swipeAction === 'superlike' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 px-6 py-2 rounded-2xl border-4 border-amber-400 bg-amber-500/30 text-amber-300 font-extrabold text-3xl uppercase tracking-wider shadow-cosmic-gold animate-bounce">
          Super Star ⭐
        </div>
      )}

      {/* Top action badges */}
      <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          <AstrologyBadge sign={profile.sunSign} label="Sun" size="md" />
          {profile.moonSign && (
            <AstrologyBadge sign={profile.moonSign} label="Moon" size="md" />
          )}
          {profile.risingSign && (
            <AstrologyBadge sign={profile.risingSign} label="Rising" size="md" />
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReport(profile);
          }}
          className="p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/70 hover:text-rose-400 border border-white/10 transition-colors"
          title="Safety & Report"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content Footer */}
      <div className="relative z-20 p-5 space-y-3 pointer-events-auto">
        {/* Name, Age, Location & Synastry Match Badge */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {profile.firstName}
              </h2>
              <span className="text-xl sm:text-2xl font-light text-white/80">
                {profile.age}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cosmic-purple" />
              <span>
                {profile.location.city}, {profile.location.country}
              </span>
              {profile.location.distanceKm !== undefined && (
                <span className="text-white/40">• {profile.location.distanceKm} km away</span>
              )}
            </div>
          </div>

          {/* Compatibility Pill */}
          <div className="flex-shrink-0">
            <CompatibilityMeter compatibility={synastry} compact />
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed">
          {profile.bio}
        </p>

        {/* Astrological Placements Highlights */}
        <div className="grid grid-cols-3 gap-2 py-1 bg-surface-100/50 backdrop-blur-md rounded-xl p-2 border border-white/5 text-center text-xs">
          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-amber-300 font-semibold">
              <Sun className="w-3 h-3" /> Sun
            </div>
            <span className="font-bold text-white text-[11px]">{profile.sunSign}</span>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-purple-300 font-semibold">
              <Moon className="w-3 h-3" /> Moon
            </div>
            <span className="font-bold text-white text-[11px]">{profile.moonSign || 'Pisces'}</span>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-pink-300 font-semibold">
              <Sunrise className="w-3 h-3" /> Rising
            </div>
            <span className="font-bold text-white text-[11px]">{profile.risingSign || 'Aries'}</span>
          </div>
        </div>

        {/* Interests & Intent Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cosmic-purple/20 text-purple-200 border border-cosmic-purple/30">
            {profile.relationshipIntent === 'long-term'
              ? '✨ Long-term soul bond'
              : profile.relationshipIntent === 'marriage'
              ? '💍 Marriage minded'
              : '🌟 Celestial Connection'}
          </span>
          {profile.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="text-[11px] px-2 py-0.5 rounded-full bg-surface-100/70 text-text-secondary border border-white/5"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Expand Astrological Synastry Breakdown */}
        <button
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-purple-300 hover:text-white transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{showFullDetails ? 'Collapse Synastry Breakdown' : 'View Full Compatibility Breakdown'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showFullDetails ? 'rotate-90' : ''}`} />
        </button>

        {showFullDetails && (
          <div className="mt-2 pt-2 border-t border-white/10 max-h-52 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            <CompatibilityMeter compatibility={synastry} showBreakdown={true} />
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Pass */}
          <button
            onClick={() => handleAction('pass')}
            className="w-14 h-14 rounded-full bg-surface-200/90 hover:bg-surface-100 border border-rose-500/40 text-rose-400 hover:text-rose-300 hover:border-rose-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
            title="Pass (Swipe Left)"
          >
            <X className="w-7 h-7 stroke-[2.5]" />
          </button>

          {/* Superlike */}
          <button
            onClick={() => handleAction('superlike')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-surface-400 flex items-center justify-center shadow-cosmic-gold hover:scale-110 active:scale-95 transition-all duration-200"
            title="Super Star Like (Swipe Up)"
          >
            <Star className="w-6 h-6 fill-current stroke-[1.5]" />
          </button>

          {/* Like */}
          <button
            onClick={() => handleAction('like')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-cosmic-purple to-cosmic-pink text-white flex items-center justify-center shadow-cosmic-rose hover:scale-110 active:scale-95 transition-all duration-200"
            title="Cosmic Like (Swipe Right)"
          >
            <Heart className="w-7 h-7 fill-white stroke-none" />
          </button>
        </div>
      </div>
    </div>
  );
};
