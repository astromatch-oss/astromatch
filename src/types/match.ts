import { CompatibilityResult } from './astrology';
import { UserProfile } from './user';

export type LikeActionType = 'like' | 'pass' | 'superlike';

export interface Like {
  id?: string;
  fromUserId: string;
  toUserId: string;
  action: LikeActionType;
  createdAt: string;
}

export interface Match {
  id: string;
  users: [string, string];
  profiles: {
    [userId: string]: {
      firstName: string;
      photo: string;
      sunSign: string;
      age: number;
    };
  };
  compatibility?: CompatibilityResult;
  lastMessage?: {
    text: string;
    senderId: string;
    sentAt: string;
    read: boolean;
  };
  unreadCount?: {
    [userId: string]: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryCardItem {
  profile: UserProfile;
  compatibilityScore: number;
  synastrySummary: string;
}
