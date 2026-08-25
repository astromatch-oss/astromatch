import React from 'react';
import { ZodiacSign } from '@/types/astrology';
import { ZODIAC_SIGNS, ELEMENT_COLORS } from '@/lib/astrology/zodiacData';

interface AstrologyBadgeProps {
  sign: ZodiacSign;
  label?: string; // e.g. 'Sun', 'Moon', 'Rising'
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const AstrologyBadge: React.FC<AstrologyBadgeProps> = ({
  sign,
  label,
  size = 'md',
  showDetails = false,
}) => {
  const info = ZODIAC_SIGNS[sign] || ZODIAC_SIGNS['Aries'];
  const elementStyle = ELEMENT_COLORS[info.element] || ELEMENT_COLORS['Fire'];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const symbolSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium backdrop-blur-md border transition-all duration-300 ${elementStyle.bg} ${elementStyle.border} ${elementStyle.text} ${sizeClasses}`}
      title={`${info.name} (${info.element} • ${info.modality})`}
    >
      <span className={`font-semibold ${symbolSizes}`}>{info.symbol}</span>
      {label && <span className="text-white/60 font-light">{label}:</span>}
      <span className="font-medium">{info.name}</span>
      {showDetails && (
        <span className="text-[10px] text-white/50 border-l border-white/10 pl-1.5">
          {info.element}
        </span>
      )}
    </div>
  );
};
