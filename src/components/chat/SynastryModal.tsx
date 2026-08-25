'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types/user';
import { CompatibilityResult, ZodiacSign } from '@/types/astrology';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import {
  Sparkles,
  Heart,
  X,
  Compass,
  Flame,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SynastryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userA: Partial<UserProfile>;
  partner: Partial<UserProfile>;
  compatibility: CompatibilityResult;
  onShareToChat?: (text: string) => void;
}

export const SynastryModal: React.FC<SynastryModalProps> = ({
  isOpen,
  onClose,
  userA,
  partner,
  compatibility,
  onShareToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'aspects' | 'elements' | 'insights'>('aspects');
  const [sharedToast, setSharedToast] = useState(false);

  if (!isOpen) return null;

  // High-quality, photo-realistic portrait photographs of real people
  const rawPhotoA =
    userA.profilePhotos?.[0] ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const rawPhotoB =
    partner.profilePhotos?.[0] ||
    (partner as any).photo ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80';

  const photoA = getOptimizedImageUrl(rawPhotoA, { width: 176, quality: 80 });
  const photoB = getOptimizedImageUrl(rawPhotoB, { width: 176, quality: 80 });

  const nameA = userA.firstName || 'Aria';
  const nameB = partner.firstName || 'Elena';
  const signA = (userA.sunSign || 'Scorpio') as ZodiacSign;
  const signB = (partner.sunSign || 'Pisces') as ZodiacSign;

  const aspects = compatibility.aspects || [];
  const elementSummary = compatibility.elementSummary || {
    elementA: 'Water',
    elementB: 'Water',
    title: 'Water & Water Oceanic Affinity',
    description: 'Profound emotional resonance and telepathic understanding.',
  };

  const handleShareInsight = (text: string) => {
    if (onShareToChat) {
      onShareToChat(text);
      setSharedToast(true);
      setTimeout(() => {
        setSharedToast(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-200/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-white hover:bg-surface-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-4 text-center flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Astrological Synastry Blueprint</span>
          </div>

          {/* Dual Connected Photo-Realistic Avatar Rings */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 pt-1">
            {/* Person A: Aria */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full p-0.5 bg-gradient-to-tr from-cosmic-purple to-cosmic-violet shadow-cosmic relative">
                <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-surface-300 bg-surface-300">
                  <Image
                    src={photoA}
                    alt={nameA}
                    fill
                    priority
                    className="object-cover object-center pointer-events-none"
                    sizes="96px"
                  />
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm text-white">{nameA}</span>
              <AstrologyBadge sign={signA} size="sm" />
            </div>

            {/* Synergy Resonance Badge */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-surface-100/90 border border-white/10 shadow-inner">
              <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {compatibility.overallScore}%
              </span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                Resonance
              </span>
            </div>

            {/* Person B: Elena */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full p-0.5 bg-gradient-to-tr from-cosmic-pink to-amber-400 shadow-cosmic-rose relative">
                <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-surface-300 bg-surface-300">
                  <Image
                    src={photoB}
                    alt={nameB}
                    fill
                    priority
                    className="object-cover object-center pointer-events-none"
                    sizes="96px"
                  />
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm text-white">{nameB}</span>
              <AstrologyBadge sign={signB} size="sm" />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
            {compatibility.summary}
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 border-b border-white/10 pb-2">
            {[
              { id: 'aspects', label: 'Planetary Aspects', icon: Sparkles },
              { id: 'elements', label: 'Elemental Synergy', icon: Flame },
              { id: 'insights', label: 'Strengths & Advice', icon: Heart },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cosmic-purple text-white shadow-cosmic'
                      : 'text-text-muted hover:text-white hover:bg-surface-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar text-left">
          {/* TAB 1: Planetary Aspects */}
          {activeTab === 'aspects' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {aspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-surface-100 border border-white/10 space-y-2 hover:border-cosmic-purple/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{aspect.title}</span>
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                          aspect.nature === 'Harmonious'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : aspect.nature === 'Soul Deep'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : aspect.nature === 'Electric Passion'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {aspect.nature}
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-amber-300">
                      {aspect.score}%
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {aspect.interpretation}
                  </p>

                  {onShareToChat && (
                    <button
                      onClick={() =>
                        handleShareInsight(
                          `✨ Synastry Insight: ${aspect.title} (${aspect.aspectType}) - ${aspect.interpretation}`
                        )
                      }
                      className="text-[11px] font-semibold text-cosmic-purple hover:text-purple-300 flex items-center gap-1 pt-1 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Share in Chat</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Elemental Synergy */}
          {activeTab === 'elements' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-surface-100 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Flame className="w-4 h-4" />
                  <h4>{elementSummary.title}</h4>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {elementSummary.description}
                </p>
              </div>

              {/* 4 Aspect Dimensional Bars */}
              <div className="p-4 rounded-2xl bg-surface-100 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cosmic Dimension Harmony Scores
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-text-secondary mb-1">
                      <span>Elemental & Spiritual Harmony</span>
                      <span className="font-bold text-white">{compatibility.elementalHarmonyScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${compatibility.elementalHarmonyScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-text-secondary mb-1">
                      <span>Emotional Intimacy (Moon Placements)</span>
                      <span className="font-bold text-white">{compatibility.emotionalScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        style={{ width: `${compatibility.emotionalScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-text-secondary mb-1">
                      <span>Intellectual & Communication Chemistry</span>
                      <span className="font-bold text-white">{compatibility.communicationScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                        style={{ width: `${compatibility.communicationScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-text-secondary mb-1">
                      <span>Romantic & Physical Spark (Venus/Mars)</span>
                      <span className="font-bold text-white">{compatibility.passionScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                        style={{ width: `${compatibility.passionScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Strengths & Advice */}
          {activeTab === 'insights' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Strengths */}
              <div className="p-4 rounded-2xl bg-surface-100 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Celestial Strengths</span>
                </div>
                <ul className="space-y-1.5 text-xs text-text-secondary">
                  {compatibility.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Growth Areas */}
              <div className="p-4 rounded-2xl bg-surface-100 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Conscious Evolution & Growth</span>
                </div>
                <ul className="space-y-1.5 text-xs text-text-secondary">
                  {compatibility.challenges.map((ch, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{ch}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cosmic Guidance */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Cosmic Oracle Advice</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {compatibility.cosmicAdvice}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toast confirmation */}
        {sharedToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center animate-in zoom-in-95">
            ✨ Shared Synastry Insight to chat!
          </div>
        )}
      </div>
    </div>
  );
};
