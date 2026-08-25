import React from 'react';
import { CompatibilityResult } from '@/types/astrology';
import { Sparkles, Heart, Zap, MessageCircle } from 'lucide-react';

interface CompatibilityMeterProps {
  compatibility: CompatibilityResult;
  showBreakdown?: boolean;
  compact?: boolean;
}

export const CompatibilityMeter: React.FC<CompatibilityMeterProps> = ({
  compatibility,
  showBreakdown = true,
  compact = false,
}) => {
  const {
    overallScore,
    elementalHarmonyScore,
    emotionalScore,
    communicationScore,
    passionScore,
    summary,
    strengths,
    challenges,
    cosmicAdvice,
    isMockCalculation,
  } = compatibility;

  const getTier = (score: number) => {
    if (score >= 90) return { label: 'Celestial Resonance', color: 'from-amber-400 to-rose-400', badgeBg: 'bg-amber-400/10 text-amber-300 border-amber-400/30' };
    if (score >= 80) return { label: 'Electrifying Harmony', color: 'from-rose-400 to-purple-400', badgeBg: 'bg-purple-400/10 text-purple-300 border-purple-400/30' };
    if (score >= 70) return { label: 'Harmonious Complement', color: 'from-purple-400 to-cyan-400', badgeBg: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30' };
    return { label: 'Dynamic Cosmic Growth', color: 'from-cyan-400 to-indigo-400', badgeBg: 'bg-indigo-400/10 text-indigo-300 border-indigo-400/30' };
  };

  const tier = getTier(overallScore);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${tier.badgeBg}`}>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>{overallScore}% Match</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-100/80 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-cosmic space-y-4">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-cosmic-purple">Astrological Synastry</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tier.badgeBg}`}>
              {tier.label}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">{summary}</p>
        </div>

        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-surface-200 border border-white/10 shadow-inner relative flex-shrink-0">
          <span className={`text-xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
            {overallScore}%
          </span>
          <span className="text-[10px] text-text-muted">Synergy</span>
        </div>
      </div>

      {/* Progress Bars Breakdown */}
      {showBreakdown && (
        <div className="space-y-2.5 pt-2 border-t border-white/5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> Elemental Harmony</span>
              <span className="font-semibold text-white">{elementalHarmonyScore}%</span>
            </div>
            <div className="w-full bg-surface-300 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-700" style={{ width: `${elementalHarmonyScore}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> Emotional Connection</span>
              <span className="font-semibold text-white">{emotionalScore}%</span>
            </div>
            <div className="w-full bg-surface-300 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full transition-all duration-700" style={{ width: `${emotionalScore}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-cyan-400" /> Communication Rhythm</span>
              <span className="font-semibold text-white">{communicationScore}%</span>
            </div>
            <div className="w-full bg-surface-300 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-700" style={{ width: `${communicationScore}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-purple-400" /> Chemistry & Passion</span>
              <span className="font-semibold text-white">{passionScore}%</span>
            </div>
            <div className="w-full bg-surface-300 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-violet-400 h-full rounded-full transition-all duration-700" style={{ width: `${passionScore}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Strengths and Cosmic Advice */}
      {showBreakdown && strengths.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
          <div className="text-text-secondary">
            <span className="text-white font-medium">Cosmic Strengths:</span> {strengths.join(' • ')}
          </div>
          {cosmicAdvice && (
            <p className="text-[11px] text-text-muted italic bg-surface-200/50 p-2.5 rounded-lg border border-white/5">
              💫 {cosmicAdvice}
            </p>
          )}
        </div>
      )}

      {isMockCalculation && (
        <div className="text-[10px] text-text-muted/60 text-right">
          * Calculated via AstroMatch Synastry Engine (Demo Mode)
        </div>
      )}
    </div>
  );
};
