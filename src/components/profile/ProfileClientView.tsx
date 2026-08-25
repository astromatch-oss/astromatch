'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { MOCK_DISCOVER_PROFILES } from '@/lib/mockData';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { CompatibilityMeter } from '@/components/astrology/CompatibilityMeter';
import { ReportModal } from '@/components/safety/ReportModal';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPin,
  ShieldAlert,
  Compass,
} from 'lucide-react';

export function ProfileClientView({ targetId }: { targetId: string }) {
  const router = useRouter();
  const { profile: myProfile } = useAuth();
  const { likeProfile, reportProfile } = useMatch();

  const [showReportModal, setShowReportModal] = useState(false);

  const profile = MOCK_DISCOVER_PROFILES.find((p) => p.userId === targetId) || MOCK_DISCOVER_PROFILES[0];
  const synastry = astrologyService.calculateSynastry(myProfile || { sunSign: 'Scorpio' }, profile);

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Report / Block</span>
        </button>
      </div>

      {/* Hero Photo & Info */}
      <div className="bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl space-y-6">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9]">
          <Image
            src={profile.profilePhotos[0]}
            alt={profile.firstName}
            fill
            priority
            className="object-cover pointer-events-none"
            sizes="(max-width: 768px) 100vw, 768px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-300 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {profile.firstName}
                </h1>
                <span className="text-2xl font-light text-white/80">{profile.age}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                <MapPin className="w-3.5 h-3.5 text-cosmic-purple" />
                <span>{profile.location.city}, {profile.location.country}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <AstrologyBadge sign={profile.sunSign} label="Sun" size="md" />
              {profile.moonSign && <AstrologyBadge sign={profile.moonSign} label="Moon" size="md" />}
            </div>
          </div>
        </div>

        {/* Bio & Details */}
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-cosmic-purple">About & Celestial Essence</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{profile.bio}</p>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-cosmic-purple">Passions & Archetypes</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-3 py-1 rounded-full bg-surface-100 text-white border border-white/5 font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Planetary Placements Chart */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h3 className="text-xs uppercase tracking-wider font-bold text-cosmic-purple">Natal Chart Placements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 text-center space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold">Sun</span>
                <p className="text-sm font-semibold text-white">{profile.sunSign}</p>
              </div>
              <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 text-center space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold">Moon</span>
                <p className="text-sm font-semibold text-white">{profile.moonSign || 'Pisces'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 text-center space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold">Rising</span>
                <p className="text-sm font-semibold text-white">{profile.risingSign || 'Sagittarius'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-surface-100/80 border border-white/5 text-center space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold">Venus</span>
                <p className="text-sm font-semibold text-white">{profile.venusSign || 'Scorpio'}</p>
              </div>
            </div>
          </div>

          {/* Synastry Report with Current User */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-bold text-cosmic-purple">
                Compatibility With Your Chart
              </h3>
              <Link
                href={`/compatibility/${profile.userId}`}
                className="text-xs text-purple-300 hover:text-white font-medium flex items-center gap-1"
              >
                <span>Full Synastry Analysis</span>
                <Compass className="w-3.5 h-3.5" />
              </Link>
            </div>

            <CompatibilityMeter compatibility={synastry} showBreakdown={true} />
          </div>

          {/* Action CTAs */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                likeProfile(profile, 'like');
                router.push('/matches');
              }}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold text-sm shadow-cosmic flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Cosmic Like</span>
            </button>

            <button
              onClick={() => {
                likeProfile(profile, 'like');
                router.push('/chat');
              }}
              className="py-3 px-5 rounded-2xl bg-surface-100 hover:bg-surface-50 text-white text-sm font-medium border border-white/10 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Modal */}
      <ReportModal
        profile={profile}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmitReport={async (uid, reason, details) => {
          await reportProfile(uid, reason, details);
          router.push('/discover');
        }}
      />
    </div>
  );
}
