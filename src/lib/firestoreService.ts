import { db } from './firebase';
import { UserAccount, UserProfile } from '@/types/user';
import { Match, Like, LikeActionType } from '@/types/match';
import { ChatMessage } from '@/types/chat';
import { MOCK_DISCOVER_PROFILES, MOCK_INITIAL_MATCHES } from './mockData';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';

/**
 * Timeout helper to prevent hanging Firestore network operations
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);
  });
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return res;
  } catch {
    clearTimeout(timer!);
    return fallback;
  }
}

/**
 * 1. User Account Documents (users/{userId})
 */
export async function saveUserAccount(userAccount: UserAccount): Promise<void> {
  if (!db) return;
  try {
    const userRef = doc(db, 'users', userAccount.uid);
    await withTimeout(
      setDoc(
        userRef,
        {
          ...userAccount,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
      2500,
      undefined
    );
  } catch (err) {
    console.warn('Firestore saveUserAccount note:', err);
  }
}

export async function getUserAccount(userId: string): Promise<UserAccount | null> {
  if (!db) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await withTimeout(getDoc(userRef), 2500, null as any);
    if (snap && snap.exists()) {
      return snap.data() as UserAccount;
    }
  } catch (err) {
    console.warn('Firestore getUserAccount note:', err);
  }
  return null;
}

/**
 * 2. User Dating Profile Documents (profiles/{userId})
 * Stores full natal coordinates, computed zodiac signs, interests, bio, photos
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!db) return;
  try {
    const profileRef = doc(db, 'profiles', profile.userId);
    await withTimeout(
      setDoc(
        profileRef,
        {
          ...profile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ),
      2500,
      undefined
    );

    // Also update users/{userId} isOnboarded flag
    const userRef = doc(db, 'users', profile.userId);
    await withTimeout(
      setDoc(
        userRef,
        {
          isOnboarded: profile.astrologyCompleted,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ),
      2500,
      undefined
    );
  } catch (err) {
    console.warn('Firestore saveUserProfile note:', err);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const profileRef = doc(db, 'profiles', userId);
    const snap = await withTimeout(getDoc(profileRef), 2500, null as any);
    if (snap && snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore getUserProfile note:', err);
  }
  return null;
}

/**
 * 3. Discover Feed: Query active dating profiles
 */
export async function getDiscoverProfiles(
  currentUserId: string,
  excludeIds: string[] = []
): Promise<UserProfile[]> {
  if (!db) {
    return MOCK_DISCOVER_PROFILES.filter(
      (p) => p.userId !== currentUserId && !excludeIds.includes(p.userId)
    );
  }

  try {
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, limit(25));
    const snapshot = await withTimeout(getDocs(q), 2500, null as any);

    if (snapshot && snapshot.forEach) {
      const fetched: UserProfile[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data() as UserProfile;
        if (data.userId !== currentUserId && !excludeIds.includes(data.userId)) {
          fetched.push(data);
        }
      });

      if (fetched.length > 0) {
        const existingIds = new Set(fetched.map((f) => f.userId));
        const seeds = MOCK_DISCOVER_PROFILES.filter(
          (p) => p.userId !== currentUserId && !excludeIds.includes(p.userId) && !existingIds.has(p.userId)
        );
        return [...fetched, ...seeds];
      }
    }
  } catch (err) {
    console.warn('Firestore getDiscoverProfiles fallback to seeds:', err);
  }

  return MOCK_DISCOVER_PROFILES.filter(
    (p) => p.userId !== currentUserId && !excludeIds.includes(p.userId)
  );
}

/**
 * 4. Likes & Mutual Matching Engine
 */
export async function recordLike(
  fromUserId: string,
  toUserId: string,
  action: LikeActionType
): Promise<{ isMutual: boolean }> {
  const likeDocId = `${fromUserId}_${toUserId}`;

  if (db) {
    try {
      const likeRef = doc(db, 'likes', likeDocId);
      await withTimeout(
        setDoc(likeRef, {
          fromUserId,
          toUserId,
          action,
          createdAt: new Date().toISOString(),
        }),
        2500,
        undefined
      );

      const reverseLikeRef = doc(db, 'likes', `${toUserId}_${fromUserId}`);
      const reverseSnap = await withTimeout(getDoc(reverseLikeRef), 2500, null as any);

      if (reverseSnap && reverseSnap.exists()) {
        const reverseData = reverseSnap.data();
        if (reverseData.action === 'like' || reverseData.action === 'superlike') {
          return { isMutual: true };
        }
      }
    } catch (err) {
      console.warn('Firestore recordLike note:', err);
    }
  }

  const isSeedMutual = ['user-elena', 'user-julian', 'user-sophie', 'user-lucas'].includes(toUserId) || action === 'superlike';
  return { isMutual: isSeedMutual };
}

/**
 * 5. Matches Collection
 */
export async function createFirestoreMatch(match: Match): Promise<void> {
  if (!db) return;
  try {
    const matchRef = doc(db, 'matches', match.id);
    await withTimeout(
      setDoc(matchRef, {
        ...match,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      2500,
      undefined
    );
  } catch (err) {
    console.warn('Firestore createMatch note:', err);
  }
}

export function subscribeToUserMatches(
  userId: string,
  onUpdate: (matches: Match[]) => void
): () => void {
  if (!db) {
    onUpdate(MOCK_INITIAL_MATCHES);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveMatches: Match[] = [];
        snapshot.forEach((docSnap) => {
          liveMatches.push({ id: docSnap.id, ...docSnap.data() } as Match);
        });

        if (liveMatches.length > 0) {
          onUpdate(liveMatches);
        } else {
          onUpdate(MOCK_INITIAL_MATCHES);
        }
      },
      (error) => {
        console.warn('Matches subscription note:', error);
        onUpdate(MOCK_INITIAL_MATCHES);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore subscription fallback:', err);
    onUpdate(MOCK_INITIAL_MATCHES);
    return () => {};
  }
}

/**
 * 6. Chat Messages Subcollection (matches/{matchId}/messages)
 */
export async function sendChatMessage(
  matchId: string,
  message: ChatMessage
): Promise<void> {
  if (!db) return;
  try {
    const messagesCol = collection(db, `matches/${matchId}/messages`);
    await withTimeout(
      addDoc(messagesCol, {
        ...message,
        createdAt: serverTimestamp(),
      }),
      2500,
      undefined
    );

    const matchRef = doc(db, 'matches', matchId);
    await withTimeout(
      updateDoc(matchRef, {
        lastMessage: {
          text: message.text,
          senderId: message.senderId,
          sentAt: new Date().toISOString(),
          read: false,
        },
        updatedAt: serverTimestamp(),
      }),
      2500,
      undefined
    );
  } catch (err) {
    console.warn('Firestore sendChatMessage note:', err);
  }
}

export function subscribeToMatchMessages(
  matchId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  if (!db) return () => {};

  try {
    const q = query(
      collection(db, `matches/${matchId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveMsgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          liveMsgs.push({
            id: docSnap.id,
            matchId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            text: data.text,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            read: Boolean(data.read),
            type: data.type || 'text',
          });
        });
        if (liveMsgs.length > 0) {
          onUpdate(liveMsgs);
        }
      },
      (err) => {
        console.warn('Chat subscription note:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Chat subscription error:', err);
    return () => {};
  }
}
