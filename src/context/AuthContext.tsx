'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserAccount, UserProfile, SubscriptionTier } from '@/types/user';
import { MOCK_CURRENT_USER } from '@/lib/mockData';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import {
  saveUserAccount,
  saveUserProfile,
  getUserProfile,
  getUserAccount,
} from '@/lib/firestoreService';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  deleteUser as firebaseDeleteUser,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';

interface AuthContextType {
  user: UserAccount | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoUser: () => void;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (newProfile: UserProfile) => Promise<void>;
  upgradeSubscriptionTier: (tier: SubscriptionTier) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize Auth State & Firestore sync
  useEffect(() => {
    const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('astromatch_demo_session') : null;
    const savedProfile = typeof window !== 'undefined' ? localStorage.getItem('astromatch_demo_profile') : null;

    if (savedDemo === 'true') {
      setIsDemoMode(true);
      const parsed = savedProfile ? JSON.parse(savedProfile) : MOCK_CURRENT_USER;
      setUser({
        uid: 'demo-user-1',
        email: 'aria.scorpio@astromatch.app',
        displayName: 'Aria',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        isOnboarded: true,
        subscriptionTier: parsed.subscriptionTier || 'vip',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      setProfile(parsed);
      setIsLoading(false);
      return;
    }

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          // Fetch existing Firestore account and profile
          const [existingAccount, existingProfile] = await Promise.all([
            getUserAccount(fbUser.uid),
            getUserProfile(fbUser.uid),
          ]);

          const userAccount: UserAccount = existingAccount || {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            isOnboarded: Boolean(existingProfile?.astrologyCompleted),
            subscriptionTier: existingProfile?.subscriptionTier || 'free',
            role: fbUser.email?.includes('admin') ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
          };

          // Save account document if new
          if (!existingAccount) {
            await saveUserAccount(userAccount);
          }

          setUser(userAccount);
          setProfile(existingProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemoUser = () => {
    setIsDemoMode(true);
    const demoAccount: UserAccount = {
      uid: 'demo-user-1',
      email: 'aria.scorpio@astromatch.app',
      displayName: 'Aria',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      isOnboarded: true,
      subscriptionTier: 'vip',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    setUser(demoAccount);
    setProfile({ ...MOCK_CURRENT_USER, subscriptionTier: 'vip' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('astromatch_demo_session', 'true');
      localStorage.setItem('astromatch_demo_profile', JSON.stringify({ ...MOCK_CURRENT_USER, subscriptionTier: 'vip' }));
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth || !isFirebaseConfigured) {
      loginAsDemoUser();
      return;
    }
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const [fetchedAccount, fetchedProfile] = await Promise.all([
      getUserAccount(cred.user.uid),
      getUserProfile(cred.user.uid),
    ]);

    if (fetchedAccount) setUser(fetchedAccount);
    if (fetchedProfile) setProfile(fetchedProfile);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    if (!auth || !isFirebaseConfigured) {
      loginAsDemoUser();
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && cred.user) {
      await firebaseUpdateProfile(cred.user, { displayName });
    }

    const newAccount: UserAccount = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: displayName || cred.user.displayName,
      photoURL: cred.user.photoURL,
      isOnboarded: false,
      subscriptionTier: 'free',
      role: email.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    await saveUserAccount(newAccount);
    setUser(newAccount);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      loginAsDemoUser();
      return;
    }
    // Use redirect instead of popup to fix Vercel/mobile auth blocks
    await signInWithRedirect(auth, googleProvider);
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile: UserProfile = {
      ...profile,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    setProfile(newProfile);

    if (isDemoMode || !isFirebaseConfigured) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('astromatch_demo_profile', JSON.stringify(newProfile));
      }
      return;
    }

    await saveUserProfile(newProfile);
  };

  const completeOnboarding = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    
    // Always store in localStorage immediately for resilient offline/demo capability
    if (typeof window !== 'undefined') {
      localStorage.setItem('astromatch_demo_profile', JSON.stringify(newProfile));
      localStorage.setItem('astromatch_demo_session', 'true');
    }

    if (user) {
      const updatedUser = { ...user, isOnboarded: true };
      setUser(updatedUser);
      saveUserAccount(updatedUser).catch((e) => console.warn('saveUserAccount note:', e));
    } else {
      const fallbackAccount: UserAccount = {
        uid: newProfile.userId || 'demo-user-1',
        email: 'user@astromatch.app',
        displayName: newProfile.firstName,
        photoURL: newProfile.profilePhotos[0] || null,
        isOnboarded: true,
        subscriptionTier: newProfile.subscriptionTier || 'free',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackAccount);
    }

    // Persist full profile to Firestore in background with timeout safety
    try {
      await saveUserProfile(newProfile);
    } catch (err) {
      console.warn('Firestore profile persist note:', err);
    }
  };

  const upgradeSubscriptionTier = async (tier: SubscriptionTier) => {
    if (profile) {
      const updatedProfile = { ...profile, subscriptionTier: tier };
      setProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('astromatch_demo_profile', JSON.stringify(updatedProfile));
      }
      saveUserProfile(updatedProfile).catch((e) => console.warn('Save tier note:', e));
    }
    if (user) {
      const updatedUser = { ...user, subscriptionTier: tier };
      setUser(updatedUser);
      saveUserAccount(updatedUser).catch((e) => console.warn('Save account tier note:', e));
    }
  };

  const signOut = async () => {
    setIsDemoMode(false);
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('astromatch_demo_session');
      localStorage.removeItem('astromatch_demo_profile');
    }
    if (auth) {
      await firebaseSignOut(auth);
    }
  };

  const deleteAccount = async () => {
    if (auth?.currentUser) {
      await firebaseDeleteUser(auth.currentUser);
    }
    await signOut();
  };

  const isAdmin = Boolean(user?.role === 'admin' || user?.email?.includes('admin') || isDemoMode);
  const subscriptionTier: SubscriptionTier = profile?.subscriptionTier || user?.subscriptionTier || (isDemoMode ? 'vip' : 'free');
  const isPremium = subscriptionTier === 'plus' || subscriptionTier === 'vip';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isDemoMode,
        isAdmin,
        isPremium,
        subscriptionTier,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsDemoUser,
        updateProfile,
        completeOnboarding,
        upgradeSubscriptionTier,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
