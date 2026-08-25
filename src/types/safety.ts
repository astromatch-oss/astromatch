export type ReportReason =
  | 'inappropriate_content'
  | 'harassment_or_hate'
  | 'fake_profile_or_scam'
  | 'underage'
  | 'spam'
  | 'other';

export interface UserReport {
  id?: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: string;
}

export interface UserBlock {
  id?: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface UserSubscription {
  userId: string;
  plan: 'free' | 'cosmic_plus' | 'celestial_vip';
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: string;
  features: {
    unlimitedLikes: boolean;
    seeWhoLikedYou: boolean;
    advancedSynastryReports: boolean;
    astrologicalIcebreakers: boolean;
    priorityCosmicBoost: boolean;
  };
}
