import { api } from './api';
import type { StatusFeed, StatusUpdate } from '@/types/models';

export const statusService = {
  getFeed: async (): Promise<StatusFeed[]> => {
    const response = await api.get('/status/feed');
    return response.data.data;
  },

  create: async (data: {
    content?: string;
    media?: string;
    mediaUrl?: string;
    caption?: string;
    backgroundColor?: string;
    privacy?: string;
    selectedContacts?: string[];
    exceptContacts?: string[];
  }): Promise<StatusUpdate> => {
    const response = await api.post('/status', data);
    return response.data.data;
  },

  view: async (statusId: string): Promise<{ viewerCount: number }> => {
    const response = await api.post(`/status/${statusId}/view`);
    return response.data.data;
  },

  getViewers: async (statusId: string): Promise<{ viewers: any[]; viewerCount: number; canView: boolean }> => {
    const response = await api.get(`/status/${statusId}/viewers`);
    return response.data.data;
  },

  react: async (statusId: string, emoji: string): Promise<void> => {
    await api.post(`/status/${statusId}/react`, { emoji });
  },

  reply: async (statusId: string, message: string): Promise<void> => {
    await api.post(`/status/${statusId}/reply`, { message });
  },

  delete: async (statusId: string): Promise<void> => {
    await api.delete(`/status/${statusId}`);
  },
};