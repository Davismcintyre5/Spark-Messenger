import { api } from './api';
import type { Contact } from '@/types/models';

export const contactService = {
  getContacts: async (page: number = 1, limit: number = 50): Promise<{
    contacts: Contact[];
    total: number;
    hasMore: boolean;
  }> => {
    const response = await api.get('/contacts', { params: { page, limit } });
    return response.data.data;
  },

  syncContacts: async (contacts: Array<{ phone: string; name: string }>): Promise<{
    added: number;
    updated: number;
    onSpark: number;
  }> => {
    const response = await api.post('/contacts/sync', { contacts });
    return response.data.data;
  },

  searchContacts: async (query: string): Promise<Contact[]> => {
    const response = await api.get('/contacts/search', { params: { q: query } });
    return response.data.data;
  },

  blockContact: async (contactId: string): Promise<void> => {
    await api.patch(`/contacts/${contactId}/block`);
  },

  unblockContact: async (contactId: string): Promise<void> => {
    await api.patch(`/contacts/${contactId}/unblock`);
  },

  favoriteContact: async (contactId: string): Promise<void> => {
    await api.patch(`/contacts/${contactId}/favorite`);
  },

  unfavoriteContact: async (contactId: string): Promise<void> => {
    await api.patch(`/contacts/${contactId}/unfavorite`);
  },

  getBlockedContacts: async (): Promise<Contact[]> => {
    const response = await api.get('/contacts/blocked');
    return response.data.data;
  },

  getFavoriteContacts: async (): Promise<Contact[]> => {
    const response = await api.get('/contacts/favorites');
    return response.data.data;
  },

  getContactInfo: async (contactId: string): Promise<Contact> => {
    const response = await api.get(`/contacts/${contactId}`);
    return response.data.data;
  },
};