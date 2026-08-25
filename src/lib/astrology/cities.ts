export interface CityLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezoneOffset?: number; // Approximate UTC offset in hours
}

export const POPULAR_CITIES: CityLocation[] = [
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, timezoneOffset: 1 },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezoneOffset: 0 },
  { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, timezoneOffset: -5 },
  { city: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, timezoneOffset: -8 },
  { city: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, timezoneOffset: -8 },
  { city: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298, timezoneOffset: -6 },
  { city: 'Miami', country: 'United States', lat: 25.7617, lng: -80.1918, timezoneOffset: -5 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezoneOffset: -5 },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, timezoneOffset: -8 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, timezoneOffset: 9 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, timezoneOffset: 1 },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, timezoneOffset: 1 },
  { city: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558, timezoneOffset: 1 },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, timezoneOffset: 1 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, timezoneOffset: 1 },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, timezoneOffset: 1 },
  { city: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, timezoneOffset: 1 },
  { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, timezoneOffset: 1 },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, timezoneOffset: 1 },
  { city: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, timezoneOffset: 2 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezoneOffset: 10 },
  { city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, timezoneOffset: 10 },
  { city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, timezoneOffset: 12 },
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, timezoneOffset: -3 },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, timezoneOffset: -3 },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, timezoneOffset: -3 },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, timezoneOffset: -6 },
  { city: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, timezoneOffset: 4 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, timezoneOffset: 8 },
  { city: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, timezoneOffset: 8 },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978, timezoneOffset: 9 },
  { city: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777, timezoneOffset: 5.5 },
  { city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209, timezoneOffset: 5.5 },
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, timezoneOffset: 2 },
  { city: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241, timezoneOffset: 2 },
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, timezoneOffset: 7 },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, timezoneOffset: 3 },
  { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, timezoneOffset: 0 },
  { city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, timezoneOffset: 0 },
  { city: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, timezoneOffset: 1 },
];

export function searchCities(queryStr: string): CityLocation[] {
  if (!queryStr || queryStr.trim().length === 0) {
    return POPULAR_CITIES.slice(0, 8);
  }
  const clean = queryStr.toLowerCase().trim();
  return POPULAR_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(clean) ||
      c.country.toLowerCase().includes(clean)
  ).slice(0, 6);
}

export function findCityCoordinates(city: string, country?: string): { lat: number; lng: number } {
  const match = POPULAR_CITIES.find(
    (c) =>
      c.city.toLowerCase() === city.toLowerCase() ||
      (country && c.country.toLowerCase() === country.toLowerCase())
  );
  if (match) {
    return { lat: match.lat, lng: match.lng };
  }
  // Default coordinates (Paris, France - celestial center)
  return { lat: 48.8566, lng: 2.3522 };
}
