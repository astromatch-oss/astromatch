'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import { MOCK_INITIAL_MESSAGES, MOCK_DISCOVER_PROFILES } from '@/lib/mockData';
import { useAuth } from './AuthContext';
import { sendChatMessage, subscribeToMatchMessages } from '@/lib/firestoreService';
import { ZodiacSign } from '@/types/astrology';

interface ChatContextType {
  messages: Record<string, ChatMessage[]>;
  getMatchMessages: (matchId: string) => ChatMessage[];
  sendMessage: (
    matchId: string,
    receiverId: string,
    text: string,
    type?: 'text' | 'icebreaker' | 'astrology_prompt'
  ) => Promise<void>;
  markAsRead: (matchId: string) => void;
  activeMatchId: string | null;
  setActiveMatchId: (id: string | null) => void;
  unreadTotalCount: number;
}

const ZODIAC_RESPONSES: Record<string, string[]> = {
  Fire: [
    "I love this bold energy! What's the wildest adventure on your bucket list? 🔥",
    "Spontaneous sparks are my favorite kind of astrology! Let's grab coffee soon ☕",
    "That passion really speaks to my chart. Tell me more!",
  ],
  Earth: [
    "There's something deeply comforting and grounded about our connection 🌿",
    "I appreciate genuine sincerity so much. What's your favorite way to unwind?",
    "A solid foundation starts with good conversations like this ✨",
  ],
  Air: [
    "Our minds are definitely on the same intellectual wavelength 💨",
    "Haha, that's such a sharp observation! What other mysteries are you curious about?",
    "Endless curiosity and late-night philosophy—count me in! 🌟",
  ],
  Water: [
    "I felt that intuition immediately. The emotional resonance between us is so rare 🌊",
    "There is a deep poetic beauty in how our charts align 🌙",
    "You have a really magnetic presence. I'd love to get to know your world better 💫",
  ],
};

function getElementForSign(sign?: ZodiacSign | string): 'Fire' | 'Earth' | 'Air' | 'Water' {
  switch (sign) {
    case 'Aries':
    case 'Leo':
    case 'Sagittarius':
      return 'Fire';
    case 'Taurus':
    case 'Virgo':
    case 'Capricorn':
      return 'Earth';
    case 'Gemini':
    case 'Libra':
    case 'Aquarius':
      return 'Air';
    case 'Cancer':
    case 'Scorpio':
    case 'Pisces':
    default:
      return 'Water';
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(MOCK_INITIAL_MESSAGES);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // Initialize messages from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('astromatch_messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn('Failed to parse saved messages:', e);
        }
      }
    }
  }, []);

  // Real-time Firestore subscription for the active open chat room
  useEffect(() => {
    if (!activeMatchId) return;

    const unsubscribe = subscribeToMatchMessages(activeMatchId, (liveMsgs) => {
      if (liveMsgs && liveMsgs.length > 0) {
        setMessages((prev) => ({
          ...prev,
          [activeMatchId]: liveMsgs,
        }));
      }
    });

    return () => unsubscribe();
  }, [activeMatchId]);

  const getMatchMessages = (matchId: string): ChatMessage[] => {
    return messages[matchId] || [];
  };

  const myId = profile?.userId || user?.uid || 'demo-user-1';

  // Calculate unread count
  const unreadTotalCount = Object.values(messages).reduce((acc, msgList) => {
    const unread = msgList.filter((m) => m.receiverId === myId && !m.read).length;
    return acc + unread;
  }, 0);

  const sendMessage = async (
    matchId: string,
    receiverId: string,
    text: string,
    type: 'text' | 'icebreaker' | 'astrology_prompt' = 'text'
  ) => {
    const senderId = myId;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      matchId,
      senderId,
      receiverId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      type,
    };

    // 1. Optimistic update and state persistence
    const currentList = messages[matchId] || [];
    const updatedList = [...currentList, newMsg];
    const updatedMap = {
      ...messages,
      [matchId]: updatedList,
    };

    setMessages(updatedMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astromatch_messages', JSON.stringify(updatedMap));
    }

    // 2. Persist to Firestore
    await sendChatMessage(matchId, newMsg);

    // 3. Simulated Celestial Auto-Reply for demo & mock profiles
    const partnerProfile = MOCK_DISCOVER_PROFILES.find((p) => p.userId === receiverId);
    const element = getElementForSign(partnerProfile?.sunSign);
    const pool = ZODIAC_RESPONSES[element] || ZODIAC_RESPONSES['Water'];
    const randomReply = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        matchId,
        senderId: receiverId,
        receiverId: senderId,
        text: randomReply,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setMessages((prev) => {
        const nextList = [...(prev[matchId] || []), replyMsg];
        const nextMap = { ...prev, [matchId]: nextList };
        if (typeof window !== 'undefined') {
          localStorage.setItem('astromatch_messages', JSON.stringify(nextMap));
        }
        return nextMap;
      });
    }, 2200);
  };

  const markAsRead = (matchId: string) => {
    const currentList = messages[matchId];
    if (!currentList) return;

    const currentUserId = myId;
    const hasUnread = currentList.some((m) => m.receiverId === currentUserId && !m.read);
    if (!hasUnread) return;

    const updated = currentList.map((m) =>
      m.receiverId === currentUserId ? { ...m, read: true, readAt: new Date().toISOString() } : m
    );

    const updatedMap = { ...messages, [matchId]: updated };
    setMessages(updatedMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astromatch_messages', JSON.stringify(updatedMap));
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        getMatchMessages,
        sendMessage,
        markAsRead,
        activeMatchId,
        setActiveMatchId,
        unreadTotalCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
