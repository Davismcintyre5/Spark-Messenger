import { api } from './api';
import type { PrivacySettings, PrivacyProfile } from '@/types/models';

export const privacyService = {
  getPrivacy: async (): Promise<{
    privacy: PrivacySettings;
    profiles: PrivacyProfile[];
  }> => {
    const response = await api.get('/privacy');
    return response.data.data;
  },

  updatePrivacy: async (updates: Partial<PrivacySettings>): Promise<PrivacySettings> => {
    const response = await api.patch('/privacy', updates);
    return response.data.data;
  },

  toggleGhostMode: async (): Promise<{ ghostMode: boolean }> => {
    const response = await api.post('/privacy/ghost-mode');
    return response.data.data;
  },

  freezeLastSeen: async (): Promise<void> => {
    await api.post('/privacy/freeze-last-seen');
  },

  unfreezeLastSeen: async (): Promise<void> => {
    await api.post('/privacy/unfreeze-last-seen');
  },

  saveProfile: async (name: string, config: Partial<PrivacySettings>): Promise<PrivacyProfile[]> => {
    const response = await api.post('/privacy/profiles', { name, config });
    return response.data.data;
  },

  applyProfile: async (profileName: string): Promise<PrivacySettings> => {
    const response = await api.post('/privacy/profiles/apply', { profileName });
    return response.data.data;
  },

  deleteProfile: async (profileName: string): Promise<void> => {
    await api.delete(`/privacy/profiles/${profileName}`);
  },

  // ADD THIS - Delete account method
  deleteAccount: async (): Promise<void> => {
    await api.delete('/user/account');
  },
};