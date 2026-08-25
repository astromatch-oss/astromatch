import {
  ZodiacSign,
  BirthChart,
  CompatibilityResult,
  AstrologicalElement,
  SynastryAspect,
} from '@/types/astrology';
import { UserProfile } from '@/types/user';
import { ZODIAC_SIGNS } from './zodiacData';
import { computeCompleteNatalChart, getSunLongitude, calculateJulianDay } from './calculator';
import { findCityCoordinates } from './cities';

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

function getSignDistance(signA: ZodiacSign, signB: ZodiacSign): number {
  const idxA = ZODIAC_ORDER.indexOf(signA);
  const idxB = ZODIAC_ORDER.indexOf(signB);
  if (idxA === -1 || idxB === -1) return 0;
  const diff = Math.abs(idxA - idxB);
  return Math.min(diff, 12 - diff);
}

export interface IAstrologyService {
  calculateSunSign(birthDate: string): ZodiacSign;
  calculateBirthChart(
    birthDate: string,
    birthTime?: string,
    birthCity?: string,
    birthCountry?: string
  ): BirthChart;
  calculateSynastry(userA: Partial<UserProfile>, userB: Partial<UserProfile>): CompatibilityResult;
  getIcebreakerPrompts(signA: ZodiacSign, signB: ZodiacSign): string[];
  getDailyTransitForecast(sunSign: ZodiacSign): {
    headline: string;
    aspect: string;
    romanticEnergy: string;
    elementFocus: AstrologicalElement;
  };
}

class AstrologyServiceImpl implements IAstrologyService {
  /**
   * Deterministic Astronomical Sun Sign calculation based on solar longitude.
   */
  calculateSunSign(birthDate: string): ZodiacSign {
    if (!birthDate) return 'Aries';
    const parts = birthDate.split('-');
    if (parts.length < 3) return 'Aries';

    const year = parseInt(parts[0], 10) || 1998;
    const month = parseInt(parts[1], 10) || 1;
    const day = parseInt(parts[2], 10) || 1;

    const jd = calculateJulianDay(year, month, day, 12, 0);
    const sun = getSunLongitude(jd);
    return sun.sign;
  }

  /**
   * Astronomical Natal Chart Generator (Sun, Moon, Rising, Venus, Mars)
   */
  calculateBirthChart(
    birthDate: string,
    birthTime: string = '12:00',
    birthCity: string = 'Paris',
    birthCountry?: string
  ): BirthChart {
    const coords = findCityCoordinates(birthCity, birthCountry);
    return computeCompleteNatalChart(birthDate, birthTime, coords.lat, coords.lng);
  }

