'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, loginAsDemoUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push('/discover');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a moment before trying again.');
      } else {
        setError(err?.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/discover');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoUser();
    router.push('/discover');
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md mx-auto bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header - Centered */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cosmic-purple to-cosmic-pink shadow-cosmic text-white mx-auto">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
            Sign in to check your celestial transits, synastry blueprints, and matches
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* 1-Click Instant Demo Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Quick 1-Click Instant Demo Login</span>
        </button>

        {/* Social Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-white text-sm font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-2 w-full">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink-0 px-3 text-[11px] text-text-muted uppercase tracking-wider font-semibold whitespace-nowrap bg-surface-200">
            or continue with email
          </span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 text-left w-full">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aria@example.com"
                className="w-full bg-surface-100 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-cosmic-purple transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-100 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-cosmic-purple transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3.5 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:opacity-90 text-white font-semibold text-sm shadow-cosmic transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] mt-2"
          >
            <span>{isLoading ? 'Aligning Stars...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link - Centered */}
        <div className="pt-2 text-center border-t border-white/5 space-y-2">
          <p className="text-xs text-text-secondary">
            Don&apos;t have a celestial profile yet?{' '}
            <Link href="/signup" className="text-cosmic-purple hover:text-purple-300 hover:underline font-semibold transition-colors">
              Create Profile
            </Link>
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted & Privacy Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
