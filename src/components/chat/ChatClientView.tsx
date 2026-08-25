'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMatch } from '@/context/MatchContext';
import { useChat } from '@/context/ChatContext';
import { astrologyService } from '@/lib/astrology/astrologyService';
import { AstrologyBadge } from '@/components/astrology/AstrologyBadge';
import { CompatibilityMeter } from '@/components/astrology/CompatibilityMeter';
import { ReportModal } from '@/components/safety/ReportModal';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ZodiacSign } from '@/types/astrology';

const QUICK_EMOJIS = ['✨', '💫', '🌙', '🪐', '💖', '🔥', '☕', '🌟'];

export function ChatClientView({ matchId }: { matchId: string }) {
  const router = useRouter();

  const { user, profile } = useAuth();
  const { matches, reportProfile, blockProfile } = useMatch();
  const { getMatchMessages, sendMessage, markAsRead, setActiveMatchId } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSynastryDrawer, setShowSynastryDrawer] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myId = user?.uid || 'demo-user-1';

  // Find match record
  const match = matches.find((m) => m.id === matchId);
  const partnerId = match?.users.find((id) => id !== myId) || 'user-elena';
  const partner = match?.profiles?.[partnerId] || {
    firstName: 'Elena',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    sunSign: 'Pisces' as ZodiacSign,
    age: 25,
  };

  const messages = getMatchMessages(matchId);

  // Compute synastry
  const synastry = astrologyService.calculateSynastry(
    profile || { sunSign: 'Scorpio' },
    { sunSign: partner.sunSign as ZodiacSign }
  );

  // Set active match and mark as read on open
  useEffect(() => {
    if (matchId) {
      setActiveMatchId(matchId);
      markAsRead(matchId);
    }
    return () => {
      setActiveMatchId(null);
    };
  }, [matchId, markAsRead, setActiveMatchId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  // Astrological icebreakers for this pairing
  const icebreakers = astrologyService.getIcebreakerPrompts(
    (profile?.sunSign as ZodiacSign) || 'Scorpio',
    (partner.sunSign as ZodiacSign) || 'Pisces'
  );

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setShowEmojiPicker(false);
    await sendMessage(matchId, partnerId, text, 'text');

    // Simulate partner typing indicator for lively chat feedback
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2400);
    }, 800);
  };

  const handleSendIcebreaker = async (prompt: string) => {
    await sendMessage(matchId, partnerId, prompt, 'icebreaker');
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2400);
    }, 800);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full h-[calc(100vh-4rem)] bg-surface-300/60 border-x border-border/50">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-200/90 backdrop-blur-xl border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/matches"
            className="p-1.5 rounded-full hover:bg-surface-100 text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white/20">
              <Image
                src={partner.photo}
                alt={partner.firstName}
                fill
                className="object-cover pointer-events-none"
                sizes="40px"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-white">
                  {partner.firstName}, {partner.age}
                </h2>
                <AstrologyBadge sign={partner.sunSign as ZodiacSign} size="sm" />
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                {isTyping ? 'Typing under celestial influence...' : `${synastry.overallScore}% Cosmic Harmony`}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => setShowSynastryDrawer(!showSynastryDrawer)}
            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="View Astrological Synastry"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Synastry</span>
            {showSynastryDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-surface-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Safety menu dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-11 w-44 bg-surface-100 border border-white/10 rounded-2xl shadow-xl p-1.5 z-30 space-y-1">
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
              <button
                onClick={async () => {
                  setShowMenu(false);
                  await blockProfile(partnerId);
                  router.push('/matches');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-50 rounded-xl"
              >
                Block Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Synastry Drawer */}
      {showSynastryDrawer && (
        <div className="p-4 bg-surface-200 border-b border-white/10 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Synastry Blueprint: {profile?.sunSign || 'Scorpio'} & {partner.sunSign}</span>
            </h4>
            <Link
              href={`/compatibility/${partnerId}`}
              className="text-[11px] text-cosmic-purple hover:underline font-semibold"
            >
              Full Report →
            </Link>
          </div>
          <CompatibilityMeter compatibility={synastry} showBreakdown={true} />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {/* Match inception card */}
        <div className="py-4 text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-full bg-cosmic-purple/15 text-cosmic-purple border border-cosmic-purple/30 mx-auto">
            <Heart className="w-5 h-5 fill-cosmic-purple text-cosmic-purple" />
          </div>
          <p className="text-xs text-text-secondary">
            You matched with <span className="text-white font-medium">{partner.firstName}</span>. Both of your natal charts share high celestial resonance!
          </p>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isMine = msg.senderId === myId;
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-gradient-to-r from-cosmic-purple to-cosmic-violet text-white rounded-br-sm shadow-cosmic'
                    : 'bg-surface-100 border border-white/10 text-white rounded-bl-sm'
                }`}
              >
                {msg.type === 'icebreaker' && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Cosmic Icebreaker</span>
                  </div>
                )}
                <p className="break-words">{msg.text}</p>
              </div>

              {/* Timestamp and Read Status */}
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

        {/* Partner Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-surface-100 border border-white/10 rounded-2xl rounded-bl-sm max-w-[140px] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cosmic-purple animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-cosmic-pink animate-bounce delay-150" />
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-bounce delay-300" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Astrological Icebreaker Quick Carousel */}
      <div className="px-4 py-2 border-t border-white/5 bg-surface-300/80">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cosmic-purple mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Tap to send celestial prompt:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {icebreakers.slice(0, 4).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendIcebreaker(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-surface-200 hover:bg-surface-100 border border-white/10 text-text-secondary hover:text-white whitespace-nowrap transition-colors flex-shrink-0"
            >
              💫 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji Quick Picker */}
      {showEmojiPicker && (
        <div className="p-2 bg-surface-200 border-t border-white/10 flex items-center justify-around">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg p-1.5 hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 bg-surface-200/90 backdrop-blur-xl border-t border-white/10 flex items-center gap-2"
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

      {/* Safety Report Modal */}
      <ReportModal
        profile={{ userId: partnerId, firstName: partner.firstName } as any}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmitReport={async (uid, reason, details) => {
          await reportProfile(uid, reason, details);
          router.push('/matches');
        }}
      />
    </div>
  );
}
