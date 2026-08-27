import { ZodiacSign, AstrologicalElement } from '@/types/astrology';
import { UserProfile } from '@/types/user';
import { ZODIAC_SIGNS } from './zodiacData';

export interface CosmicTransit {
  id: string;
  title: string;
  planetaryPair: string;
  aspectType: 'Trine' | 'Sextile' | 'Conjunction' | 'Opposition' | 'Trine-Sextile';
  timeframe: string;
  influence: string;
  alignmentRating: number; // 0 - 100
  recommendedActivity: string;
}

export interface CosmicWindowResult {
  headline: string;
  optimalTime: string;
  resonanceScore: number;
  primaryAspect: string;
  romanticVibe: string;
  celestialAdvice: string;
  activeTransits: CosmicTransit[];
  isPeakWindow: boolean;
}

export interface CompositePlanet {
  planet: string;
  sign: ZodiacSign;
  element: AstrologicalElement;
  symbol: string;
  meaning: string;
}

export interface CompositeDestinyResult {
  archetype: string;
  archetypeTagline: string;
  archetypeSymbol: string;
  elementalBlend: string;
  aiForecast: string;
  compositeSun: ZodiacSign;
  compositeMoon: ZodiacSign;
  compositeRising: ZodiacSign;
  compositeVenus: ZodiacSign;
  compositePlanets: CompositePlanet[];
  karmicLesson: string;
  coreStrengths: string[];
}

