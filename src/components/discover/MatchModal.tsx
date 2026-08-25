'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/user';
import { Match } from '@/types/match';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, MessageCircle, Heart, X } from 'lucide-react';
import { AstrologyBadge } from '../astrology/AstrologyBadge';

interface MatchModalProps {
  matchData: {
    match: Match;
    partnerProfile: UserProfile;
  } | null;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ matchData, onClose }) => {
  const router = useRouter();
  const { profile: currentUserProfile } = useAuth();

  if (!matchData) return null;
  const { match, partnerProfile } = matchData;

  const myPhoto = currentUserProfile?.profilePhotos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const partnerPhoto = partnerProfile.profilePhotos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80';
  const score = match.compatibility?.overallScore || 92;

  const handleStartChat = () => {
    onClose();
    router.push(`/chat?matchId=${encodeURIComponent(match.id)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Background celestial particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cosmic-purple/30 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cosmic-pink/25 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface-200/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-white hover:bg-surface-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planetary Alignment</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-pink-200 to-amber-200 bg-clip-text text-transparent">
            It&apos;s a Celestial Match!
          </h2>
          <p className="text-sm text-text-secondary">
            You and <span className="text-white font-semibold">{partnerProfile.firstName}</span> share an exceptional <span className="text-cosmic-gold font-bold">{score}% cosmic resonance</span>.
          </p>
        </div>

        {/* Overlapping Connected Avatars */}
        <div className="relative flex items-center justify-center py-4">
          <div className="relative -mr-4 z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-cosmic-purple shadow-cosmic relative">
              <Image
                src={myPhoto}
                alt="Your photo"
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
            {currentUserProfile && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <AstrologyBadge sign={currentUserProfile.sunSign} size="sm" />
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cosmic-pink to-cosmic-purple flex items-center justify-center z-30 shadow-lg border-2 border-surface-200 animate-bounce">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>

          <div className="relative -ml-4 z-20">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-cosmic-pink shadow-cosmic-rose relative">
              <Image
                src={partnerPhoto}
                alt={partnerProfile.firstName}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <AstrologyBadge sign={partnerProfile.sunSign} size="sm" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleStartChat}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-rose-500 hover:opacity-95 text-white font-semibold shadow-cosmic flex items-center justify-center gap-2 text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Cosmic Icebreaker</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-2xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white font-medium text-sm transition-colors"
          >
            Keep Stargazing
          </button>
        </div>
      </div>
    </div>
  );
};
