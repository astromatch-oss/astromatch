import { ZodiacSign, BirthChart } from './astrology';

export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type InterestedIn = 'male' | 'female' | 'everyone';
export type RelationshipIntent =
  | 'long-term'
  | 'short-term'
  | 'marriage'
  | 'friendship'
  | 'casual'
  | 'figuring-out';

export type SubscriptionTier = 'free' | 'plus' | 'vip';

export interface UserLocation {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  dateOfBirth: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  birthCity: string;
  birthCountry: string;
  gender: Gender;
  interestedIn: InterestedIn;
  age: number;
  bio: string;
  profilePhotos: string[];
  location: UserLocation;
  relationshipIntent: RelationshipIntent;
  interests: string[];
  
  // Astrological Data
  sunSign: ZodiacSign;
  moonSign?: ZodiacSign;
  risingSign?: ZodiacSign;
  venusSign?: ZodiacSign;
  marsSign?: ZodiacSign;
  birthChart?: BirthChart;
  astrologyCompleted: boolean;

  // Subscription & Monetization
  subscriptionTier?: SubscriptionTier;
  superLikesRemaining?: number;
  boostActiveUntil?: string;

  // Status & Timestamps
  isOnline?: boolean;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  role?: 'user' | 'admin' | 'moderator';
  subscriptionTier?: SubscriptionTier;
  isAnonymous?: boolean;
  isOnboarded: boolean;
  createdAt: string;
}
