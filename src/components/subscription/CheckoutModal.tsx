'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionTier } from '@/types/user';
import {
  Sparkles,
  CreditCard,
  Lock,
  CheckCircle2,
  X,
  Crown,
  Zap,
  Tag,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  price: string;
  onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  tier,
  billingCycle,
  price,
  onSuccess,
}) => {
  const { upgradeSubscriptionTier } = useAuth();

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('777');
  const [cardName, setCardName] = useState('Aria Stargazer');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const tierTitle = tier === 'vip' ? 'Celestial VIP' : 'Cosmic Plus';
  const rawPriceNum = parseFloat(price.replace('$', ''));
  const finalPrice = discountApplied ? (rawPriceNum * 0.8).toFixed(2) : rawPriceNum.toFixed(2);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'COSMIC2026' || promoCode.trim().toUpperCase() === 'STARS') {
      setDiscountApplied(true);
    }
  };

  const handleInstantActivate = async () => {
    setIsProcessing(true);
    await upgradeSubscriptionTier(tier);
    setIsProcessing(false);
    setIsSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
      setIsSuccess(false);
    }, 1500);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment authorization
    setTimeout(async () => {
      await upgradeSubscriptionTier(tier);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setIsSuccess(false);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-surface-200/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-white hover:bg-surface-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-cosmic animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-white">Constellation Activated!</h3>
              <p className="text-xs text-text-secondary">
                You are now upgraded to <span className="text-amber-300 font-semibold">{tierTitle}</span>. Unlimited cosmic resonance unlocked.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-1">
                {tier === 'vip' ? <Crown className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Unlock {tierTitle}</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Celestial Checkout</h2>
              <p className="text-xs text-text-secondary">
                {billingCycle === 'yearly' ? 'Billed annually with 33% celestial savings' : 'Billed monthly, cancel anytime'}
              </p>
            </div>

            {/* Test Mode / Stripe Preview Notification */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
              <Info className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-300">Stripe Integration Sandbox</p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Real payment credentials are not required in this environment. Use the 1-click instant test activation or submit the test form below.
                </p>
              </div>
            </div>

            {/* 1-Click Instant Activation Shortcut */}
            <button
              type="button"
              onClick={handleInstantActivate}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Activating...' : `Instant 1-Click ${tierTitle} Activation (Free Test)`}</span>
            </button>

            {/* Price Banner */}
            <div className="p-3.5 rounded-2xl bg-surface-100 border border-cosmic-purple/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">{tierTitle} ({billingCycle})</span>
                <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  ${finalPrice}
                  <span className="text-xs text-text-muted font-normal"> / {billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
              </div>
              {discountApplied && (
                <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  20% Promo Applied
                </span>
              )}
            </div>

            {/* Promo Code input */}
            {!discountApplied && (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (try: COSMIC2026)"
                    className="w-full bg-surface-100 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cosmic-purple"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-xs font-semibold text-white transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Stripe Card Form */}
            <form onSubmit={handlePay} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-text-secondary">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cosmic-purple"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-text-secondary">Card Number</label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-surface-100 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cosmic-purple font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary">Expires</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cosmic-purple font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary">CVC</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full bg-surface-100 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cosmic-purple font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cosmic-purple via-cosmic-pink to-amber-400 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-cosmic flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Authorizing Celestial Tier...' : `Pay $${finalPrice} & Activate`}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit Encrypted simulated payment flow.</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
