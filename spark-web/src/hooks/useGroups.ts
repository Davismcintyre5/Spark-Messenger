import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/groupService';
import { useUIStore } from '@/stores/uiStore';

// ============ QUERIES ============

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupService.getUserGroups(),
    staleTime: 30000,
  });
}

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => groupService.getGroup(groupId!),
    enabled: !!groupId,
    staleTime: 30000,
  });
}

export function useGroupSettings(groupId: string | undefined) {
  return useQuery({
    queryKey: ['groups', groupId, 'settings'],
    queryFn: () => groupService.getGroupSettings(groupId!),
    enabled: !!groupId,
    staleTime: 60000,
  });
}

export function useGroupMedia(chatId: string | undefined, page?: number, limit?: number) {
  return useQuery({
    queryKey: ['groups', 'media', chatId, page],
    queryFn: () => groupService.getGroupMedia(chatId!, page, limit),
    enabled: !!chatId,
  });
}

// ============ MUTATIONS ============

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: { name: string; description?: string; participants: string[]; icon?: string }) =>
      groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      addToast({ type: 'success', message: 'Group created successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to create group' });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, updates }: { groupId: string; updates: { name?: string; description?: string; icon?: string } }) =>
      groupService.updateGroup(groupId, updates),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      addToast({ type: 'success', message: 'Group updated successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update group' });
    },
  });
}

export function useAddGroupMembers() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, members }: { groupId: string; members: string[] }) =>
      groupService.addMembers(groupId, members),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      addToast({ type: 'success', message: 'Members added successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to add members' });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.removeMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      addToast({ type: 'success', message: 'Member removed successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to remove member' });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (groupId: string) => groupService.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      addToast({ type: 'success', message: 'Left group successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to leave group' });
    },
  });
}

export function useToggleAdmin() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.toggleAdmin(groupId, memberId),
    onSuccess: (data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      addToast({ type: 'success', message: data.isAdmin ? 'Promoted to admin!' : 'Admin privileges removed!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to change admin status' });
    },
  });
}

export function useGenerateInviteLink() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (groupId: string) => groupService.generateInviteLink(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'settings'] });
      addToast({ type: 'success', message: 'Invite link generated!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to generate invite link' });
    },
  });
}

export function useJoinViaInvite() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (code: string) => groupService.joinViaInvite(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      addToast({ type: 'success', message: 'Joined group successfully!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Invalid or expired invite link' });
    },
  });
}

export function useUpdateGroupPrivacy() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: { privacy?: string; joinApproval?: string; memberVisibility?: string } }) =>
      groupService.updatePrivacy(groupId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'settings'] });
      addToast({ type: 'success', message: 'Privacy settings updated!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update privacy' });
    },
  });
}

export function useUpdateGroupPermissions() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, permissions }: { groupId: string; permissions: any }) =>
      groupService.updatePermissions(groupId, permissions),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'settings'] });
      addToast({ type: 'success', message: 'Permissions updated!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update permissions' });
    },
  });
}

export function useUpdateGroupSecurity() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, security }: { groupId: string; security: any }) =>
      groupService.updateSecurity(groupId, security),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'settings'] });
      addToast({ type: 'success', message: 'Security settings updated!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update security' });
    },
  });
}

export function useToggleGroupMute() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, mute }: { groupId: string; mute: boolean }) =>
      groupService.toggleMute(groupId, mute),
    onSuccess: (_, { groupId, mute }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      addToast({ type: 'success', message: mute ? 'Group muted' : 'Group unmuted' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to change mute status' });
    },
  });
}

export function useUploadGroupIcon() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ groupId, file }: { groupId: string; file: File }) =>
      groupService.uploadGroupIcon(groupId, file),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      addToast({ type: 'success', message: 'Group icon updated!' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to upload icon' });
    },
  });
}