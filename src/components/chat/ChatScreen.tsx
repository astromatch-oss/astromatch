'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { useChat } from '@/context/ChatContext';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import { RetrogradePrompt } from '@/lib/astrology/retrogradeData';
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShieldAlert,
  Compass,
  Check,
  CheckCheck,
  MoreVertical,
  Heart,
  Smile,
  Search,
  MessageCircle,
  User,
  RotateCcw,
} from 'lucide-react';
import { ZodiacSign } from '@/types/astrology';

// Dynamic lazy loaded modals to minimize initial bundle size on mobile
const SynastryModal = dynamic(
  () => import('@/components/chat/SynastryModal').then((mod) => mod.SynastryModal),
  { ssr: false }
);

const MercuryRetrogradeModal = dynamic(
  () => import('@/components/chat/MercuryRetrogradeModal').then((mod) => mod.MercuryRetrogradeModal),
  { ssr: false }
);

const ReportModal = dynamic(
  () => import('@/components/safety/ReportModal').then((mod) => mod.ReportModal),
  { ssr: false }
);

const CosmicWindowBanner = dynamic(
  () => import('@/components/chat/CosmicWindowBanner').then((mod) => mod.CosmicWindowBanner),
  { ssr: false }
);

const CheckoutModal = dynamic(
  () => import('@/components/subscription/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);

const QUICK_EMOJIS = ['✨', '💫', '🌙', '🪐', '💖', '🔥', '☕', '🌟'];

interface ChatScreenProps {
  initialMatchId?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ initialMatchId }) => {
  const router = useRouter();

  const { user, profile, subscriptionTier, isDemoMode } = useAuth();
  const { matches, reportProfile, blockProfile } = useMatch();
  const { messages, getMatchMessages, sendMessage, markAsRead, setActiveMatchId } = useChat();

  const myId = profile?.userId || user?.uid || 'demo-user-1';

  // Selected match state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(initialMatchId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSynastryModal, setShowSynastryModal] = useState(false);
  const [showRetrogradeModal, setShowRetrogradeModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize selectedMatchId based on route params, query string or screen width
  useEffect(() => {
    let matchId = initialMatchId;

    if (!matchId && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('matchId');
      if (qId) matchId = qId;
    }

    if (matchId) {
      setSelectedMatchId(matchId);
    } else if (typeof window !== 'undefined' && window.innerWidth >= 768 && matches.length > 0) {
      // Desktop default to first match
      setSelectedMatchId(matches[0].id);
    }
  }, [initialMatchId, matches]);

  // Sync active match id with ChatContext and mark read
  useEffect(() => {
    if (selectedMatchId) {
      setActiveMatchId(selectedMatchId);
      markAsRead(selectedMatchId);
    }
    return () => {
      setActiveMatchId(null);
    };
  }, [selectedMatchId, markAsRead, setActiveMatchId]);

  // Find active Match object
  const activeMatch = matches.find((m) => m.id === selectedMatchId) || (selectedMatchId ? null : null);
  const partnerId = activeMatch?.users.find((id) => id !== myId) || 'user-elena';
  const partner: {
    firstName: string;
    photo: string;
    sunSign: ZodiacSign;
    moonSign?: ZodiacSign;
    risingSign?: ZodiacSign;
    age: number;
    profilePhotos?: string[];
  } = (activeMatch?.profiles?.[partnerId] || {
    firstName: 'Elena',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    sunSign: 'Pisces' as ZodiacSign,
    moonSign: 'Cancer' as ZodiacSign,
    risingSign: 'Taurus' as ZodiacSign,
    age: 25,
  }) as any;

  const activeMessages = selectedMatchId ? getMatchMessages(selectedMatchId) : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, isTyping, selectedMatchId]);

  // Filter matches based on search query
  const filteredMatches = matches.filter((m) => {
    const pId = m.users.find((id) => id !== myId) || m.users[1];
    const p = m.profiles[pId];
    if (!p) return false;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.firstName.toLowerCase().includes(query) ||
      p.sunSign.toLowerCase().includes(query)
    );
  });

  // Calculate synastry for the active match
  const synastry = astrologyService.calculateSynastry(
    profile || { sunSign: 'Scorpio' },
    {
      sunSign: partner.sunSign,
      moonSign: partner.moonSign,
      risingSign: partner.risingSign,
    }
  );

  // Icebreaker prompts for active match
  const icebreakers = astrologyService.getIcebreakerPrompts(
    (profile?.sunSign as ZodiacSign) || 'Scorpio',
    (partner.sunSign as ZodiacSign) || 'Pisces'
  );

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedMatchId) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setShowEmojiPicker(false);
    await sendMessage(selectedMatchId, partnerId, text, 'text');
  };

  const handleSendIcebreaker = async (prompt: string) => {
    if (!selectedMatchId) return;
    await sendMessage(selectedMatchId, partnerId, prompt, 'icebreaker');
  };

  const handleSendRetrogradePrompt = async (prompt: RetrogradePrompt) => {
    if (!selectedMatchId) return;
    const fullText = `☿ [MERCURY RETROGRADE PLOT TWIST] ${prompt.prompt}`;
    await sendMessage(selectedMatchId, partnerId, fullText, 'retrograde');
  };

  const handleEmojiClick = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full h-[calc(100dvh-4rem)] p-2 sm:p-4 flex gap-4 overflow-hidden">
      {/* =========================================
          LEFT PANE: Matches & Conversations List
          ========================================= */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
          selectedMatchId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cosmic-purple" />
              <span>Cosmic Messages</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cosmic-purple/20 text-purple-300 border border-cosmic-purple/30 font-semibold">
              {matches.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matches or zodiac sign..."
              className="w-full bg-surface-100 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cosmic-purple"
            />
          </div>
        </div>

        {/* Stories / Recent Match Avatars Bar */}
        {matches.length > 0 && (
          <div className="p-3 border-b border-white/5 flex-shrink-0">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2 px-1">
              Active Alignments
            </span>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
              {matches.map((m) => {
                const pId = m.users.find((id) => id !== myId) || m.users[1];
                const p = m.profiles[pId] || {
                  firstName: 'Soul',
                  photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
                  sunSign: 'Pisces',
                };
                const isCurrent = m.id === selectedMatchId;
                const optimizedPhoto = getOptimizedImageUrl(p.photo, { width: 96, quality: 75 });

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMatchId(m.id);
                      markAsRead(m.id);
                    }}
                    className="flex flex-col items-center gap-1 flex-shrink-0 group focus:outline-none"
                  >
                    <div
                      className={`w-13 h-13 rounded-full p-0.5 transition-all duration-200 ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-amber-400 via-pink-400 to-purple-500 scale-105 shadow-cosmic-gold'
                          : 'bg-surface-100 group-hover:bg-cosmic-purple/40'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-surface-300 pointer-events-none">
                        <Image
                          src={optimizedPhoto}
                          alt={p.firstName}
                          fill
                          loading="lazy"
                          className="object-cover pointer-events-none"
                          sizes="48px"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-white max-w-[55px] truncate pointer-events-none">
                      {p.firstName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Heart className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-xs text-text-secondary">No conversations found</p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cosmic-purple text-white text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find Matches</span>
              </Link>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const pId = m.users.find((id) => id !== myId) || m.users[1];
              const p = m.profiles[pId] || {
                firstName: 'Match',
                photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
                sunSign: 'Pisces' as ZodiacSign,
                age: 25,
              };

              const threadMessages = messages[m.id] || [];
              const lastMsg = threadMessages[threadMessages.length - 1] || m.lastMessage;
              const unreadInThread = threadMessages.filter(
                (msg) => msg.receiverId === myId && !msg.read
              ).length;
              const isSelected = m.id === selectedMatchId;
              const optimizedPhoto = getOptimizedImageUrl(p.photo, { width: 96, quality: 75 });

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMatchId(m.id);
                    markAsRead(m.id);
                  }}
                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-150 ${
                    isSelected
                      ? 'bg-surface-100 border border-cosmic-purple/40 shadow-sm'
                      : 'hover:bg-surface-100/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-white/10 pointer-events-none">
                      <Image
                        src={optimizedPhoto}
                        alt={p.firstName}
                        fill
                        loading="lazy"
                        className="object-cover pointer-events-none"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
                          {p.firstName}, {p.age}
                        </span>
                        <AstrologyBadge sign={p.sunSign as ZodiacSign} size="sm" />
                      </div>
                      <p
                        className={`text-xs mt-0.5 truncate ${
                          unreadInThread > 0 ? 'text-white font-bold' : 'text-text-secondary'
                        }`}
                      >
                        {lastMsg?.text || 'Matched under the stars ✨'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0 pointer-events-none">
                    {unreadInThread > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-cosmic-pink text-white text-[10px] font-extrabold animate-pulse">
                        {unreadInThread}
                      </span>
                    ) : m.compatibility ? (
                      <span className="text-[11px] font-bold text-amber-300">
                        {m.compatibility.overallScore}%
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================
          RIGHT PANE: Active Chat Conversation
          ========================================= */}
      <div
        className={`flex-1 flex flex-col bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl ${
          selectedMatchId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeMatch && selectedMatchId ? (
          <>
            {/* Top Chat Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-300/80 backdrop-blur-xl border-b border-white/10 z-20">
              <div className="flex items-center gap-3">
                {/* Back to list button on mobile */}
                <button
                  onClick={() => setSelectedMatchId(null)}
                  className="md:hidden p-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white transition-colors"
                  title="Back to conversations list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Partner info display (safe non-hijacking header) */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white/20">
                    <Image
                      src={getOptimizedImageUrl(partner.photo, { width: 80, quality: 80 })}
                      alt={partner.firstName}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm sm:text-base text-white">
                        {partner.firstName}, {partner.age}
                      </h2>
                      <AstrologyBadge sign={partner.sunSign as ZodiacSign} size="sm" />
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {isTyping
                        ? 'Typing under cosmic influence...'
                        : `${synastry.overallScore}% Celestial Compatibility`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 relative">
                {/* Mercury Retrograde Button */}
                <button
                  onClick={() => setShowRetrogradeModal(true)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-cosmic-gold hover:scale-105"
                  title="Trigger Mercury Retrograde Plot Twist"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span className="hidden sm:inline">Mercury Retrograde</span>
                  <span className="sm:hidden">☿ Retrograde</span>
                </button>

                {/* Synastry Blueprint Button */}
                <button
                  onClick={() => setShowSynastryModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-cosmic hover:scale-105"
                  title="Open Interactive Synastry Breakdown"
                >
                  <Compass className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden sm:inline">Synastry</span>
                </button>

                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-surface-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Safety and Profile menu dropdown */}
                {showMenu && (
                  <div className="absolute right-0 top-11 w-52 bg-surface-100 border border-white/10 rounded-2xl shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowRetrogradeModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-amber-300 hover:bg-surface-50 rounded-xl flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mercury Retrograde Twist</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowSynastryModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-purple-300 hover:bg-surface-50 rounded-xl flex items-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-purple-300" />
                      <span>Synastry Blueprint</span>
                    </button>
                    <Link
                      href={`/compatibility/${partnerId}`}
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-white hover:bg-surface-50 rounded-xl flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Full Compatibility Report</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowReportModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 rounded-xl flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Report & Block</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Feature 1: Cosmic Window (Transit-Based Date Timing Banner) */}
            <CosmicWindowBanner
              currentUser={profile || { firstName: 'You', sunSign: 'Scorpio' }}
              partner={partner}
              subscriptionTier={subscriptionTier}
              isDemoMode={isDemoMode}
              onUnlockVip={() => setIsCheckoutOpen(true)}
            />

            {/* Scrollable Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar">
              {/* Inception badge */}
              <div className="py-3 text-center space-y-1.5">
                <div className="inline-flex p-2.5 rounded-full bg-cosmic-purple/15 text-cosmic-purple border border-cosmic-purple/30 mx-auto">
                  <Heart className="w-5 h-5 fill-cosmic-purple text-cosmic-purple" />
                </div>
                <p className="text-xs text-text-secondary">
                  You connected with <span className="text-white font-semibold">{partner.firstName}</span>. High planetary synergy detected!
                </p>
              </div>

              {/* Message List */}
              {activeMessages.map((msg) => {
                const isMine = msg.senderId === myId;
                const isRetrograde = msg.type === 'retrograde' || msg.text.startsWith('☿ [MERCURY RETROGRADE');
                const time = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isRetrograde
                          ? 'bg-gradient-to-tr from-amber-500/20 via-surface-100 to-purple-500/20 border-2 border-amber-500/50 shadow-cosmic-gold text-white rounded-2xl'
                          : isMine
                          ? 'bg-gradient-to-r from-cosmic-purple to-cosmic-violet text-white rounded-br-sm shadow-cosmic'
                          : 'bg-surface-100 border border-white/10 text-white rounded-bl-sm'
                      }`}
                    >
                      {isRetrograde ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-extrabold uppercase tracking-wider bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 w-fit">
                            <RotateCcw className="w-3 h-3 text-amber-400 animate-spin-slow" />
                            <span>Mercury Retrograde Plot Twist</span>
                          </div>
                          <p className="font-medium text-white/95 leading-relaxed">
                            {msg.text.replace('☿ [MERCURY RETROGRADE PLOT TWIST] ', '')}
                          </p>
                        </div>
                      ) : (
                        <>
                          {msg.type === 'icebreaker' && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold mb-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Cosmic Synastry Insight</span>
                            </div>
                          )}
                          <p className="break-words">{msg.text}</p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-text-muted px-1">
                      <span>{time}</span>
                      {isMine && (
                        <span>
                          {msg.read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-text-muted" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions & Carousel Bar */}
            <div className="px-4 py-2 border-t border-white/5 bg-surface-300/60 flex items-center gap-2 overflow-x-auto custom-scrollbar">
              {/* Mercury Retrograde Quick Trigger Chip */}
              <button
                onClick={() => setShowRetrogradeModal(true)}
                className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold whitespace-nowrap transition-all shadow-cosmic-gold flex items-center gap-1.5 flex-shrink-0 hover:scale-105"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>☿ Retrograde Plot Twist</span>
              </button>

              <div className="h-4 w-px bg-white/10 flex-shrink-0" />

              {/* Icebreaker Prompts */}
              {icebreakers.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendIcebreaker(prompt)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/10 text-text-secondary hover:text-white whitespace-nowrap transition-colors flex-shrink-0"
                >
                  💫 {prompt}
                </button>
              ))}
            </div>

            {/* Emoji Quick Picker */}
            {showEmojiPicker && (
              <div className="p-2 bg-surface-100 border-t border-white/10 flex items-center justify-around">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-lg p-1 hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-surface-300/90 backdrop-blur-xl border-t border-white/10 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 rounded-xl text-text-muted hover:text-white bg-surface-100 hover:bg-surface-50 border border-white/5 transition-colors"
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${partner.firstName}...`}
                className="flex-1 bg-surface-100 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-cosmic-purple"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white hover:opacity-90 disabled:opacity-40 shadow-cosmic transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Empty State when no match is selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cosmic-purple/15 text-cosmic-purple border border-cosmic-purple/30 flex items-center justify-center shadow-cosmic">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-xl font-bold text-white">Select a Celestial Conversation</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Choose a connection from the left panel to explore synastry and message in real-time.
              </p>
            </div>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white text-xs font-semibold shadow-cosmic"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Potential Matches</span>
            </Link>
          </div>
        )}
      </div>

      {/* Interactive Lazy-Loaded Mercury Retrograde Modal */}
      {selectedMatchId && showRetrogradeModal && (
        <MercuryRetrogradeModal
          isOpen={showRetrogradeModal}
          onClose={() => setShowRetrogradeModal(false)}
          partnerName={partner.firstName}
          onSendToChat={handleSendRetrogradePrompt}
        />
      )}

      {/* Interactive Lazy-Loaded Synastry Breakdown Modal with Composite Destiny */}
      {selectedMatchId && showSynastryModal && (
        <SynastryModal
          isOpen={showSynastryModal}
          onClose={() => setShowSynastryModal(false)}
          userA={profile || { firstName: 'You', sunSign: 'Scorpio' }}
          partner={partner}
          compatibility={synastry}
          subscriptionTier={subscriptionTier}
          isDemoMode={isDemoMode}
          onUnlockVip={() => setIsCheckoutOpen(true)}
          onShareToChat={async (text) => {
            if (selectedMatchId) {
              await sendMessage(selectedMatchId, partnerId, text, 'icebreaker');
            }
          }}
        />
      )}

      {/* Lazy-Loaded Safety Report Modal */}
      {showReportModal && (
        <ReportModal
          profile={{ userId: partnerId, firstName: partner.firstName } as any}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmitReport={async (uid, reason, details) => {
            await reportProfile(uid, reason, details);
            setSelectedMatchId(null);
          }}
        />
      )}

      {/* VIP Checkout Paywall Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          tier="vip"
          billingCycle="yearly"
          price="$239.88"
          onSuccess={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
};
