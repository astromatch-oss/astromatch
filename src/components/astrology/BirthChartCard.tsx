'use client';

import React from 'react';
import { BirthChart, ZodiacSign } from '@/types/astrology';
import { ZODIAC_SIGNS, ELEMENT_COLORS } from '@/lib/astrology/zodiacData';
import { AstrologyBadge } from './AstrologyBadge';
import { Sun, Moon, Sunrise, Sparkles, Heart, Zap } from 'lucide-react';

interface BirthChartCardProps {
  birthChart: BirthChart;
  birthCity?: string;
  birthCountry?: string;
  birthDate?: string;
  birthTime?: string;
}

export const BirthChartCard: React.FC<BirthChartCardProps> = ({
  birthChart,
  birthCity,
  birthCountry,
  birthDate,
  birthTime,
}) => {
  const { sun, moon, rising, venus, mars } = birthChart;

  // Calculate elemental counts
  const placements: (ZodiacSign | undefined)[] = [
    sun?.sign,
    moon?.sign,
    rising?.sign,
    venus?.sign,
    mars?.sign,
  ].filter(Boolean);

  const elementCounts = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  placements.forEach((sign) => {
    if (sign && ZODIAC_SIGNS[sign]) {
      const el = ZODIAC_SIGNS[sign].element;
      elementCounts[el] = (elementCounts[el] || 0) + 1;
    }
  });

  const total = placements.length || 1;
  const elementPercentages = {
    Fire: Math.round((elementCounts.Fire / total) * 100),
    Earth: Math.round((elementCounts.Earth / total) * 100),
    Air: Math.round((elementCounts.Air / total) * 100),
    Water: Math.round((elementCounts.Water / total) * 100),
  };

  return (
    <div className="bg-surface-200/90 backdrop-blur-2xl border border-cosmic-purple/30 rounded-3xl p-5 sm:p-6 shadow-cosmic space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cosmic-purple/20 text-cosmic-purple">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Your Celestial Natal Chart</h3>
            {(birthCity || birthDate) && (
              <p className="text-[11px] text-text-secondary">
                {birthDate} {birthTime ? `at ${birthTime}` : ''} • {birthCity} {birthCountry ? `, ${birthCountry}` : ''}
              </p>
            )}
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-surface-100 text-purple-300 border border-white/5">
          Calculated Ephemeris
        </span>
      </div>

      {/* The Big 3 Placements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Sun */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-surface-100 to-surface-100 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sun className="w-4 h-4" />
              <span>Sun Sign</span>
            </div>
            {sun?.degree !== undefined && (
              <span className="text-[10px] text-text-muted">{sun.degree}°</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-white">{sun?.sign}</span>
            {sun?.sign && <AstrologyBadge sign={sun.sign} size="sm" />}
          </div>
          <p className="text-[10px] text-text-muted">Core identity, vitality, and conscious ego.</p>
        </div>

        {/* Moon */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-surface-100 to-surface-100 border border-purple-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <Moon className="w-4 h-4" />
              <span>Moon Sign</span>
            </div>
            {moon?.degree !== undefined && (
              <span className="text-[10px] text-text-muted">{moon.degree}°</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-white">{moon?.sign}</span>
            {moon?.sign && <AstrologyBadge sign={moon.sign} size="sm" />}
          </div>
          <p className="text-[10px] text-text-muted">Subconscious emotions and inner soul.</p>
        </div>

        {/* Rising / Ascendant */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-surface-100 to-surface-100 border border-pink-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
              <Sunrise className="w-4 h-4" />
              <span>Rising (Ascendant)</span>
            </div>
            {rising?.degree !== undefined && (
              <span className="text-[10px] text-text-muted">{rising.degree}°</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-white">{rising?.sign}</span>
            {rising?.sign && <AstrologyBadge sign={rising.sign} size="sm" />}
          </div>
          <p className="text-[10px] text-text-muted">First impression, social aura, and outer lens.</p>
        </div>
      </div>

      {/* Secondary Placements: Venus & Mars */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-surface-100/70 border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-rose-300 font-bold uppercase flex items-center gap-1">
              <Heart className="w-3 h-3" /> Venus (Love Style)
            </span>
            <p className="text-sm font-semibold text-white">{venus?.sign}</p>
          </div>
          {venus?.sign && <AstrologyBadge sign={venus.sign} size="sm" />}
        </div>

        <div className="p-3 rounded-xl bg-surface-100/70 border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-amber-300 font-bold uppercase flex items-center gap-1">
              <Zap className="w-3 h-3" /> Mars (Passion & Drive)
            </span>
            <p className="text-sm font-semibold text-white">{mars?.sign}</p>
          </div>
          {mars?.sign && <AstrologyBadge sign={mars.sign} size="sm" />}
        </div>
      </div>

      {/* Elemental Balance Progress Bar */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex justify-between text-xs text-text-secondary font-medium">
          <span>Elemental Balance</span>
          <span className="text-[11px] text-text-muted">
            🔥 {elementPercentages.Fire}% • 🌿 {elementPercentages.Earth}% • 💨 {elementPercentages.Air}% • 🌊 {elementPercentages.Water}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-surface-300">
          {elementPercentages.Fire > 0 && (
            <div style={{ width: `${elementPercentages.Fire}%` }} className="bg-amber-400 h-full" title={`Fire: ${elementPercentages.Fire}%`} />
          )}
          {elementPercentages.Earth > 0 && (
            <div style={{ width: `${elementPercentages.Earth}%` }} className="bg-emerald-400 h-full" title={`Earth: ${elementPercentages.Earth}%`} />
          )}
          {elementPercentages.Air > 0 && (
            <div style={{ width: `${elementPercentages.Air}%` }} className="bg-cyan-400 h-full" title={`Air: ${elementPercentages.Air}%`} />
          )}
          {elementPercentages.Water > 0 && (
            <div style={{ width: `${elementPercentages.Water}%` }} className="bg-purple-400 h-full" title={`Water: ${elementPercentages.Water}%`} />
          )}
        </div>
      </div>
    </div>
  );
};
