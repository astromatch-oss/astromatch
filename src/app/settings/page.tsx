'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { PhotoUpload } from '@/components/profile/PhotoUpload';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import {
  Shield,
  Trash2,
  LogOut,
  Save,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Camera,
  X,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, updateProfile, signOut, deleteAccount } = useAuth();
  const { blockedUserIds } = useMatch();

  const [firstName, setFirstName] = useState(profile?.firstName || 'Aria');
  const [bio, setBio] = useState(profile?.bio || '');
  const [currentPhoto, setCurrentPhoto] = useState(profile?.profilePhotos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const avatarPhoto = getOptimizedImageUrl(currentPhoto, { width: 128, quality: 75 });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        firstName,
        bio,
        profilePhotos: [currentPhoto],
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Account & Privacy Sanctuary</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage your personal coordinates, astrological visibility, and safety preferences
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <form onSubmit={handleSaveProfile} className="bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden relative border-2 border-cosmic-purple shadow-cosmic flex-shrink-0">
              <Image
                src={avatarPhoto}
                alt={profile?.firstName || 'User'}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsEditingPhoto(!isEditingPhoto)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cosmic-purple text-white hover:bg-cosmic-pink shadow-md transition-colors"
              title="Change profile portrait"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{profile?.firstName || 'Aria'}, {profile?.age || 26}</h2>
              <button
                type="button"
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                className="text-xs text-cosmic-purple hover:text-purple-300 font-medium ml-1"
              >
                {isEditingPhoto ? 'Done' : 'Change Photo'}
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              {profile?.sunSign && <AstrologyBadge sign={profile.sunSign} label="Sun" size="sm" />}
              {profile?.moonSign && <AstrologyBadge sign={profile.moonSign} label="Moon" size="sm" />}
              {profile?.risingSign && <AstrologyBadge sign={profile.risingSign} label="Rising" size="sm" />}
            </div>
          </div>
        </div>

        {/* Photo Upload Accordion */}
        {isEditingPhoto && (
          <div className="p-4 rounded-2xl bg-surface-100/80 border border-cosmic-purple/30 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Update Celestial Portrait</span>
              <button
                type="button"
                onClick={() => setIsEditingPhoto(false)}
                className="p-1 rounded-lg text-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <PhotoUpload
              photo={currentPhoto}
              onPhotoChange={(newPhoto) => {
                setCurrentPhoto(newPhoto);
              }}
            />
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Profile changes saved securely to the cosmos!</span>
          </div>
        )}

        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Display Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Bio / Celestial Aura</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-surface-100 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cosmic-purple"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-surface-100/70 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-bold">
                <Calendar className="w-3.5 h-3.5 text-cosmic-purple" />
                <span>Date of Birth</span>
              </div>
              <p className="text-sm font-semibold text-white">{profile?.dateOfBirth || '1998-10-28'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-100/70 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-bold">
                <MapPin className="w-3.5 h-3.5 text-cosmic-pink" />
                <span>Birth Coordinate</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {profile?.birthCity || 'Paris'}, {profile?.birthCountry || 'France'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold text-sm shadow-cosmic hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Profile Updates'}</span>
        </button>
      </form>

      {/* Safety & Blocked Profiles Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-200/90 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-rose-400">
          <Shield className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">Safety & Moderation</h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          You currently have <span className="text-white font-semibold">{blockedUserIds.length}</span> blocked profiles. Blocked users cannot see your profile, send messages, or appear in discovery.
        </p>
      </div>

      {/* Account Danger Zone */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold">Account Danger Zone</h3>
        </div>
        <p className="text-xs text-text-secondary">
          Permanently delete your profile, natal chart placements, matches, and message history from AstroMatch.
        </p>

        {showDeleteConfirm ? (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
            <p className="text-xs font-semibold text-rose-200">
              Are you sure? This action is irreversible and your profile will be wiped.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Yes, Delete Account Permanently
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2 px-4 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => signOut()}
              className="py-2.5 px-5 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="py-2.5 px-5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
