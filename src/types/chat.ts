export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  type?: 'text' | 'icebreaker' | 'astrology_prompt' | 'retrograde';
}

export interface ConversationParticipant {
  userId: string;
  firstName: string;
  photo: string;
  sunSign: string;
  age: number;
  isOnline?: boolean;
  lastActive?: string;
}

export interface ActiveConversation {
  matchId: string;
  partner: ConversationParticipant;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}
