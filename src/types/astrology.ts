export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type AstrologicalElement = 'Fire' | 'Earth' | 'Air' | 'Water';
export type AstrologicalModality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface ZodiacSignInfo {
  name: ZodiacSign;
  symbol: string;
  element: AstrologicalElement;
  modality: AstrologicalModality;
  rulingPlanet: string;
  dateRange: string;
  traits: string[];
  color: string;
}

export interface PlanetaryPlacement {
  sign: ZodiacSign;
  degree?: number;
  house?: number;
  isRetrograde?: boolean;
}

export interface BirthChart {
  sun: PlanetaryPlacement;
  moon?: PlanetaryPlacement;
  rising?: PlanetaryPlacement;
  venus?: PlanetaryPlacement;
  mars?: PlanetaryPlacement;
  calculatedAt?: string;
  source: 'calculated_basic' | 'external_api' | 'mock_synastry';
}

export interface SynastryAspect {
  planetA: string;
  planetB: string;
  userASign: ZodiacSign;
  userBSign: ZodiacSign;
  aspectType: 'Conjunction' | 'Trine' | 'Sextile' | 'Opposition' | 'Square' | 'Quincunx';
  score: number; // 0 - 100
  title: string;
  interpretation: string;
  nature: 'Harmonious' | 'Electric Passion' | 'Dynamic Growth' | 'Soul Deep';
}

export interface AspectHarmony {
  planetPair: string;
  score: number; // 0 - 100
  aspectType: 'trine' | 'sextile' | 'conjunction' | 'opposition' | 'square' | 'neutral';
  title: string;
  description: string;
}

export interface CompatibilityResult {
  id?: string;
  participants: [string, string];
  overallScore: number; // 0 - 100
  elementalHarmonyScore: number;
  emotionalScore: number;
  communicationScore: number;
  passionScore: number;
  summary: string;
  strengths: string[];
  challenges: string[];
  cosmicAdvice: string;
  aspects?: SynastryAspect[];
  elementSummary?: {
    elementA: AstrologicalElement;
    elementB: AstrologicalElement;
    title: string;
    description: string;
  };
  isMockCalculation: boolean;
  calculatedAt: string;
}