  /**
   * Multi-Aspect Synastry Compatibility Engine with detailed Planetary Aspects
   */
  calculateSynastry(userA: Partial<UserProfile>, userB: Partial<UserProfile>): CompatibilityResult {
    const sunA = (userA.sunSign || 'Scorpio') as ZodiacSign;
    const sunB = (userB.sunSign || 'Pisces') as ZodiacSign;
    const moonA = (userA.moonSign || userA.birthChart?.moon?.sign || 'Pisces') as ZodiacSign;
    const moonB = (userB.moonSign || userB.birthChart?.moon?.sign || 'Cancer') as ZodiacSign;
    const risingA = (userA.risingSign || userA.birthChart?.rising?.sign || 'Sagittarius') as ZodiacSign;
    const risingB = (userB.risingSign || userB.birthChart?.rising?.sign || 'Taurus') as ZodiacSign;
    const venusA = (userA.venusSign || userA.birthChart?.venus?.sign || 'Scorpio') as ZodiacSign;
    const marsB = (userB.marsSign || userB.birthChart?.mars?.sign || 'Taurus') as ZodiacSign;

    const infoSunA = ZODIAC_SIGNS[sunA] || ZODIAC_SIGNS['Scorpio'];
    const infoSunB = ZODIAC_SIGNS[sunB] || ZODIAC_SIGNS['Pisces'];
    const infoMoonA = ZODIAC_SIGNS[moonA] || ZODIAC_SIGNS['Pisces'];
    const infoMoonB = ZODIAC_SIGNS[moonB] || ZODIAC_SIGNS['Cancer'];

    // 1. Sun-Sun Elemental Harmony
    let sunElementalScore = 70;
    if (infoSunA.element === infoSunB.element) {
      sunElementalScore = 96;
    } else if (
      (infoSunA.element === 'Fire' && infoSunB.element === 'Air') ||
      (infoSunA.element === 'Air' && infoSunB.element === 'Fire') ||
      (infoSunA.element === 'Earth' && infoSunB.element === 'Water') ||
      (infoSunA.element === 'Water' && infoSunB.element === 'Earth')
    ) {
      sunElementalScore = 92;
    } else {
      sunElementalScore = 68;
    }

    // 2. Moon-Moon Emotional Resonance
    let moonScore = 75;
    if (infoMoonA.element === infoMoonB.element) {
      moonScore = 98;
    } else if (
      (infoMoonA.element === 'Water' && infoMoonB.element === 'Earth') ||
      (infoMoonA.element === 'Fire' && infoMoonB.element === 'Air')
    ) {
      moonScore = 91;
    } else {
      moonScore = 72;
    }

    // 3. Modality Interaction
    let modalityBonus = 0;
    if (infoSunA.modality === infoSunB.modality) {
      modalityBonus = infoSunA.modality === 'Fixed' ? -2 : 4;
    } else {
      modalityBonus = 6;
    }

    const overallScore = Math.min(99, Math.max(65, Math.round((sunElementalScore * 0.5 + moonScore * 0.5) + modalityBonus)));
    const communicationScore = Math.min(98, Math.max(68, 76 + ((sunA.length + sunB.length) % 18)));
    const passionScore = Math.min(99, Math.max(64, (infoSunA.element === 'Fire' || infoSunB.element === 'Fire' || infoMoonA.element === 'Water') ? 95 : 84));

    // Detailed Planetary Aspects Calculation
    const aspects: SynastryAspect[] = [];

    // Aspect 1: Sun to Sun
    const sunDist = getSignDistance(sunA, sunB);
    if (sunDist === 0) {
      aspects.push({
        planetA: 'Sun',
        planetB: 'Sun',
        userASign: sunA,
        userBSign: sunB,
        aspectType: 'Conjunction',
        score: 95,
        title: `${sunA} Sun Conjunction ${sunB} Sun`,
        interpretation: 'Shared core vital essence. You see yourselves in each other, validating core identities and fundamental drives with natural ease.',
        nature: 'Harmonious',
      });
    } else if (sunDist === 4) {
      aspects.push({
        planetA: 'Sun',
        planetB: 'Sun',
        userASign: sunA,
        userBSign: sunB,
        aspectType: 'Trine',
        score: 97,
        title: `${sunA} Sun Trine ${sunB} Sun`,
        interpretation: `Trine in ${infoSunA.element}. Exceptional natural flow, unforced respect, and shared life trajectory without competitive friction.`,
        nature: 'Harmonious',
      });
    } else if (sunDist === 2) {
      aspects.push({
        planetA: 'Sun',
        planetB: 'Sun',
        userASign: sunA,
        userBSign: sunB,
        aspectType: 'Sextile',
        score: 90,
        title: `${sunA} Sun Sextile ${sunB} Sun`,
        interpretation: 'Cooperative energetic synergy. Inspires playful conversations, mutual motivation, and effortless creative growth.',
        nature: 'Harmonious',
      });
    } else if (sunDist === 6) {
      aspects.push({
        planetA: 'Sun',
        planetB: 'Sun',
        userASign: sunA,
        userBSign: sunB,
        aspectType: 'Opposition',
        score: 86,
        title: `${sunA} Sun Opposition ${sunB} Sun`,
        interpretation: 'Magnetic cosmic polarity. You complete each other’s worldview through opposing but deeply complementary perspectives.',
        nature: 'Electric Passion',
      });
    } else if (sunDist === 3) {
      aspects.push({
        planetA: 'Sun',
        planetB: 'Sun',
        userASign: sunA,
        userBSign: sunB,
        aspectType: 'Square',
        score: 78,
        title: `${sunA} Sun Square ${sunB} Sun`,
        interpretation: 'Dynamic creative tension. Challenges both partners to evolve beyond their comfort zones, sparking continuous magnetic fascination.',
        nature: 'Dynamic Growth',
      });
    } else {
      aspects.push({
        planetA: 'Sun',
        planetB: 'Sun',
        userASign: sunA,
        userBSign: sunB,
        aspectType: 'Quincunx',
        score: 80,
        title: `${sunA} Sun Inconjunct ${sunB} Sun`,
        interpretation: 'Fascinating elemental riddle. Constant novelty where both partners discover intriguing, unexpected layers in each other.',
        nature: 'Dynamic Growth',
      });
    }

    // Aspect 2: Moon to Moon
    const moonDist = getSignDistance(moonA, moonB);
    if (moonDist === 0 || moonDist === 4) {
      aspects.push({
        planetA: 'Moon',
        planetB: 'Moon',
        userASign: moonA,
        userBSign: moonB,
        aspectType: moonDist === 0 ? 'Conjunction' : 'Trine',
        score: 99,
        title: `${moonA} Moon Trine ${moonB} Moon`,
        interpretation: `Deep emotional oceanic rhythm in ${infoMoonA.element}. You intuitively sense each other’s unspoken feelings and create an immediate sanctuary of emotional safety.`,
        nature: 'Soul Deep',
      });
    } else if (moonDist === 2 || (infoMoonA.element === 'Water' && infoMoonB.element === 'Earth')) {
      aspects.push({
        planetA: 'Moon',
        planetB: 'Moon',
        userASign: moonA,
        userBSign: moonB,
        aspectType: 'Sextile',
        score: 93,
        title: `${moonA} Moon Harmonic ${moonB} Moon`,
        interpretation: 'Nourishing emotional synthesis. Vulnerability is received with tenderness, patience, and steady domestic comfort.',
        nature: 'Harmonious',
      });
    } else {
      aspects.push({
        planetA: 'Moon',
        planetB: 'Moon',
        userASign: moonA,
        userBSign: moonB,
        aspectType: 'Square',
        score: 81,
        title: `${moonA} Moon Contrast ${moonB} Moon`,
        interpretation: 'Complementary emotional responses. One offers grounded calm while the other brings intuitive passion, expanding emotional range.',
        nature: 'Dynamic Growth',
      });
    }

    // Aspect 3: Venus to Mars
    const venusMarsDist = getSignDistance(venusA, marsB);
    aspects.push({
      planetA: 'Venus',
      planetB: 'Mars',
      userASign: venusA,
      userBSign: marsB,
      aspectType: venusMarsDist === 4 || venusMarsDist === 0 ? 'Trine' : venusMarsDist === 6 ? 'Opposition' : 'Sextile',
      score: 94,
      title: `${venusA} Venus Synastry ${marsB} Mars`,
      interpretation: 'Electric romantic and physical chemistry. Venusian desires align naturally with Martian assertiveness, igniting strong romantic magnetism.',
      nature: 'Electric Passion',
    });

    // Aspect 4: Sun to Moon (Classic Soulmate Synastry)
    const sunMoonDist = getSignDistance(sunA, moonB);
    aspects.push({
      planetA: 'Sun',
      planetB: 'Moon',
      userASign: sunA,
      userBSign: moonB,
      aspectType: sunMoonDist === 4 || sunMoonDist === 0 ? 'Trine' : 'Sextile',
      score: 96,
      title: `${sunA} Sun & ${moonB} Moon Harmony`,
      interpretation: 'Traditional archetype of profound synastry bond. Conscious life purpose (Sun) meshes effortlessly with subconscious emotional needs (Moon).',
      nature: 'Soul Deep',
    });

    // Element summary
    let elemTitle = '';
    let elemDesc = '';
    const elA = infoSunA.element;
    const elB = infoSunB.element;

    if (elA === elB) {
      elemTitle = `${elA} & ${elB} Elemental Harmony`;
      elemDesc = `Shared ${elA} constitution grants instant intuitive rapport, identical energetic tempo, and profound natural comfort.`;
    } else if ((elA === 'Water' && elB === 'Earth') || (elA === 'Earth' && elB === 'Water')) {
      elemTitle = 'Water & Earth: The Fertile Oasis';
      elemDesc = 'Water softens and enriches Earth, while Earth creates steady channels and safe shores for Water’s oceanic depth. Highly enduring union.';
    } else if ((elA === 'Fire' && elB === 'Air') || (elA === 'Air' && elB === 'Fire')) {
      elemTitle = 'Fire & Air: The Wildfire Catalyst';
      elemDesc = 'Air breathes boundless inspiration into Fire’s ambition, while Fire warms Air’s intellectual concepts into brilliant action. Electrifying spark.';
    } else if ((elA === 'Fire' && elB === 'Water') || (elA === 'Water' && elB === 'Fire')) {
      elemTitle = 'Fire & Water: Steamy Dynamic Alchemy';
      elemDesc = 'Intense emotional and physical attraction. Passionate warmth meets deep vulnerability, creating an exciting, transformative bond.';
    } else {
      elemTitle = `${elA} & ${elB} Complementary Synergy`;
      elemDesc = 'Unique polarity where both charts contribute missing perspectives, expanding each other’s horizons through continuous discovery.';
    }

    // Dynamic cosmic insights
    let summary = '';
    const strengths: string[] = [];
    const challenges: string[] = [];

    if (elA === elB) {
      summary = `Deep ${elA} resonance. You share an instinctive rhythm and natural worldview.`;
      strengths.push('Effortless mutual understanding', 'Shared instinctual values', 'Seamless energetic flow');
      challenges.push('Can amplify shared blind spots', 'Comfortable predictability');
    } else if ((elA === 'Fire' && elB === 'Air') || (elA === 'Air' && elB === 'Fire')) {
      summary = `Electric synergy of Fire and Air. Your thoughts and passions ignite continuous romantic inspiration.`;
      strengths.push('Brilliant intellectual banter', 'Inspiring mutual adventures', 'High creative spark');
      challenges.push('Remember to ground big dreams in daily routines');
    } else if ((elA === 'Earth' && elB === 'Water') || (elA === 'Water' && elB === 'Earth')) {
      summary = `Sensual synthesis of Earth and Water. A deeply nourishing, protective, and lasting celestial bond.`;
      strengths.push('Solid emotional safety', 'Devoted romantic loyalty', 'Complementary intuitive and practical gifts');
      challenges.push('Initial reserve before vulnerability');
    } else {
      summary = `Magnetic polarity of ${elA} and ${elB}. High attraction through complementary differences.`;
      strengths.push('Electric attraction', 'Expansive personal evolution', 'Always exciting');
      challenges.push('Pacing differences in emotional processing');
    }

    return {
      participants: [userA.userId || 'user1', userB.userId || 'user2'],
      overallScore,
      elementalHarmonyScore: sunElementalScore,
      emotionalScore: moonScore,
      communicationScore,
      passionScore,
      summary,
      strengths,
      challenges,
      cosmicAdvice: `Honour the gifts of ${infoSunA.name}'s ${infoSunA.element} nature alongside ${infoSunB.name}'s ${infoSunB.element} perspective for lasting celestial balance.`,
      aspects,
      elementSummary: {
        elementA: elA,
        elementB: elB,
        title: elemTitle,
        description: elemDesc,
      },
      isMockCalculation: false,
      calculatedAt: new Date().toISOString(),
    };
  }