const ZODIAC_ORDER: ZodiacSign[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

/**
 * Calculate the mid-point sign between two Zodiac signs
 */
export function calculateMidpointSign(signA: ZodiacSign, signB: ZodiacSign): ZodiacSign {
  const idxA = ZODIAC_ORDER.indexOf(signA);
  const idxB = ZODIAC_ORDER.indexOf(signB);
  if (idxA === -1 || idxB === -1) return 'Scorpio';

  let diff = (idxB - idxA + 12) % 12;
  if (diff > 6) {
    diff = diff - 12;
  }
  const midIdx = (idxA + Math.round(diff / 2) + 12) % 12;
  return ZODIAC_ORDER[midIdx];
}

/**
 * Feature 1: Cosmic Window (Transit-Based Date Timing Engine)
 */
export function calculateCosmicWindow(
  userA: Partial<UserProfile>,
  userB: Partial<UserProfile>
): CosmicWindowResult {
  const sunA = (userA.sunSign || 'Scorpio') as ZodiacSign;
  const sunB = (userB.sunSign || 'Pisces') as ZodiacSign;
  const moonA = (userA.moonSign || 'Pisces') as ZodiacSign;
  const venusB = (userB.venusSign || 'Cancer') as ZodiacSign;

  const elemA = ZODIAC_SIGNS[sunA]?.element || 'Water';
  const elemB = ZODIAC_SIGNS[sunB]?.element || 'Water';

  // Seeded deterministic upcoming optimal window
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay1 = dayNames[(now.getDay() + 1) % 7];
  const targetDay2 = dayNames[(now.getDay() + 2) % 7];

  const transitPool: CosmicTransit[] = [
    {
      id: 'transit-1',
      title: 'Moon-Venus Resonance Trine',
      planetaryPair: 'Moon ☌ Venus',
      aspectType: 'Trine',
      timeframe: `${targetDay1}, 7:00 PM – 10:30 PM`,
      influence: 'Peak emotional receptivity and mutual romantic vulnerability.',
      alignmentRating: 98,
      recommendedActivity: 'Intimate candlelit wine bar or quiet rooftop conversations.',
    },
    {
      id: 'transit-2',
      title: 'Mars-Venus Magnetic Sextile',
      planetaryPair: 'Mars ⚹ Venus',
      aspectType: 'Sextile',
      timeframe: `${targetDay2}, 8:30 PM – 11:45 PM`,
      influence: 'Electric physical attraction, playful banter, and effortless flirtation.',
      alignmentRating: 94,
      recommendedActivity: 'Live jazz lounge, sensory dining, or evening cocktail exploration.',
    },
    {
      id: 'transit-3',
      title: 'Sun-Jupiter Auspicious Alignment',
      planetaryPair: 'Sun △ Jupiter',
      aspectType: 'Conjunction',
      timeframe: 'Weekend Sunset Window (6:00 PM – 9:00 PM)',
      influence: 'Joyous synchronicity, high optimism, and mutual generosity of spirit.',
      alignmentRating: 91,
      recommendedActivity: 'Stargazing walk, contemporary art exhibit, or scenic outdoor drinks.',
    },
  ];

  return {
    headline: 'High Romantic Alignment: Next 48 Hours',
    optimalTime: `${targetDay1} evening between 7:30 PM & 10:30 PM`,
    resonanceScore: 96,
    primaryAspect: `${moonA} Moon in Harmony with ${venusB} Venus`,
    romanticVibe: `${elemA} & ${elemB} Elemental Synchronization`,
    celestialAdvice:
      'The current planetary transit creates a rare energetic vortex where barriers dissolve easily. Schedule your date during this window for peak chemistry and deep mutual resonance.',
    activeTransits: transitPool,
    isPeakWindow: true,
  };
}

/**
 * Feature 2: Composite Destiny Entity (Relationship Archetype Engine)
 */
export function calculateCompositeDestiny(
  userA: Partial<UserProfile>,
  userB: Partial<UserProfile>
): CompositeDestinyResult {
  const sunA = (userA.sunSign || 'Scorpio') as ZodiacSign;
  const sunB = (userB.sunSign || 'Pisces') as ZodiacSign;
  const moonA = (userA.moonSign || 'Pisces') as ZodiacSign;
  const moonB = (userB.moonSign || 'Cancer') as ZodiacSign;
  const risingA = (userA.risingSign || 'Sagittarius') as ZodiacSign;
  const risingB = (userB.risingSign || 'Taurus') as ZodiacSign;
  const venusA = (userA.venusSign || 'Scorpio') as ZodiacSign;
  const venusB = (userB.venusSign || 'Pisces') as ZodiacSign;

  const compSun = calculateMidpointSign(sunA, sunB);
  const compMoon = calculateMidpointSign(moonA, moonB);
  const compRising = calculateMidpointSign(risingA, risingB);
  const compVenus = calculateMidpointSign(venusA, venusB);

  const elemSun = ZODIAC_SIGNS[compSun]?.element || 'Water';
  const elemMoon = ZODIAC_SIGNS[compMoon]?.element || 'Water';

  // Archetype dictionary based on composite elements
  interface ArchetypeInfo {
    title: string;
    tagline: string;
    symbol: string;
    forecast: string;
    karmicLesson: string;
    strengths: string[];
  }

  let archetypeInfo: ArchetypeInfo;

  if (elemSun === 'Fire' && elemMoon === 'Fire') {
    archetypeInfo = {
      title: 'The Power Duo',
      tagline: 'High-Octane Passion & Unstoppable Ambition',
      symbol: '⚡👑',
      forecast:
        'Your combined union operates as a radiant supernova of creative momentum and magnetic vitality. Together, you inspire everyone in your orbit to take bolder leaps into the unknown.',
      karmicLesson: 'Cultivating gentle patience and allowing quiet vulnerability between triumphs.',
      strengths: ['Mutual Inspiration', 'Fearless Spontaneity', 'Charismatic Public Aura'],
    };
  } else if (elemSun === 'Water' && elemMoon === 'Water') {
    archetypeInfo = {
      title: 'The Karmic Mirror',
      tagline: 'Profound Telepathic Intimacy & Soul Alchemy',
      symbol: '🌊🔮',
      forecast:
        'When your energies merge, unspoken words speak louder than everyday conversation through profound emotional telepathy. This bond serves as a spiritual sanctuary where both of your souls feel entirely seen and safeguarded.',
      karmicLesson: 'Maintaining healthy energetic boundaries so empathy remains empowering rather than overwhelming.',
      strengths: ['Telepathic Connection', 'Emotional Healing', 'Deep Devotion'],
    };
  } else if (elemSun === 'Earth' && elemMoon === 'Earth') {
    archetypeInfo = {
      title: 'The Sacred Anchors',
      tagline: 'Enduring Devotion & Golden Empire Builders',
      symbol: '🏛️✨',
      forecast:
        'Your relationship functions as an unshakeable fortress of trust, sensual luxury, and grounded loyalty. Together, you build tangible beauty and lasting security that stands the test of time.',
      karmicLesson: 'Embracing playful unpredictability to keep spontaneous romantic magic alive.',
      strengths: ['Unshakeable Stability', 'Sensory Indulgence', 'Long-term Prosperity'],
    };
  } else if (elemSun === 'Air' && elemMoon === 'Air') {
    archetypeInfo = {
      title: 'The Wandering Dreamers',
      tagline: 'Boundless Curiosity & Intellectual Kinship',
      symbol: '🕊️🌌',
      forecast:
        'Your connection is a perpetual fountain of brilliant ideas, philosophical epiphanies, and effortless laughter. You liberate each other from conventional limitations, turning everyday life into an ongoing intellectual adventure.',
      karmicLesson: 'Grounding ethereal concepts into heartfelt physical presence and shared rituals.',
      strengths: ['Infinite Conversation', 'Mutual Freedom', 'Visionary Collaboration'],
    };
  } else if (elemSun === 'Fire' || elemMoon === 'Fire') {
    archetypeInfo = {
      title: 'The Cosmic Alchemists',
      tagline: 'Dynamic Transformation & Magnetic Magnetism',
      symbol: '🔥💎',
      forecast:
        'Your combined dynamic is an electrifying catalyst that sparks radical growth and passionate awakening in both partners. The chemistry between your blueprints turns ordinary moments into unforgettable milestones.',
      karmicLesson: 'Honoring each other’s unique emotional rhythms during periods of intense transformation.',
      strengths: ['Magnetic Chemistry', 'Continuous Evolution', 'Passionate Drive'],
    };
  } else {
    archetypeInfo = {
      title: 'The Starlight Soulmates',
      tagline: 'Harmonious Elemental Resonance & Balanced Grace',
      symbol: '✨💫',
      forecast:
        'Your composite energy forms an extraordinarily balanced ecosystem where intuition and intellect flow seamlessly together. You provide each other with the exact emotional warmth and mental clarity needed to flourish.',
      karmicLesson: 'Celebrating the subtle differences that make your unified perspective so extraordinarily rich.',
      strengths: ['Elemental Harmony', 'Effortless Understanding', 'Enduring Romance'],
    };
  }

  const compositePlanets: CompositePlanet[] = [
    {
      planet: 'Composite Sun',
      sign: compSun,
      element: ZODIAC_SIGNS[compSun]?.element || 'Water',
      symbol: '☉',
      meaning: 'The core purpose, identity, and shared destiny of the relationship.',
    },
    {
      planet: 'Composite Moon',
      sign: compMoon,
      element: ZODIAC_SIGNS[compMoon]?.element || 'Water',
      symbol: '☽',
      meaning: 'The subconscious emotional sanctuary and instinctive way you nurture one another.',
    },
    {
      planet: 'Composite Rising',
      sign: compRising,
      element: ZODIAC_SIGNS[compRising]?.element || 'Fire',
      symbol: 'ASC',
      meaning: 'The magnetic first impression and public aura your partnership projects.',
    },
    {
      planet: 'Composite Venus',
      sign: compVenus,
      element: ZODIAC_SIGNS[compVenus]?.element || 'Water',
      symbol: '♀',
      meaning: 'The expression of romance, shared aesthetics, and mutual affection.',
    },
  ];

  return {
    archetype: archetypeInfo.title,
    archetypeTagline: archetypeInfo.tagline,
    archetypeSymbol: archetypeInfo.symbol,
    elementalBlend: `${elemSun} Sun × ${elemMoon} Moon Resonance`,
    aiForecast: archetypeInfo.forecast,
    compositeSun: compSun,
    compositeMoon: compMoon,
    compositeRising: compRising,
    compositeVenus: compVenus,
    compositePlanets,
    karmicLesson: archetypeInfo.karmicLesson,
    coreStrengths: archetypeInfo.strengths,
  };
}
