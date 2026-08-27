/**
 * Cosmic Orbit Location Service
 * Handles Geolocation via @capacitor/geolocation with web browser fallback,
 * Haversine distance calculation, and proximity formatting.
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationResult {
  coords: GeoCoordinates | null;
  source: 'capacitor' | 'browser' | 'default';
  error?: string;
}

// Default fallback coordinates (Paris center) if GPS is denied or unavailable
export const DEFAULT_COORDINATES: GeoCoordinates = {
  latitude: 48.8566,
  longitude: 2.3522,
};

/**
 * Request device location via @capacitor/geolocation with browser fallback
 */
export async function getCurrentUserLocation(): Promise<LocationResult> {
  // 1. Try @capacitor/geolocation
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const permission = await Geolocation.checkPermissions();

    if (permission.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      if (requested.location !== 'granted') {
        throw new Error('Location permission denied');
      }
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
      source: 'capacitor',
    };
  } catch (capError: any) {
    // 2. Fallback to standard browser navigator.geolocation
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      return new Promise<LocationResult>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              },
              source: 'browser',
            });
          },
          (err) => {
            console.warn('Browser geolocation note:', err.message);
            resolve({
              coords: DEFAULT_COORDINATES,
              source: 'default',
              error: err.message,
            });
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
      });
    }

    return {
      coords: DEFAULT_COORDINATES,
      source: 'default',
      error: capError?.message || 'Geolocation not supported',
    };
  }
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance in a human-friendly string (e.g. "120m away", "1.4 km away")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 0.05) {
    return 'Right here (< 50m)';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters}m away`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km away`;
  }
  return `${Math.round(distanceKm)} km away`;
}

/**
 * Generate a realistic geographic offset around a base location for discovery profiles
 */
export function getProximityOffsetCoordinates(
  baseLat: number,
  baseLng: number,
  index: number,
  total: number
): { lat: number; lng: number } {
  // Disperse profiles in concentric radius rings (between 100m and 4.5km)
  const angle = (index / total) * 2 * Math.PI + (index * 0.47);
  // Distance from 0.12km to 4.2km
  const distanceKm = 0.12 + (index % 5) * 0.65 + (index * 0.15);
  
  // 1 degree latitude ~ 111km
  const deltaLat = (distanceKm * Math.cos(angle)) / 111;
  // 1 degree longitude ~ 111km * cos(lat)
  const deltaLng =
    (distanceKm * Math.sin(angle)) / (111 * Math.cos(toRad(baseLat)));

  return {
    lat: baseLat + deltaLat,
    lng: baseLng + deltaLng,
  };
}
