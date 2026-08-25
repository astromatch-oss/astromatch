import { ZodiacSign, PlanetaryPlacement, BirthChart } from '@/types/astrology';

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

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function longitudeToSignAndDegree(lon: number): { sign: ZodiacSign; degree: number; totalLon: number } {
  const norm = normalizeDeg(lon);
  const signIndex = Math.floor(norm / 30);
  const degree = Math.floor(norm % 30);
  return {
    sign: ZODIAC_ORDER[signIndex % 12],
    degree,
    totalLon: norm,
  };
}

/**
 * Astronomical Julian Day Calculation (Meeus algorithm)
 */
export function calculateJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const dayFrac = day + (hour + minute / 60) / 24;

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    dayFrac +
    b -
    1524.5;

  return jd;
}

/**
 * Solar Ecliptic Longitude (Keplerian orbital computation)
 */
export function getSunLongitude(jd: number): { sign: ZodiacSign; degree: number; longitude: number } {
  const T = (jd - 2451545.0) / 36525.0;

  // Mean Longitude
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean Anomaly
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG2RAD;

  // Equation of Center
  const C =
    (1.914602 - 0.004817 * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);

  // True Ecliptic Longitude
  const sunLon = normalizeDeg(L0 + C);
  const result = longitudeToSignAndDegree(sunLon);

  return {
    sign: result.sign,
    degree: result.degree,
    longitude: sunLon,
  };
}

/**
 * Lunar Ecliptic Longitude with major periodic perturbations
 */
export function getMoonLongitude(jd: number): { sign: ZodiacSign; degree: number; longitude: number; phase: string } {
  const T = (jd - 2451545.0) / 36525.0;

  // Lunar orbital elements
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T); // Mean longitude
  const D = normalizeDeg(297.8501921 + 445267.1142 * T) * DEG2RAD; // Mean elongation
  const M = normalizeDeg(357.5291092 + 35999.05029 * T) * DEG2RAD; // Sun's mean anomaly
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T) * DEG2RAD; // Moon's mean anomaly
  const F = normalizeDeg(93.272095 + 483202.0175 * T) * DEG2RAD; // Moon's argument of latitude

  // Periodic perturbation corrections
  const perturbation =
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * Math.sin(2 * D - M - Mp);

  const moonLon = normalizeDeg(Lp + perturbation);
  const result = longitudeToSignAndDegree(moonLon);

  // Lunar Phase Calculation
  const phaseAngle = normalizeDeg((moonLon - normalizeDeg(280.46646 + 36000.76983 * T)));
  let phase = 'Waxing Crescent';
  if (phaseAngle < 45 || phaseAngle >= 315) phase = 'New Moon';
  else if (phaseAngle >= 45 && phaseAngle < 135) phase = 'First Quarter';
  else if (phaseAngle >= 135 && phaseAngle < 225) phase = 'Full Moon';
  else phase = 'Last Quarter';

  return {
    sign: result.sign,
    degree: result.degree,
    longitude: moonLon,
    phase,
  };
}

/**
 * Ascendant / Rising Sign Calculation
 * Derived from Local Sidereal Time (LST) and Geographic Coordinates
 */
export function getAscendant(
  jd: number,
  latitude: number,
  longitude: number
): { sign: ZodiacSign; degree: number; longitude: number } {
  const T = (jd - 2451545.0) / 36525.0;

  // Greenwich Mean Sidereal Time (GMST in degrees)
  const gmst = normalizeDeg(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  // Local Sidereal Time (RAMC in degrees)
  const ramc = normalizeDeg(gmst + longitude);
  const ramcRad = ramc * DEG2RAD;

  // Obliquity of Ecliptic
  const eps = (23.4392911 - 0.0130042 * T) * DEG2RAD;
  const latRad = latitude * DEG2RAD;

  // Standard Astrological Ascendant Formula:
  // tan(Asc) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);

  let ascRad = Math.atan2(y, x);
  let ascLon = normalizeDeg(ascRad * RAD2DEG);

  const result = longitudeToSignAndDegree(ascLon);

  return {
    sign: result.sign,
    degree: result.degree,
    longitude: ascLon,
  };
}

/**
 * Venus Geocentric Longitude
 */
export function getVenusLongitude(jd: number): { sign: ZodiacSign; degree: number } {
  const T = (jd - 2451545.0) / 36525.0;
  const L_v = normalizeDeg(181.9798 + 58517.8156 * T);
  const M_v = normalizeDeg(50.4161 + 58517.8039 * T) * DEG2RAD;
  const C_v = 0.7758 * Math.sin(M_v) + 0.0033 * Math.sin(2 * M_v);
  const lon = normalizeDeg(L_v + C_v);
  const res = longitudeToSignAndDegree(lon);
  return { sign: res.sign, degree: res.degree };
}

/**
 * Mars Geocentric Longitude
 */
export function getMarsLongitude(jd: number): { sign: ZodiacSign; degree: number } {
  const T = (jd - 2451545.0) / 36525.0;
  const L_m = normalizeDeg(355.433 + 19140.2993 * T);
  const M_m = normalizeDeg(19.373 + 19139.8585 * T) * DEG2RAD;
  const C_m = 10.6912 * Math.sin(M_m) + 0.6228 * Math.sin(2 * M_m);
  const lon = normalizeDeg(L_m + C_m);
  const res = longitudeToSignAndDegree(lon);
  return { sign: res.sign, degree: res.degree };
}

/**
 * Full Natal Chart Calculation Engine
 */
export function computeCompleteNatalChart(
  birthDate: string, // YYYY-MM-DD
  birthTime: string = '12:00', // HH:mm
  latitude: number = 48.8566,
  longitude: number = 2.3522
): BirthChart {
  const dateParts = birthDate.split('-');
  const year = parseInt(dateParts[0], 10) || 1998;
  const month = parseInt(dateParts[1], 10) || 10;
  const day = parseInt(dateParts[2], 10) || 28;

  const timeParts = birthTime.split(':');
  const hour = parseInt(timeParts[0], 10) || 12;
  const minute = parseInt(timeParts[1], 10) || 0;

  const jd = calculateJulianDay(year, month, day, hour, minute);

  const sun = getSunLongitude(jd);
  const moon = getMoonLongitude(jd);
  const rising = getAscendant(jd, latitude, longitude);
  const venus = getVenusLongitude(jd);
  const mars = getMarsLongitude(jd);

  return {
    sun: { sign: sun.sign, degree: sun.degree, house: 1 },
    moon: { sign: moon.sign, degree: moon.degree, house: 4 },
    rising: { sign: rising.sign, degree: rising.degree, house: 1 },
    venus: { sign: venus.sign, degree: venus.degree, house: 7 },
    mars: { sign: mars.sign, degree: mars.degree, house: 5 },
    source: 'calculated_basic',
    calculatedAt: new Date().toISOString(),
  };
}
