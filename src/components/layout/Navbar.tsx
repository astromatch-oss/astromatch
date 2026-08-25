'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { useChat } from '@/context/ChatContext';
import { Sparkles, Heart, Compass, ShieldAlert, User, LogOut, Crown, Zap, MessageCircle } from 'lucide-react';
import { AstrologyBadge } from '../astrology/AstrologyBadge';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, isDemoMode, isAdmin, subscriptionTier, signOut } = useAuth();
  const { matches } = useMatch();
  const { unreadTotalCount } = useChat();

  const unreadMatchesCount = matches.reduce((acc, m) => {
    const myUnread = m.unreadCount?.[user?.uid || 'demo-user-1'] || 0;
    return acc + (myUnread > 0 ? 1 : 0);
  }, 0);

  const displayBadge = unreadTotalCount > 0 ? unreadTotalCount : unreadMatchesCount;

  const navLinks = [
    { href: '/discover', label: 'Discover', icon: Sparkles },
    { href: '/chat', label: 'Chat', icon: MessageCircle, badge: displayBadge },
    { href: '/matches', label: 'Matches', icon: Heart },
    { href: '/dashboard', label: 'Celestial Hub', icon: Compass },
    { href: '/pricing', label: 'Premium', icon: Crown },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cosmic-purple via-cosmic-pink to-cosmic-gold p-0.5 shadow-cosmic group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-surface-300 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              AstroMatch
            </span>
            <span className="text-[10px] tracking-wider text-cosmic-purple font-medium -mt-1">
              COSMIC DATING
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-surface-200/60 p-1 rounded-full border border-white/5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cosmic-purple/80 to-cosmic-violet text-white shadow-cosmic'
                      : 'text-text-secondary hover:text-white hover:bg-surface-100/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        )}

        {/* User / Actions */}
        <div className="flex items-center gap-3">
          {subscriptionTier === 'vip' ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/40 shadow-cosmic-gold"
            >
              <Crown className="w-3 h-3 text-amber-300" />
              <span>VIP</span>
            </Link>
          ) : subscriptionTier === 'plus' ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/40"
            >
              <Zap className="w-3 h-3 text-purple-300" />
              <span>PLUS</span>
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-amber-300/20 text-amber-300 border border-amber-400/40 hover:scale-105 transition-transform"
            >
              <Sparkles className="w-3 h-3" />
              <span>Get VIP</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
              title="Admin Moderation Panel"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              {profile && (
                <div className="hidden sm:block">
                  <AstrologyBadge sign={profile.sunSign} size="sm" />
                </div>
              )}

              <Link
                href="/settings"
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-surface-100/80 hover:bg-surface-100 border border-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden relative bg-surface-200 border border-white/20">
                  {profile?.profilePhotos?.[0] ? (
                    <Image
                      src={profile.profilePhotos[0]}
                      alt={profile.firstName || 'Profile'}
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  ) : (
                    <User className="w-4 h-4 m-1.5 text-text-muted" />
                  )}
                </div>
                <span className="text-xs font-medium text-white max-w-[80px] truncate">
                  {profile?.firstName || 'My Profile'}
                </span>
              </Link>

              <button
                onClick={() => signOut()}
                className="p-2 text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-white bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:opacity-90 px-4 py-1.5 rounded-full shadow-cosmic transition-all duration-200"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
