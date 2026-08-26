'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Heart, Compass, Shield, Zap, ArrowRight, Stars } from 'lucide-react';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';

export default function LandingPage() {
  const { user, loginAsDemoUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto px-4 pt-12 pb-20 sm:pt-20 sm:pb-28 text-center flex flex-col items-center">
        {/* Celestial Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cosmic-purple/15 border border-cosmic-purple/40 text-purple-300 text-xs sm:text-sm font-medium mb-8 shadow-cosmic animate-float">
          <Stars className="w-4 h-4 text-amber-300" />
          <span>The Next Evolution of Astrological Dating</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-balance leading-tight sm:leading-none">
          Written in the <span className="bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-300 bg-clip-text text-transparent">Stars</span>.
          <br className="hidden sm:inline" />
          {' '}Connected in <span className="text-white">Reality</span>.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-text-secondary max-w-2xl mx-auto text-center leading-relaxed list-none">
          Move beyond superficial swipes. AstroMatch combines high-fidelity birth chart synastry, elemental resonance, and modern romantic design to connect you with souls aligned with your celestial blueprint.
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {user ? (
            <Link
              href="/discover"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-cosmic-violet text-white font-semibold text-base shadow-cosmic hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Go to Discovery Deck</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-cosmic-violet text-white font-semibold text-base shadow-cosmic hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Calculate Your Compatibility</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => {
                  loginAsDemoUser();
                  window.location.href = '/discover';
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-surface-100/90 hover:bg-surface-50 border border-white/10 text-white font-medium text-base transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Try Instant Demo (1-Click)</span>
              </button>
            </>
          )}
        </div>

        {/* Interactive Floating Preview Card */}
        <div className="mt-16 w-full max-w-md bg-surface-200/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cosmic-pink/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden relative border border-white/20">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  alt="Aria"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Aria & Elena</h3>
                <p className="text-xs text-text-secondary">Scorpio ♏ + Pisces ♓</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>94% Synergy</span>
            </div>
          </div>

          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Water Element Harmony</span>
              <span className="text-white font-semibold">98% (Natural Resonance)</span>
            </div>
            <div className="w-full bg-surface-300 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full w-[94%]" />
            </div>
            <p className="text-xs text-text-secondary italic pt-1">
              &quot;Effortless emotional understanding with magnetic intellectual chemistry.&quot;
            </p>
          </div>

          <div className="flex gap-2">
            <AstrologyBadge sign="Scorpio" label="Sun" size="sm" />
            <AstrologyBadge sign="Pisces" label="Moon" size="sm" />
            <AstrologyBadge sign="Sagittarius" label="Rising" size="sm" />
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Astrology Done Right.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-secondary">
            Engineered with precision. We respect your cosmic individuality and personal safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-200/60 backdrop-blur-xl border border-white/10 rounded-3xl p-7 space-y-4 hover:border-cosmic-purple/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cosmic-purple/20 border border-cosmic-purple/30 flex items-center justify-center text-cosmic-purple group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Full Natal Chart Synergy</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              We look beyond basic Sun signs. Our engine analyzes Moon emotional compatibility, Venus romantic attachment, and Mars passion dynamics.
            </p>
          </div>

          <div className="bg-surface-200/60 backdrop-blur-xl border border-white/10 rounded-3xl p-7 space-y-4 hover:border-cosmic-pink/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cosmic-pink/20 border border-cosmic-pink/30 flex items-center justify-center text-cosmic-pink group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Astrological Icebreakers</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Never get stuck on &quot;Hey&quot;. Get tailored conversational catalysts based on both of your planetary interactions and shared elemental curiosities.
            </p>
          </div>

          <div className="bg-surface-200/60 backdrop-blur-xl border border-white/10 rounded-3xl p-7 space-y-4 hover:border-amber-400/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Safety & Sanctity First</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Zero tolerance for harassment, fake profiles or unwanted spam. Granular blocking, reporting, and private data protection baked in.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 mt-12 text-center text-xs text-text-muted">
        <p>© {new Date().getFullYear()} AstroMatch • Celestial Web & PWA Dating Platform</p>
      </footer>
    </div>
  );
}
