import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusService } from '@/services/statusService';

export function useStatusFeed() {
  return useQuery({
    queryKey: ['status', 'feed'],
    queryFn: () => statusService.getFeed(),
    refetchInterval: 30000,
  });
}

export function useCreateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: statusService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status', 'feed'] });
    },
  });
}

export function useDeleteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statusId: string) => statusService.delete(statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status', 'feed'] });
    },
  });
}

export function useViewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statusId: string) => statusService.view(statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status', 'feed'] });
    },
  });
}

export function useStatusViewers(statusId: string) {
  return useQuery({
    queryKey: ['status', statusId, 'viewers'],
    queryFn: () => statusService.getViewers(statusId),
    enabled: !!statusId,
  });
}

export function useReactToStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ statusId, emoji }: { statusId: string; emoji: string }) =>
      statusService.react(statusId, emoji),
    onSuccess: (_, { statusId }) => {
      queryClient.invalidateQueries({ queryKey: ['status', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['status', statusId, 'viewers'] });
    },
  });
}

export function useReplyToStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ statusId, message }: { statusId: string; message: string }) =>
      statusService.reply(statusId, message),
    onSuccess: (_, { statusId }) => {
      queryClient.invalidateQueries({ queryKey: ['status', 'feed'] });
    },
  });
}