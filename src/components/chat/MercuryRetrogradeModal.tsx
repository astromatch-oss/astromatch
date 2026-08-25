'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Send,
  X,
  Orbit,
  Flame,
  Shuffle,
  AlertTriangle,
} from 'lucide-react';
import { MERCURY_RETROGRADE_PROMPTS, RetrogradePrompt } from '@/lib/astrology/retrogradeData';

interface MercuryRetrogradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSendToChat: (prompt: RetrogradePrompt) => void;
}

export const MercuryRetrogradeModal: React.FC<MercuryRetrogradeModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSendToChat,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  if (!isOpen) return null;

  const currentPrompt = MERCURY_RETROGRADE_PROMPTS[currentIndex];

  const handleReroll = () => {
    setIsSpinning(true);
    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * MERCURY_RETROGRADE_PROMPTS.length);
      if (nextIdx === currentIndex) {
        nextIdx = (currentIndex + 1) % MERCURY_RETROGRADE_PROMPTS.length;
      }
      setCurrentIndex(nextIdx);
      setIsSpinning(false);
    }, 450);
  };

  const handleBroadcast = () => {
    setHasSent(true);
    onSendToChat(currentPrompt);
    setTimeout(() => {
      setHasSent(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Background Retrograde Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[110px] animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/25 rounded-full blur-[130px]" />
      </div>

      <div className="relative w-full max-w-lg bg-surface-200/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center z-10 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-white hover:bg-surface-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Retrograde Orbital Icon & Header */}
        <div className="space-y-3">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* Spinning orbital reverse rings */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed border-amber-400/60 transition-transform duration-500 ${
                isSpinning ? 'rotate-[-360deg] scale-110 border-amber-300' : 'animate-spin-slow'
              }`}
              style={{ animationDirection: 'reverse', animationDuration: '12s' }}
            />
            <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-spin-slow" />

            {/* Glowing Core with Mercury Symbol */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-purple-600 flex items-center justify-center shadow-cosmic-gold text-white text-2xl font-black">
              <span className={isSpinning ? 'animate-spin' : ''}>☿</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>MERCURY RETROGRADE ACTIVE</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Cosmic Conversation Plot Twist
            </h3>
            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              Mercury is reversing celestial orbits. Trigger an unfiltered prompt to shake up the vibe with <span className="text-white font-semibold">{partnerName}</span>!
            </p>
          </div>
        </div>

        {/* Prompt Card Box */}
        <div
          className={`p-5 rounded-2xl bg-surface-100/90 border border-amber-500/20 shadow-inner space-y-3 transition-all duration-300 text-left relative overflow-hidden ${
            isSpinning ? 'opacity-40 scale-95 blur-sm' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {currentPrompt.category}
              </span>
            </div>
            <span className="text-[11px] text-text-muted italic">{currentPrompt.tagline}</span>
          </div>

          <h4 className="text-sm font-bold text-white leading-snug">
            {currentPrompt.twistTitle}
          </h4>

          <p className="text-sm sm:text-base text-purple-100 font-medium leading-relaxed">
            &ldquo;{currentPrompt.prompt}&rdquo;
          </p>

          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-text-muted">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Sparks instant witty banter under celestial interference</span>
          </div>
        </div>

        {/* Interactive Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {/* Spin / Reroll Twist */}
          <button
            onClick={handleReroll}
            disabled={isSpinning}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-text-secondary hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 flex-1"
          >
            <RotateCcw className={`w-4 h-4 text-amber-400 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Reroll Plot Twist</span>
          </button>

          {/* Broadcast to Chat */}
          <button
            onClick={handleBroadcast}
            disabled={hasSent}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-cosmic-gold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex-1"
          >
            {hasSent ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Transmitting to Chat...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Launch in Chat ☿</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
