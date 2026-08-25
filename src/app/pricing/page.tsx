'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionTier } from '@/types/user';
import {
  Sparkles,
  Check,
  Zap,
  Crown,
} from 'lucide-react';

// Lazy-load CheckoutModal to avoid pulling Stripe/Payment components into initial bundle
const CheckoutModal = dynamic(
  () => import('@/components/subscription/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);

export default function PricingPage() {
  const { user, subscriptionTier } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('vip');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSelectTier = (tier: SubscriptionTier) => {
    if (tier === 'free') return;
    setSelectedTier(tier);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 space-y-12 animate-in fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AstroMatch Celestial Memberships</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Align Your Stars with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-300 bg-clip-text text-transparent">
            Unrestricted Cosmic Romance
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Unlock full natal synastry reports, unlimited stargazing swipes, and prioritized cosmic visibility.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-text-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 rounded-full bg-surface-100 border border-white/10 p-1 transition-colors"
          >
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink transition-transform duration-200 ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-text-muted'}`}>
              Annual
            </span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Save 33%
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Tier 1: Free Stargazer */}
        <div className="bg-surface-200/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl relative">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Basic</span>
              <h3 className="text-xl font-bold text-white">Free Stargazer</h3>
              <p className="text-xs text-text-secondary">Essential astrological dating essentials</p>
            </div>

            <div className="text-3xl font-extrabold text-white">
              $0
              <span className="text-xs text-text-muted font-normal"> / forever</span>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              {[
                '10 Cosmic Swipes per day',
                'Basic Sun Sign calculation',
                'Message mutual matches',
                'Standard discovery feed',
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-text-secondary">
                  <Check className="w-4 h-4 text-cosmic-purple flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={subscriptionTier === 'free'}
            className="w-full py-3 rounded-2xl bg-surface-100 border border-white/10 text-white font-medium text-xs disabled:opacity-50"
          >
            {subscriptionTier === 'free' ? 'Current Plan' : 'Free Tier'}
          </button>
        </div>

        {/* Tier 2: Cosmic Plus */}
        <div className="bg-surface-200/90 backdrop-blur-xl border border-cosmic-purple/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-2xl relative">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Plus
              </div>
              <h3 className="text-xl font-bold text-white">Cosmic Plus</h3>
              <p className="text-xs text-text-secondary">Unlimited exploration and deep synastry</p>
            </div>

            <div className="text-3xl font-extrabold text-white">
              {billingCycle === 'yearly' ? '$9.99' : '$14.99'}
              <span className="text-xs text-text-muted font-normal"> / month</span>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              {[
                '✨ Unlimited daily swipes',
                '🌌 Full Synastry (Emotional & Passion breakdown)',
                '⭐ 5 Super Star Likes per week',
                '🔄 Rewind accidental passes',
                '🔮 Detailed Moon & Rising sign dynamics',
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-white">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSelectTier('plus')}
            className="w-full py-3.5 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-cosmic-purple/50 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            {subscriptionTier === 'plus' ? 'Current Plan' : 'Upgrade to Plus'}
          </button>
        </div>

        {/* Tier 3: Celestial VIP (Most Popular) */}
        <div className="bg-gradient-to-b from-surface-100 via-surface-200 to-surface-100 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-cosmic-gold relative">
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-surface-400 text-[11px] font-extrabold uppercase tracking-wider shadow-md">
            Most Popular
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" /> VIP
              </div>
              <h3 className="text-xl font-bold text-white">Celestial VIP</h3>
              <p className="text-xs text-text-secondary">Total mastery of the cosmic dating galaxy</p>
            </div>

            <div className="text-3xl font-extrabold text-white">
              {billingCycle === 'yearly' ? '$19.99' : '$29.99'}
              <span className="text-xs text-text-muted font-normal"> / month</span>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              {[
                '👑 Everything in Cosmic Plus',
                '👀 See Who Liked Your Constellation before swiping',
                '⚡ 1 Weekly Cosmic Boost (3x visibility)',
                '🌙 Daily personalized Transit & Synastry audios',
                '💫 Priority messaging with VIP gold starlight aura',
                '💎 Unlimited Rewinds & Super Likes',
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-white font-medium">
                  <Check className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSelectTier('vip')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-surface-400 hover:opacity-95 font-bold text-xs shadow-cosmic transition-all"
          >
            {subscriptionTier === 'vip' ? 'Active VIP Member' : 'Activate Celestial VIP'}
          </button>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-surface-200/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-lg font-bold text-white tracking-tight text-center">
          Compare Celestial Capabilities
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-text-muted">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-center">Free</th>
                <th className="py-3 px-4 text-center text-purple-300">Cosmic Plus</th>
                <th className="py-3 px-4 text-center text-amber-300">Celestial VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-text-secondary">
              <tr>
                <td className="py-3 px-4 font-medium text-white">Daily Swipes</td>
                <td className="py-3 px-4 text-center">10 / day</td>
                <td className="py-3 px-4 text-center text-emerald-400">Unlimited</td>
                <td className="py-3 px-4 text-center text-emerald-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Natal Chart Placements</td>
                <td className="py-3 px-4 text-center">Sun Sign</td>
                <td className="py-3 px-4 text-center">Sun, Moon, Rising</td>
                <td className="py-3 px-4 text-center">Complete Ephemeris</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Synastry Compatibility Meter</td>
                <td className="py-3 px-4 text-center">Basic %</td>
                <td className="py-3 px-4 text-center text-emerald-400">Full 4-Aspect Meter</td>
                <td className="py-3 px-4 text-center text-emerald-400">Full 4-Aspect + Advice</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">See Who Liked You</td>
                <td className="py-3 px-4 text-center">✕</td>
                <td className="py-3 px-4 text-center">✕</td>
                <td className="py-3 px-4 text-center text-amber-300">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Cosmic Profile Boost</td>
                <td className="py-3 px-4 text-center">✕</td>
                <td className="py-3 px-4 text-center">✕</td>
                <td className="py-3 px-4 text-center text-amber-300">1x / week</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal (Lazy-Loaded) */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          tier={selectedTier}
          billingCycle={billingCycle}
          price={
            selectedTier === 'vip'
              ? billingCycle === 'yearly'
                ? '$239.88'
                : '$29.99'
              : billingCycle === 'yearly'
              ? '$119.88'
              : '$14.99'
          }
        />
      )}
    </div>
  );
}
