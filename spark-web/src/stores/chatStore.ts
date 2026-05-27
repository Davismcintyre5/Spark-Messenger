import { create } from 'zustand';
import { Chat, Message } from '@/types/models';

interface ChatState {
  chats: Chat[];
  pinnedChats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setChats: (chats: Chat[], pinnedChats: Chat[]) => void;
  setActiveChat: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  updateLastMessage: (chatId: string, message: Partial<Message>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  pinnedChats: [],
  activeChatId: null,
  messages: {},
  typingUsers: {},

  setChats: (chats, pinnedChats) => set({ chats, pinnedChats }),

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),

  addMessage: (chatId, message) => {
    const existing = get().messages[chatId] || [];
    const exists = existing.some((m) => m._id === message._id || m.temporaryId === message.temporaryId);
    if (exists) return;
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...existing, message],
      },
    }));
  },

  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m._id === messageId || m.temporaryId === messageId ? { ...m, ...updates } : m,
        ),
      },
    })),

  setTyping: (chatId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[chatId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return { typingUsers: { ...state.typingUsers, [chatId]: updated } };
    }),

  updateLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId ? { ...c, lastMessage: { ...c.lastMessage, ...message } as any } : c,
      ),
      pinnedChats: state.pinnedChats.map((c) =>
        c._id === chatId ? { ...c, lastMessage: { ...c.lastMessage, ...message } as any } : c,
      ),
    })),
}));