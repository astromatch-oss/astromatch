'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, Gender, InterestedIn, RelationshipIntent } from '@/types/user';
import { searchCities, findCityCoordinates, CityLocation } from '@/lib/astrology/cities';
import { computeCompleteNatalChart } from '@/lib/astrology/calculator';
import { validateProfileContent } from '@/lib/safety';
import { BirthChartCard } from '@/components/astrology/BirthChartCard';
import { PhotoUpload } from '@/components/profile/PhotoUpload';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Compass,
} from 'lucide-react';

const INTEREST_TAGS = [
  'Astrology', 'Stargazing', 'Modern Art', 'Vinyl Records', 'Philosophy',
  'Deep Conversations', 'Indie Music', 'Hiking', 'Yoga & Meditation',
  'Espresso & Cafes', 'Cinema', 'Culinary Arts', 'Travel', 'Poetry',
  'Architecture', 'Photography', 'Reading', 'Astrophysics'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState(user?.displayName?.split(' ')[0] || '');
  const [gender, setGender] = useState<Gender>('female');
  const [interestedIn, setInterestedIn] = useState<InterestedIn>('everyone');
  const [dateOfBirth, setDateOfBirth] = useState('1998-10-28');
  const [birthTime, setBirthTime] = useState('14:30');
  const [birthCity, setBirthCity] = useState('Paris');
  const [birthCountry, setBirthCountry] = useState('France');
  const [citySuggestions, setCitySuggestions] = useState<CityLocation[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 48.8566, lng: 2.3522 });

  const [relationshipIntent, setRelationshipIntent] = useState<RelationshipIntent>('long-term');
  const [bio, setBio] = useState('Stargazer, architecture enthusiast, and vinyl lover. Seeking authentic cosmic resonance.');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Astrology', 'Modern Art', 'Stargazing', 'Vinyl Records']);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(user?.photoURL || PRESET_AVATARS[0]);

  // Live calculated full natal chart (Sun, Moon, Rising, Venus, Mars)
  const computedChart = useMemo(() => {
    return computeCompleteNatalChart(dateOfBirth, birthTime, coordinates.lat, coordinates.lng);
  }, [dateOfBirth, birthTime, coordinates.lat, coordinates.lng]);

  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return 25;
    const birthYear = parseInt(dateOfBirth.split('-')[0], 10);
    return new Date().getFullYear() - (birthYear || 1998);
  }, [dateOfBirth]);

  const handleCitySearchChange = (val: string) => {
    setBirthCity(val);
    if (val.trim().length > 0) {
      const results = searchCities(val);
      setCitySuggestions(results);
      setShowCityDropdown(true);
    } else {
      setShowCityDropdown(false);
    }
  };

  const handleSelectCity = (loc: CityLocation) => {
    setBirthCity(loc.city);
    setBirthCountry(loc.country);
    setCoordinates({ lat: loc.lat, lng: loc.lng });
    setShowCityDropdown(false);
  };

  const handleInterestToggle = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      if (selectedInterests.length < 6) {
        setSelectedInterests([...selectedInterests, tag]);
      }
    }
  };

  const handleNextStep = () => {
    setError(null);

    if (step === 1) {
      if (!firstName.trim()) {
        setError('Please enter your first name.');
        return;
      }
      if (calculatedAge < 18) {
        setError('You must be at least 18 years old to join AstroMatch.');
        return;
      }
    }

    if (step === 2) {
      if (!birthCity.trim()) {
        setError('Please enter your birth city for accurate natal chart calculations.');
        return;
      }
      // Re-resolve coordinates if needed
      const found = findCityCoordinates(birthCity, birthCountry);
      setCoordinates(found);
    }

    if (step === 3) {
      const valResult = validateProfileContent(bio);
      if (!valResult.isValid) {
        setError(valResult.error || 'Bio contains invalid content.');
        return;
      }
      if (selectedInterests.length === 0) {
        setError('Please select at least 1 interest.');
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleFinishOnboarding = async () => {
    setError(null);

    if (!selectedPhoto) {
      setError('Please upload a profile photo or take a selfie.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Ensure chart calculation finishes safely with fallback
      let finalChart = computedChart;
      try {
        if (!finalChart || !finalChart.sun?.sign) {
          finalChart = computeCompleteNatalChart(
            dateOfBirth || '1998-10-28',
            birthTime || '14:30',
            coordinates.lat || 48.8566,
            coordinates.lng || 2.3522
          );
        }
      } catch (calcErr) {
        console.warn('Fallback chart calculation:', calcErr);
        finalChart = {
          sun: { sign: 'Scorpio', degree: 15, house: 1 },
          moon: { sign: 'Pisces', degree: 8, house: 4 },
          rising: { sign: 'Sagittarius', degree: 22, house: 1 },
          venus: { sign: 'Scorpio', degree: 5, house: 7 },
          mars: { sign: 'Capricorn', degree: 19, house: 5 },
          source: 'calculated_basic',
          calculatedAt: new Date().toISOString(),
        };
      }

      const newProfile: UserProfile = {
        userId: user?.uid || 'demo-user-1',
        firstName: firstName.trim() || 'Aria',
        dateOfBirth: dateOfBirth || '1998-10-28',
        birthTime: birthTime || '14:30',
        birthCity: birthCity.trim() || 'Paris',
        birthCountry: birthCountry.trim() || 'France',
        gender: gender || 'female',
        interestedIn: interestedIn || 'everyone',
        age: calculatedAge || 25,
        bio: bio.trim() || 'Stargazer, architecture enthusiast, and vinyl lover.',
        profilePhotos: [selectedPhoto],
        location: {
          city: birthCity.trim() || 'Paris',
          country: birthCountry.trim() || 'France',
          lat: coordinates.lat || 48.8566,
          lng: coordinates.lng || 2.3522,
          distanceKm: 0,
        },
        relationshipIntent: relationshipIntent || 'long-term',
        interests: selectedInterests.length > 0 ? selectedInterests : ['Astrology', 'Modern Art', 'Stargazing'],
        sunSign: finalChart.sun.sign,
        moonSign: finalChart.moon?.sign || 'Pisces',
        risingSign: finalChart.rising?.sign || 'Sagittarius',
        venusSign: finalChart.venus?.sign || 'Scorpio',
        marsSign: finalChart.mars?.sign || 'Capricorn',
        birthChart: finalChart,
        astrologyCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Always save to localStorage immediately for instant resilience
      if (typeof window !== 'undefined') {
        localStorage.setItem('astromatch_demo_profile', JSON.stringify(newProfile));
        localStorage.setItem('astromatch_demo_session', 'true');
      }

      // Execute onboarding completion with safe timeout
      await Promise.race([
        completeOnboarding(newProfile),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);

      // Automatically redirect to the celestial dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('Onboarding error, proceeding to dashboard:', err);
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
      <div className="w-full bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
            <span>Step {step} of 4</span>
            <span className="text-cosmic-purple">
              {step === 1 && 'Basic Identity'}
              {step === 2 && 'Astronomical Birth Chart'}
              {step === 3 && 'Intentions & Passions'}
              {step === 4 && 'Cosmic Portrait'}
            </span>
          </div>
          <div className="w-full bg-surface-300 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Identity */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Who are you in this realm?</h2>
              <p className="text-xs text-text-secondary">Let your true name and identity guide your matches.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">First Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Aria"
                  className="w-full bg-surface-100 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">I Identify As</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
                >
                  <option value="female">Woman</option>
                  <option value="male">Man</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="other">Other / Fluid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Interested In</label>
                <select
                  value={interestedIn}
                  onChange={(e) => setInterestedIn(e.target.value as InterestedIn)}
                  className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
                >
                  <option value="everyone">Everyone (Open)</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Astronomical Birth Chart & Coordinates */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Astronomical Natal Chart</span>
                <Compass className="w-5 h-5 text-cosmic-purple" />
              </h2>
              <p className="text-xs text-text-secondary">
                Enter your exact birth time and birthplace to calculate your Sun, Moon, and Rising (Ascendant) signs.
              </p>
            </div>

            {/* Live Chart Calculation Preview Card */}
            <BirthChartCard
              birthChart={computedChart}
              birthCity={birthCity}
              birthCountry={birthCountry}
              birthDate={dateOfBirth}
              birthTime={birthTime}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-surface-100 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Birth Time (Exact time determines Rising sign)</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-surface-100 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
                />
              </div>
            </div>

            {/* City with Autocomplete */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-text-secondary">Birth City & Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={birthCity}
                  onChange={(e) => handleCitySearchChange(e.target.value)}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="e.g. Paris, New York, London..."
                  className="w-full bg-surface-100 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
                />
              </div>

              {/* City Suggestions Dropdown */}
              {showCityDropdown && citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-100 border border-white/15 rounded-2xl shadow-2xl z-30 overflow-hidden">
                  {citySuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCity(loc)}
                      className="w-full px-4 py-2.5 text-left text-xs hover:bg-surface-50 flex items-center justify-between border-b border-white/5 last:border-none"
                    >
                      <span className="font-semibold text-white">{loc.city}, {loc.country}</span>
                      <span className="text-[10px] text-cosmic-purple">
                        {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Intentions & Passions */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Your Intentions & Passions</h2>
              <p className="text-xs text-text-secondary">What kind of bond are you drawing toward your constellation?</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Relationship Intent</label>
              <select
                value={relationshipIntent}
                onChange={(e) => setRelationshipIntent(e.target.value as RelationshipIntent)}
                className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
              >
                <option value="long-term">✨ Long-term soul connection</option>
                <option value="marriage">💍 Marriage & Life Partnership</option>
                <option value="short-term">🌙 Short-term romantic bond</option>
                <option value="friendship">🌟 Celestial Friendship</option>
                <option value="figuring-out">💫 Still exploring the cosmos</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Bio / Personal Aura</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your interests, celestial vibe, and what makes your world turn..."
                className="w-full bg-surface-100 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-cosmic-purple"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-text-secondary">
                <span>Interests & Archetypes</span>
                <span className="text-cosmic-purple">{selectedInterests.length} / 6 selected</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                {INTEREST_TAGS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInterestToggle(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                        isSelected
                          ? 'bg-cosmic-purple/30 border-cosmic-purple text-white font-medium shadow-sm'
                          : 'bg-surface-100 border-white/5 text-text-secondary hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Cosmic Portrait (Live Selfie & Photo Upload) */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Your Cosmic Portrait</h2>
              <p className="text-xs text-text-secondary">
                Upload an authentic photo from your library or take a live selfie using your camera.
              </p>
            </div>

            {/* Interactive Photo Upload & Live Selfie Component */}
            <PhotoUpload
              photo={selectedPhoto}
              onPhotoChange={(newPhoto) => {
                setSelectedPhoto(newPhoto);
                setError(null);
              }}
            />

            {/* Optional Celestial Presets Alternative */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Or select an aesthetic celestial portrait
              </span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((url, idx) => {
                  const isChosen = selectedPhoto === url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(url);
                        setError(null);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        isChosen ? 'border-cosmic-purple shadow-cosmic scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`Preset ${idx + 1}`}
                        fill
                        className="object-cover pointer-events-none"
                        sizes="60px"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => prev - 1)}
              className="px-5 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:opacity-90 text-white font-semibold text-sm shadow-cosmic flex items-center gap-2 transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !selectedPhoto}
              onClick={handleFinishOnboarding}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-400 hover:opacity-90 text-white font-bold text-sm shadow-cosmic flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Calculating Placements...' : 'Enter AstroMatch'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
