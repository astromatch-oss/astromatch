'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { Match, LikeActionType } from '@/types/match';
import { MOCK_INITIAL_MATCHES } from '@/lib/mockData';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { useAuth } from './AuthContext';
import { submitUserBlock, submitUserReport } from '@/lib/safety';
import { ReportReason } from '@/types/safety';
import {
  getDiscoverProfiles,
  recordLike,
  createFirestoreMatch,
  subscribeToUserMatches,
} from '@/lib/firestoreService';

interface MatchContextType {
  discoverProfiles: UserProfile[];
  currentProfileIndex: number;
  currentProfile: UserProfile | null;
  matches: Match[];
  newMatchModalData: { match: Match; partnerProfile: UserProfile } | null;
  blockedUserIds: string[];
  likeProfile: (profile: UserProfile, action?: LikeActionType) => Promise<boolean>;
  passProfile: (profile: UserProfile) => void;
  closeMatchModal: () => void;
  blockProfile: (userId: string) => Promise<void>;
  reportProfile: (userId: string, reason: ReportReason, details?: string) => Promise<void>;
  refreshDiscover: () => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [discoverProfiles, setDiscoverProfiles] = useState<UserProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>(MOCK_INITIAL_MATCHES);
  const [newMatchModalData, setNewMatchModalData] = useState<{
    match: Match;
    partnerProfile: UserProfile;
  } | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [swipedUserIds, setSwipedUserIds] = useState<Set<string>>(new Set());

  // Load blocked user IDs from local storage
  useEffect(() => {
    const savedBlocks = typeof window !== 'undefined' ? localStorage.getItem('astromatch_blocked') : null;
    const blocks: string[] = savedBlocks ? JSON.parse(savedBlocks) : [];
    setBlockedUserIds(blocks);
  }, []);

  // Fetch discover profiles from Firestore
  const fetchProfiles = useCallback(async () => {
    const currentUid = profile?.userId || user?.uid || 'demo-user-1';
    const profiles = await getDiscoverProfiles(currentUid, blockedUserIds);
    setDiscoverProfiles(profiles);
    setCurrentProfileIndex(0);
  }, [profile?.userId, user?.uid, blockedUserIds]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Real-time Firestore subscription for user's matches
  useEffect(() => {
    const currentUid = profile?.userId || user?.uid;
    if (!currentUid) return;

    const unsubscribe = subscribeToUserMatches(currentUid, (liveMatches) => {
      setMatches(liveMatches);
    });

    return () => unsubscribe();
  }, [profile?.userId, user?.uid]);

  const currentProfile = discoverProfiles[currentProfileIndex] || null;

  const advanceCard = () => {
    setCurrentProfileIndex((prev) => prev + 1);
  };

  const likeProfileHandler = async (
    targetProfile: UserProfile,
    action: LikeActionType = 'like'
  ): Promise<boolean> => {
    setSwipedUserIds((prev) => new Set(prev).add(targetProfile.userId));
    advanceCard();

    const currentUserId = profile?.userId || user?.uid || 'demo-user-1';
    const currentUserName = profile?.firstName || user?.displayName || 'Aria';
    const currentUserPhoto =
      profile?.profilePhotos?.[0] ||
      user?.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
    const currentUserSign = profile?.sunSign || 'Scorpio';
    const currentUserAge = profile?.age || 26;

    // Record like in Firestore and check if mutual
    const { isMutual } = await recordLike(currentUserId, targetProfile.userId, action);

    if (isMutual) {
      const synastry = astrologyService.calculateSynastry(
        profile || { userId: currentUserId, sunSign: currentUserSign },
        targetProfile
      );

      const newMatch: Match = {
        id: `match-${Date.now()}-${targetProfile.userId}`,
        users: [currentUserId, targetProfile.userId],
        profiles: {
          [currentUserId]: {
            firstName: currentUserName,
            photo: currentUserPhoto,
            sunSign: currentUserSign,
            age: currentUserAge,
          },
          [targetProfile.userId]: {
            firstName: targetProfile.firstName,
            photo: targetProfile.profilePhotos?.[0] || '',
            sunSign: targetProfile.sunSign,
            age: targetProfile.age,
          },
        },
        compatibility: synastry,
        lastMessage: {
          text: `Planets aligned! ${synastry.overallScore}% celestial synergy ✨`,
          senderId: 'system',
          sentAt: new Date().toISOString(),
          read: false,
        },
        unreadCount: {
          [currentUserId]: 1,
          [targetProfile.userId]: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save match to Firestore
      await createFirestoreMatch(newMatch);

      // Local state fallback update
      setMatches((prev) => [newMatch, ...prev.filter((m) => !m.users.includes(targetProfile.userId))]);
      setNewMatchModalData({ match: newMatch, partnerProfile: targetProfile });

      return true;
    }

    return false;
  };

  const passProfileHandler = (targetProfile: UserProfile) => {
    setSwipedUserIds((prev) => new Set(prev).add(targetProfile.userId));
    advanceCard();
  };

  const closeMatchModal = () => {
    setNewMatchModalData(null);
  };

  const blockProfile = async (userId: string) => {
    const updatedBlocks = [...blockedUserIds, userId];
    setBlockedUserIds(updatedBlocks);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astromatch_blocked', JSON.stringify(updatedBlocks));
    }
    setDiscoverProfiles((prev) => prev.filter((p) => p.userId !== userId));
    setMatches((prev) => prev.filter((m) => !m.users.includes(userId)));
    await submitUserBlock(userId);
  };

  const reportProfile = async (userId: string, reason: ReportReason, details?: string) => {
    await submitUserReport(userId, reason, details);
    await blockProfile(userId);
  };

  const refreshDiscover = () => {
    fetchProfiles();
    setSwipedUserIds(new Set());
  };

  return (
    <MatchContext.Provider
      value={{
        discoverProfiles,
        currentProfileIndex,
        currentProfile,
        matches,
        newMatchModalData,
        blockedUserIds,
        likeProfile: likeProfileHandler,
        passProfile: passProfileHandler,
        closeMatchModal,
        blockProfile,
        reportProfile,
        refreshDiscover,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};
