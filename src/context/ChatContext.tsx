'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import { MOCK_INITIAL_MESSAGES } from '@/lib/mockData';
import { useAuth } from './AuthContext';
import { sendChatMessage, subscribeToMatchMessages } from '@/lib/firestoreService';

interface ChatContextType {
  messages: Record<string, ChatMessage[]>;
  getMatchMessages: (matchId: string) => ChatMessage[];
  sendMessage: (
    matchId: string,
    receiverId: string,
    text: string,
    type?: 'text' | 'icebreaker' | 'astrology_prompt' | 'retrograde'
  ) => Promise<void>;
  markAsRead: (matchId: string) => void;
  activeMatchId: string | null;
  setActiveMatchId: (id: string | null) => void;
  unreadTotalCount: number;
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
    type: 'text' | 'icebreaker' | 'astrology_prompt' | 'retrograde' = 'text'
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

    // 1. Direct state update and local storage persistence
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

    // 2. Persist directly to Firestore (real two-way communication without automated replies)
    await sendChatMessage(matchId, newMsg);
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
