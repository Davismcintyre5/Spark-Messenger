import { api } from './api';
import type { Call } from '@/types/models';

export const callService = {
  getHistory: async (page: number = 1): Promise<{ calls: Call[]; total: number; hasMore: boolean }> => {
    const response = await api.get('/calls/history', { params: { page } });
    return response.data.data;
  },

  initiate: async (receiverId: string, callType: 'voice' | 'video'): Promise<{ call: Call; chatId: string }> => {
    const response = await api.post('/calls/initiate', { receiverId, callType });
    return response.data.data;
  },

  updateStatus: async (callId: string, status: string, duration?: number): Promise<void> => {
    await api.patch(`/calls/${callId}`, { status, duration });
  },

  delete: async (callId: string): Promise<void> => {
    await api.delete(`/calls/${callId}`);
  },
};