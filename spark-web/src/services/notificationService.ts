import { api } from './api';
import type { Notification } from '@/types/models';

export const notificationService = {
  getAll: async (page: number = 1, unreadOnly: boolean = false): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    hasMore: boolean;
  }> => {
    const response = await api.get('/notifications', { params: { page, unreadOnly } });
    return response.data.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  delete: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  deleteAll: async (): Promise<void> => {
    await api.delete('/notifications');
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  },
};