import { api } from './api';
import type { Group } from '@/types/models';

export const groupService = {
  // Core CRUD
  getUserGroups: async (): Promise<Group[]> => {
    const response = await api.get('/groups');
    return response.data.data;
  },

  createGroup: async (data: {
    name: string;
    participants: string[];
    description?: string;
    icon?: string;
  }): Promise<{ chat: any; group: Group }> => {
    const response = await api.post('/groups', data);
    return response.data.data;
  },

  getGroup: async (groupId: string): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data.data;
  },

  updateGroup: async (groupId: string, data: { name?: string; description?: string; icon?: string }): Promise<Group> => {
    const response = await api.patch(`/groups/${groupId}`, data);
    return response.data.data;
  },

  // Member Management
  addMembers: async (groupId: string, members: string[]): Promise<Group> => {
    const response = await api.post(`/groups/${groupId}/members`, { members });
    return response.data.data;
  },

  removeMember: async (groupId: string, memberId: string): Promise<Group> => {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data.data;
  },

  leaveGroup: async (groupId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/leave`);
  },

  // Admin Management
  toggleAdmin: async (groupId: string, memberId: string): Promise<{ isAdmin: boolean; admins: string[] }> => {
    const response = await api.patch(`/groups/${groupId}/admins/${memberId}`);
    return response.data.data;
  },

  // Invite System
  generateInviteLink: async (groupId: string): Promise<{ inviteLink: string; inviteCode: string }> => {
    const response = await api.post(`/groups/${groupId}/invite-link`);
    return response.data.data;
  },

  joinViaInvite: async (code: string): Promise<Group> => {
    const response = await api.post(`/groups/join/${code}`);
    return response.data.data;
  },

  // Settings
  getGroupSettings: async (groupId: string): Promise<any> => {
    const response = await api.get(`/groups/${groupId}/settings`);
    return response.data.data;
  },

  updatePrivacy: async (groupId: string, data: { privacy?: string; joinApproval?: string; memberVisibility?: string }): Promise<Group> => {
    const response = await api.patch(`/groups/${groupId}/privacy`, data);
    return response.data.data;
  },

  updatePermissions: async (groupId: string, permissions: any): Promise<any> => {
    const response = await api.patch(`/groups/${groupId}/permissions`, permissions);
    return response.data.data;
  },

  updateSecurity: async (groupId: string, security: any): Promise<any> => {
    const response = await api.patch(`/groups/${groupId}/security`, security);
    return response.data.data;
  },

  toggleMute: async (groupId: string, mute: boolean): Promise<void> => {
    await api.patch(`/groups/${groupId}/mute`, { mute });
  },

  // Media
  getGroupMedia: async (chatId: string, page?: number, limit?: number): Promise<any[]> => {
    const response = await api.get(`/groups/${chatId}/media`, { params: { page, limit } });
    return response.data.data;
  },

  uploadGroupIcon: async (groupId: string, file: File): Promise<{ iconUrl: string }> => {
    const formData = new FormData();
    formData.append('icon', file);
    const response = await api.post(`/groups/${groupId}/icon`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};