import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { messageService } from '@/services/messageService';
import { Message } from '@/types/models';
import { useSocket } from '@/providers/SocketProvider';
import { useEffect } from 'react';

export function useChatList() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
    staleTime: 10000,
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['unread-total'] });
    };

    const handleMessageRead = () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['unread-total'] });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read-receipt', handleMessageRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read-receipt', handleMessageRead);
    };
  }, [socket, queryClient]);

  return query;
}

export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatService.getChat(chatId!),
    enabled: !!chatId,
    staleTime: 30000,
  });
}

export function useMessages(chatId: string | undefined, page: number = 1) {
  return useQuery({
    queryKey: ['messages', chatId, page],
    queryFn: () => messageService.getMessages(chatId!, page),
    enabled: !!chatId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof messageService.sendMessage>[0]) =>
      messageService.sendMessage(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
    },
    onError: (_error, variables) => {
      queryClient.setQueryData(['messages', variables.chatId, 1], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages.map((m: Message) =>
            m.temporaryId === variables.temporaryId ? { ...m, status: 'failed' as const } : m,
          ),
        };
      });
    },
  });
}

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => chatService.markChatAsRead(chatId),
    onSuccess: (data, chatId) => {
      // Immediately update cache
      queryClient.setQueryData(['chats'], (old: any) => {
        if (!old) return old;
        
        return {
          chats: old.chats.map((chat: any) => 
            chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
          ),
          pinnedChats: old.pinnedChats?.map((chat: any) => 
            chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
          ) || []
        };
      });
      
      queryClient.setQueryData(['chat', chatId], (old: any) => {
        if (!old) return old;
        return { ...old, unreadCount: 0 };
      });
      
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['unread-total'] });
    },
  });
}

export function useTotalUnreadCount() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ['unread-total'],
    queryFn: () => chatService.getTotalUnreadCount(),
    refetchInterval: 5000,
    staleTime: 2000,
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['unread-total'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    };

    const handleMessageRead = () => {
      queryClient.invalidateQueries({ queryKey: ['unread-total'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read-receipt', handleMessageRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read-receipt', handleMessageRead);
    };
  }, [socket, queryClient]);

  return query;
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['unread-total'] });
    },
  });
}