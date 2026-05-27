import { api } from './api';
import type { Message, MessageType } from '@/types/models';

export const messageService = {
  sendMessage: async (data: {
    chatId: string;
    content: string;
    messageType?: MessageType;
    replyTo?: string;
    media?: string;
    mediaUrl?: string;
    temporaryId?: string;
  }): Promise<Message> => {
    const response = await api.post('/messages', data);
    return response.data.data;
  },

  getMessages: async (chatId: string, page: number = 1, limit: number = 50): Promise<{
    messages: Message[];
    total: number;
    hasMore: boolean;
  }> => {
    const response = await api.get(`/messages/${chatId}`, { params: { page, limit } });
    return response.data.data;
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await api.patch(`/messages/${messageId}`, { content });
    return response.data.data;
  },

  deleteMessage: async (messageId: string, deleteForEveryone: boolean = false): Promise<void> => {
    await api.delete(`/messages/${messageId}`, { params: { forEveryone: deleteForEveryone } });
  },

  forwardMessage: async (messageId: string, targetChatIds: string[]): Promise<Message[]> => {
    const response = await api.post(`/messages/${messageId}/forward`, { targetChatIds });
    return response.data.data;
  },

  reactToMessage: async (messageId: string, emoji: string): Promise<Message> => {
    const response = await api.post(`/messages/${messageId}/react`, { emoji });
    return response.data.data;
  },

  starMessage: async (messageId: string, star: boolean): Promise<void> => {
    await api.patch(`/messages/${messageId}/star`, { star });
  },

  getStarredMessages: async (): Promise<Message[]> => {
    const response = await api.get('/messages/starred');
    return response.data.data;
  },

  searchMessages: async (query: string, chatId?: string): Promise<Message[]> => {
    const response = await api.get('/messages/search', { params: { q: query, chatId } });
    return response.data.data;
  },
};