  getIcebreakerPrompts(signA: ZodiacSign, signB: ZodiacSign): string[] {
    const infoA = ZODIAC_SIGNS[signA] || ZODIAC_SIGNS['Scorpio'];
    const infoB = ZODIAC_SIGNS[signB] || ZODIAC_SIGNS['Pisces'];

    return [
      `As a ${infoA.name}, what is something that immediately sparks your curiosity?`,
      `Since we have ${infoA.element} & ${infoB.element} energy, where is your dream celestial getaway?`,
      `What is your most authentic astrological trait, and what do people often misunderstand about your sign?`,
      `What is your favourite late-night stargazing conversation topic?`,
    ];
  }

  getDailyTransitForecast(sunSign: ZodiacSign): {
    headline: string;
    aspect: string;
    romanticEnergy: string;
    elementFocus: AstrologicalElement;
  } {
    const info = ZODIAC_SIGNS[sunSign] || ZODIAC_SIGNS['Scorpio'];
    return {
      headline: `Cosmic currents favour authentic emotional vulnerability for ${sunSign} today.`,
      aspect: `Venus in favorable trine to your ruling ${info.rulingPlanet}`,
      romanticEnergy: `Magnetic & Receptive (94% Alignment)`,
      elementFocus: info.element,
    };
  }
}

export const astrologyService = new AstrologyServiceImpl();
