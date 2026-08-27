'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { UserProfile, SubscriptionTier } from '@/types/user';
import { astrologyService } from '@/lib/astrology/astrologyService';
import {
  getCurrentUserLocation,
  calculateHaversineDistance,
  formatDistance,
  getProximityOffsetCoordinates,
  GeoCoordinates,
  DEFAULT_COORDINATES,
} from '@/lib/locationService';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { CompatibilityMeter } from '@/components/astrology/CompatibilityMeter';
import {
  Radio,
  Crown,
  Lock,
  Sparkles,
  MapPin,
  RefreshCw,
  Heart,
  X,
  Compass,
  Zap,
  Flame,
  Layers,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface CosmicOrbitRadarProps {
  currentUser: Partial<UserProfile>;
  profiles: UserProfile[];
  subscriptionTier: SubscriptionTier;
  isDemoMode?: boolean;
  onLike: (profile: UserProfile, type: 'like' | 'superlike') => void;
  onPass: (profile: UserProfile) => void;
  onUnlockVip: () => void;
  onViewBlueprint?: (profile: UserProfile) => void;
}

interface OrbitProfile extends UserProfile {
  distanceKm: number;
  distanceFormatted: string;
  synastryScore: number;
  synastryResult: any;
  angleDeg: number;
  coords: { lat: number; lng: number };
}

export const CosmicOrbitRadar: React.FC<CosmicOrbitRadarProps> = ({
  currentUser,
  profiles,
  subscriptionTier,
  isDemoMode = false,
  onLike,
  onPass,
  onUnlockVip,
  onViewBlueprint,
}) => {
  const isVip = subscriptionTier === 'vip' || isDemoMode;

  const [userCoords, setUserCoords] = useState<GeoCoordinates>(DEFAULT_COORDINATES);
  const [gpsSource, setGpsSource] = useState<'capacitor' | 'browser' | 'default'>('default');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOrbitProfile, setSelectedOrbitProfile] = useState<OrbitProfile | null>(null);
  const [orbitRangeKm, setOrbitRangeKm] = useState<number>(5);
  const [radarDisplayMode, setRadarDisplayMode] = useState<'visual' | 'cards'>('visual');

  // Fetch real device location on mount
  const refreshLocation = async () => {
    setIsScanning(true);
    try {
      const result = await getCurrentUserLocation();
      if (result.coords) {
        setUserCoords(result.coords);
        setGpsSource(result.source);
      }
    } catch (err) {
      console.warn('Orbit radar GPS note:', err);
    } finally {
      setTimeout(() => setIsScanning(false), 800);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  // Compute live proximity & synastry for all profiles
  const orbitProfiles: OrbitProfile[] = useMemo(() => {
    return profiles
      .map((p, idx) => {
        // Derive relative coordinates around the current user's real or simulated GPS position
        const targetCoords =
          p.location.lat && p.location.lng
            ? { lat: p.location.lat, lng: p.location.lng }
            : getProximityOffsetCoordinates(
                userCoords.latitude,
                userCoords.longitude,
                idx,
                profiles.length
              );

        const distanceKm = calculateHaversineDistance(
          userCoords.latitude,
          userCoords.longitude,
          targetCoords.lat,
          targetCoords.lng
        );

        const synastryResult = astrologyService.calculateSynastry(
          currentUser || { sunSign: 'Scorpio' },
          p
        );

        // Fixed consistent orbital angle for radar visualization
        const angleDeg = (idx * (360 / Math.max(profiles.length, 1)) + 25) % 360;

        return {
          ...p,
          coords: targetCoords,
          distanceKm,
          distanceFormatted: formatDistance(distanceKm),
          synastryScore: synastryResult.overallScore,
          synastryResult,
          angleDeg,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [profiles, userCoords, currentUser]);

  const activeFilteredProfiles = useMemo(() => {
    return orbitProfiles.filter((p) => p.distanceKm <= orbitRangeKm);
  }, [orbitProfiles, orbitRangeKm]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Orbit Header & GPS Status */}
      <div className="bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cosmic-purple/20 border border-cosmic-purple/40 flex items-center justify-center text-amber-300 shadow-cosmic relative">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Live Cosmic Orbit Radar
                </h2>
                {isVip ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold uppercase">
                    <Crown className="w-3 h-3" /> VIP Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-100 border border-white/10 text-purple-300 text-[10px] font-semibold">
                    <Lock className="w-3 h-3" /> VIP Preview
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                Real-time celestial proximity radar tracking souls in your gravitational field.
              </p>
            </div>
          </div>

          {/* Controls: GPS Refresh & Range Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setRadarDisplayMode('visual')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  radarDisplayMode === 'visual'
                    ? 'bg-cosmic-purple text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Radar</span>
              </button>
              <button
                onClick={() => setRadarDisplayMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  radarDisplayMode === 'cards'
                    ? 'bg-cosmic-purple text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Venues ({activeFilteredProfiles.length})</span>
              </button>
            </div>

            <button
              onClick={refreshLocation}
              disabled={isScanning}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-text-secondary hover:text-white transition-colors disabled:opacity-50"
              title="Rescan Frequency / Recalibrate GPS"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-amber-300' : ''}`} />
            </button>
          </div>
        </div>

        {/* GPS Sensor & Range Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>
              {gpsSource === 'capacitor'
                ? 'Device GPS (High Accuracy)'
                : gpsSource === 'browser'
                ? 'Browser GeoLocation'
                : 'Simulated Celestial Venue'}
              : <span className="text-white font-mono text-[11px] ml-1">{userCoords.latitude.toFixed(4)}, {userCoords.longitude.toFixed(4)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted">Radar Horizon:</span>
            {[1, 3, 5, 10].map((km) => (
              <button
                key={km}
                onClick={() => setOrbitRangeKm(km)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                  orbitRangeKm === km
                    ? 'bg-cosmic-purple/30 text-purple-300 border-cosmic-purple shadow-sm'
                    : 'bg-surface-100 text-text-muted border-white/5 hover:text-white'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NON-VIP PAYWALL BANNER */}
      {!isVip && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-amber-500/20 border-2 border-amber-400/40 p-6 sm:p-7 shadow-cosmic-gold space-y-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" /> VIP Orbit Privilege
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Unlock AstroMatch VIP to See Who Is Nearby
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Celestial VIP members unlock exact real-time meter distances (e.g. &quot;150m away&quot;), crystal-clear unblurred portrait previews, and instant synastry compatibility in your current venue.
              </p>
            </div>

            <button
              onClick={onUnlockVip}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-surface-400 font-extrabold text-xs sm:text-sm shadow-cosmic hover:opacity-95 transition-all flex items-center justify-center gap-2 flex-shrink-0 group hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-surface-400 group-hover:rotate-12 transition-transform" />
              <span>Unlock VIP Orbit Radar</span>
            </button>
          </div>
        </div>
      )}

      {/* RADAR VISUALIZER VIEW */}
      {radarDisplayMode === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Circular Sweep Radar Screen */}
          <div className="lg:col-span-7 bg-surface-200/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[440px]">
            {/* Background Grid & Stars */}
            <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

            {/* Radar Scope */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-cosmic-purple/30 bg-surface-400/90 shadow-inner flex items-center justify-center">
              {/* Concentric Range Rings */}
              <div className="absolute w-[80%] h-[80%] rounded-full border border-cosmic-purple/20 border-dashed" />
              <div className="absolute w-[55%] h-[55%] rounded-full border border-cosmic-purple/25" />
              <div className="absolute w-[30%] h-[30%] rounded-full border border-cosmic-purple/35" />

              {/* Crosshairs */}
              <div className="absolute w-full h-[1px] bg-cosmic-purple/20" />
              <div className="absolute h-full w-[1px] bg-cosmic-purple/20" />

              {/* Rotating Radar Sweeper Beam */}
              <div className="absolute inset-0 rounded-full animate-spin-slow pointer-events-none">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-400/30 via-cosmic-purple/20 to-transparent rounded-tl-full origin-bottom-right" />
              </div>

              {/* Center User Beacon */}
              <div className="relative z-20 w-10 h-10 rounded-full bg-gradient-to-tr from-cosmic-purple to-cosmic-pink p-0.5 shadow-cosmic flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-surface-300 flex items-center justify-center text-amber-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-5 text-[9px] font-bold text-amber-300 whitespace-nowrap">
                  YOU
                </span>
              </div>

              {/* Orbital Profile Blips */}
              {activeFilteredProfiles.map((p, idx) => {
                // Radius mapping based on distance (clamp within scope)
                const maxRange = orbitRangeKm;
                const normalizedDist = Math.min(Math.max(p.distanceKm / maxRange, 0.2), 0.88);
                const radiusPx = (normalizedDist * (384 / 2)) * 0.82;
                
                const rad = (p.angleDeg * Math.PI) / 180;
                const x = Math.cos(rad) * radiusPx;
                const y = Math.sin(rad) * radiusPx;

                const isSelected = selectedOrbitProfile?.userId === p.userId;
                const optimizedBlipPhoto = getOptimizedImageUrl(
                  p.profilePhotos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                  { width: 96, quality: 70 }
                );

                return (
                  <button
                    key={p.userId}
                    onClick={() => {
                      if (!isVip) {
                        onUnlockVip();
                      } else {
                        setSelectedOrbitProfile(p);
                      }
                    }}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={`absolute z-30 transition-transform duration-300 hover:scale-125 focus:outline-none ${
                      isSelected ? 'scale-125 ring-2 ring-amber-300' : ''
                    }`}
                    title={`${p.firstName} • ${p.distanceFormatted}`}
                  >
                    <div className="relative">
                      {/* Pulsing ring */}
                      <span className="absolute -inset-1 rounded-full bg-cosmic-purple/40 animate-ping opacity-75" />
                      
                      <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-cosmic-purple bg-surface-200 shadow-lg">
                        <Image
                          src={optimizedBlipPhoto}
                          alt={p.firstName}
                          fill
                          className={`object-cover transition-all ${!isVip ? 'blur-[4px] grayscale-[40%]' : ''}`}
                          sizes="44px"
                        />
                        {!isVip && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-amber-300" />
                          </div>
                        )}
                      </div>

                      {/* Synastry Tag */}
                      <span className="absolute -bottom-2 -right-1 px-1.5 py-0.2 rounded-full bg-surface-300 border border-white/20 text-[9px] font-extrabold text-amber-300 shadow">
                        {p.synastryScore}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Radar Scope Legend */}
            <div className="w-full flex items-center justify-between pt-6 text-[11px] text-text-muted">
              <span>Inner: 500m</span>
              <span>Mid: {(orbitRangeKm / 2).toFixed(1)} km</span>
              <span>Outer Horizon: {orbitRangeKm} km</span>
            </div>
          </div>

          {/* Radar Selection / Preview Panel */}
          <div className="lg:col-span-5 space-y-4">
            {selectedOrbitProfile ? (
              <div className="bg-surface-200/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cosmic-purple/20 text-purple-300 border border-cosmic-purple/30 text-xs font-semibold">
                    <Radio className="w-3.5 h-3.5 text-amber-300" />
                    <span>Target Locked</span>
                  </div>
                  <button
                    onClick={() => setSelectedOrbitProfile(null)}
                    className="p-1.5 rounded-full text-text-muted hover:text-white bg-surface-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-cosmic-purple shadow-cosmic flex-shrink-0">
                    <Image
                      src={getOptimizedImageUrl(
                        selectedOrbitProfile.profilePhotos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                        { width: 160, quality: 75 }
                      )}
                      alt={selectedOrbitProfile.firstName}
                      fill
                      className={`object-cover ${!isVip ? 'blur-md' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {selectedOrbitProfile.firstName}, {selectedOrbitProfile.age}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isVip ? selectedOrbitProfile.distanceFormatted : 'Nearby in your Orbit'}</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <AstrologyBadge sign={selectedOrbitProfile.sunSign} size="sm" />
                      {selectedOrbitProfile.moonSign && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-purple-300 border border-white/5">
                          🌙 {selectedOrbitProfile.moonSign}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Synastry Bar */}
                <div className="p-3.5 rounded-2xl bg-surface-100 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary font-medium">Celestial Synergy</span>
                    <span className="text-amber-300 font-extrabold text-sm">{selectedOrbitProfile.synastryScore}% Match</span>
                  </div>
                  <div className="w-full bg-surface-300 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedOrbitProfile.synastryScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary italic">
                    &quot;{selectedOrbitProfile.synastryResult?.description || 'Powerful magnetic resonance with complementary elemental energy.'}&quot;
                  </p>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {selectedOrbitProfile.bio}
                </p>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      onPass(selectedOrbitProfile);
                      setSelectedOrbitProfile(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-surface-100 hover:bg-rose-500/20 border border-white/10 text-text-secondary hover:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Pass</span>
                  </button>
                  <button
                    onClick={() => {
                      onLike(selectedOrbitProfile, 'like');
                      setSelectedOrbitProfile(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-bold text-xs shadow-cosmic hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Cosmic Like</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-200/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-cosmic-purple/15 text-amber-300 border border-cosmic-purple/30 flex items-center justify-center mx-auto shadow-cosmic">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Select a Celestial Node</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Tap any pulsing blip on the radar screen to lock onto their live coordinates, synastry blueprint, and immediate proximity.
                  </p>
                </div>
              </div>
            )}

            {/* Quick List Preview */}
            <div className="bg-surface-200/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-text-secondary px-2 uppercase tracking-wider">
                Closest Souls in Horizon
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {activeFilteredProfiles.slice(0, 5).map((p) => (
                  <div
                    key={p.userId}
                    onClick={() => {
                      if (!isVip) onUnlockVip();
                      else setSelectedOrbitProfile(p);
                    }}
                    className="p-2.5 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-white/5 hover:border-cosmic-purple/40 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                        <Image
                          src={getOptimizedImageUrl(
                            p.profilePhotos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                            { width: 64, quality: 70 }
                          )}
                          alt={p.firstName}
                          fill
                          className={`object-cover ${!isVip ? 'blur-sm' : ''}`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            {p.firstName}, {p.age}
                          </span>
                          <AstrologyBadge sign={p.sunSign} size="sm" />
                        </div>
                        <span className="text-[11px] text-amber-300 font-semibold">
                          {isVip ? p.distanceFormatted : '🔒 Proximity Locked'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white">{p.synastryScore}%</span>
                      <p className="text-[10px] text-text-muted">Synergy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VENUES & LIST CARDS VIEW */}
      {radarDisplayMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 animate-in fade-in">
          {activeFilteredProfiles.map((p) => {
            const optimizedPhoto = getOptimizedImageUrl(
              p.profilePhotos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
              { width: 450, quality: 75 }
            );

            return (
              <div
                key={p.userId}
                className="bg-surface-200/90 rounded-3xl overflow-hidden border border-white/10 hover:border-cosmic-purple/50 shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Profile Photo with VIP Gate Blur */}
                <div className="relative aspect-[4/3.8] overflow-hidden">
                  <Image
                    src={optimizedPhoto}
                    alt={p.firstName}
                    fill
                    loading="lazy"
                    className={`object-cover group-hover:scale-105 transition-all duration-500 ${
                      !isVip ? 'blur-md grayscale-[30%]' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-400 via-transparent to-black/30" />

                  {/* Distance & Synergy Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-extrabold flex items-center gap-1 shadow-md">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>{isVip ? p.distanceFormatted : '🔒 Nearby in Orbit'}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-surface-300/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow">
                      {p.synastryScore}% Synergy
                    </span>
                  </div>

                  {/* Name & Basic Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold">{p.firstName},</span>
                      <span className="text-lg font-light text-white/80">{p.age}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <AstrologyBadge sign={p.sunSign} size="sm" />
                      <span className="text-xs text-text-secondary">{p.location.city}</span>
                    </div>
                  </div>

                  {/* Non-VIP Overlay Action on image */}
                  {!isVip && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center space-y-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-cosmic">
                        <Lock className="w-5 h-5" />
                      </div>
                      <button
                        onClick={onUnlockVip}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-surface-400 font-bold text-xs shadow-cosmic hover:scale-105 transition-transform"
                      >
                        Unlock VIP to Reveal
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {p.bio}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      {p.moonSign && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-purple-300 border border-white/5">
                          🌙 {p.moonSign}
                        </span>
                      )}
                      {p.risingSign && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-pink-300 border border-white/5">
                          🌅 {p.risingSign}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPass(p)}
                        className="p-2 rounded-full bg-surface-100 hover:bg-rose-500/20 text-text-muted hover:text-rose-400 border border-white/5 transition-colors"
                        title="Pass"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onLike(p, 'like')}
                        className="p-2 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white shadow-cosmic hover:scale-105 transition-transform"
                        title="Cosmic Like"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
