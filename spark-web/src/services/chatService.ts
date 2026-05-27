import { api } from './api';
import type { Chat } from '@/types/models';

export const chatService = {
  getChats: async (): Promise<{ chats: Chat[]; pinnedChats: Chat[] }> => {
    const response = await api.get('/chats');
    return response.data.data;
  },

  getChat: async (chatId: string): Promise<Chat> => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data.data;
  },

  createDirectChat: async (participantId: string): Promise<Chat> => {
    const response = await api.post('/chats/direct', { participantId });
    return response.data.data;
  },

  archiveChat: async (chatId: string): Promise<void> => {
    await api.patch(`/chats/${chatId}/archive`);
  },

  unarchiveChat: async (chatId: string): Promise<void> => {
    await api.patch(`/chats/${chatId}/unarchive`);
  },

  clearChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}/messages`);
  },

  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}`);
  },

  updateWallpaper: async (chatId: string, wallpaper: string): Promise<void> => {
    await api.patch(`/chats/${chatId}/wallpaper`, { wallpaper });
  },

  markAllAsRead: async (): Promise<{ affected: number }> => {
    const response = await api.patch('/chats/read-all');
    return response.data.data;
  },

  markChatAsRead: async (chatId: string): Promise<{ unreadCount: number }> => {
    const response = await api.post(`/chats/${chatId}/read`);
    return response.data.data;
  },

  getTotalUnreadCount: async (): Promise<number> => {
    const response = await api.get('/chats/unread/total');
    return response.data.data.total;
  },

  bulkAction: async (chatIds: string[], action: 'archive' | 'delete' | 'mark_read'): Promise<{ affected: number }> => {
    const response = await api.post('/chats/bulk', { chatIds, action });
    return response.data.data;
  },
};