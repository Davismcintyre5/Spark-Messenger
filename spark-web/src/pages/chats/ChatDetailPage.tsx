import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useChat, useMessages, useMarkChatAsRead } from '@/hooks/useChat';
import { useSocket as useSocketContext } from '@/providers/SocketProvider';
import { useAuth } from '@/providers/AuthProvider';
import { chatService } from '@/services/chatService';
import { contactService } from '@/services/contactService';
import { callService } from '@/services/callService';
import { api } from '@/services/api';
import { useUIStore } from '@/stores/uiStore';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import CallTimer from '@/components/calls/CallTimer';
import AddContactOverlay from '@/components/chat/AddContactOverlay';
import { Message, MessageType } from '@/types/models';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = useSocketContext();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  const { data: chat } = useChat(chatId);
  const { data: messagesData } = useMessages(chatId);
  const { mutate: markAsRead } = useMarkChatAsRead();

  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState(true);
  const [isInContacts, setIsInContacts] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);

  const messages: Message[] = messagesData?.messages || [];
  const myId = user?._id?.toString?.() || '';

  const otherParticipant = chat?.isGroup
    ? null
    : chat?.participants?.find((p: any) => {
        const pid = typeof p === 'string' ? p : p._id?.toString?.() || p._id;
        return pid !== myId;
      });

  const chatName = chat?.isGroup ? chat.groupName : otherParticipant?.displayName || otherParticipant?.phone || 'Chat';
  const chatAvatar = chat?.isGroup ? chat.groupIcon : otherParticipant?.avatar;
  const otherId = typeof otherParticipant === 'string' ? otherParticipant : otherParticipant?._id?.toString?.() || otherParticipant?._id;
  const isGroup = chat?.isGroup === true;

  // Mark chat as read when opened
  useEffect(() => {
    if (!chatId) return;
    const timer = setTimeout(() => {
      markAsRead(chatId);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['unread-total'] });
    }, 500);
    return () => clearTimeout(timer);
  }, [chatId, markAsRead, queryClient]);

  // Check call status from session
  useEffect(() => {
    const stored = sessionStorage.getItem('activeCall');
    if (stored) {
      try {
        const callData = JSON.parse(stored);
        if (callData.chatId === chatId) {
          setInCall(true); 
          setCallType(callData.callType || 'voice');
          setActiveCallId(callData.callId); 
          setIsCaller(callData.isCaller ?? false);
        }
      } catch {}
    }
  }, [chatId]);

  // Check contact status
  useEffect(() => {
    if (!otherId || isGroup) return;
    Promise.all([
      contactService.getBlockedContacts(),
      contactService.getFavoriteContacts(),
      contactService.getContacts(),
    ]).then(([blocked, favorites, allContacts]) => {
      const blockedIds = blocked.map((c: any) => c.contactUserId?._id?.toString?.() || c.contactUserId);
      const favIds = favorites.map((c: any) => c.contactUserId?._id?.toString?.() || c.contactUserId);
      const contactIds = allContacts.contacts?.map((c: any) => c.contactUserId?._id?.toString?.() || c.contactUserId) || [];
      setIsBlocked(blockedIds.includes(otherId));
      setIsFavorite(favIds.includes(otherId));
      setIsInContacts(contactIds.includes(otherId));
    }).catch(() => {});
  }, [otherId, isGroup]);

  // Auto-scroll to bottom on new messages
  const prevLength = useRef(0);
  useEffect(() => {
    if (messages.length > prevLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLength.current = messages.length;
  }, [messages.length]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !chatId) return;

    const getSenderId = (sid: any): string => {
      if (!sid) return '';
      if (typeof sid === 'string') return sid;
      return sid._id?.toString?.() || sid.toString?.() || '';
    };

    const updateChatList = (content: string, senderId: any, msgType: string, msgTime: string) => {
      queryClient.setQueryData(['chats'], (old: any) => {
        if (!old) return old;
        return { 
          ...old, 
          chats: old.chats.map((c: any) => 
            c._id === chatId ? { ...c, lastMessage: { content, senderId, messageType: msgType, createdAt: msgTime } } : c
          ) 
        };
      });
    };

    const onNewMessage = (msg: Message) => {
      if (msg.chatId !== chatId) return;
      if (getSenderId(msg.senderId) === myId) return;
      
      queryClient.setQueryData(['messages', chatId, 1], (old: any) => {
        if (!old) return { messages: [msg], total: 1, hasMore: false };
        if (old.messages.some((m: Message) => m._id === msg._id || ((msg as any).temporaryId && m.temporaryId === (msg as any).temporaryId))) return old;
        return { ...old, messages: [...old.messages, msg] };
      });
      
      updateChatList(msg.content, msg.senderId, msg.messageType, msg.createdAt);
      socket.emit('message:delivered', { chatId, messageIds: [msg._id] });
    };

    const onMessageSent = (data: { messageId: string; temporaryId: string }) => {
      queryClient.setQueryData(['messages', chatId, 1], (old: any) => {
        if (!old) return old;
        return { 
          ...old, 
          messages: old.messages.map((m: Message) => 
            m.temporaryId === data.temporaryId 
              ? { ...m, _id: data.messageId, temporaryId: undefined, status: 'sent' as const } 
              : m
          ) 
        };
      });
    };

    const onTypingStart = (data: any) => { 
      if (data.chatId === chatId) setTypingUsers((prev) => [...new Set([...prev, data.userId])]); 
    };
    
    const onTypingStop = (data: any) => { 
      if (data.chatId === chatId) setTypingUsers((prev) => prev.filter((id) => id !== data.userId)); 
    };
    
    const onReadReceipt = (data: any) => {
      if (data.chatId === chatId) {
        queryClient.setQueryData(['messages', chatId, 1], (old: any) => {
          if (!old) return old;
          return { 
            ...old, 
            messages: old.messages.map((m: Message) => 
              data.messageIds.includes(m._id) ? { ...m, status: 'read' as const } : m
            ) 
          };
        });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['unread-total'] });
      }
    };
    
    const onCallEnded = () => { 
      setInCall(false); 
      setActiveCallId(null); 
      sessionStorage.removeItem('activeCall');
      addToast({ type: 'info', message: 'Call ended' });
    };
    
    const onCallDeclined = () => { 
      setInCall(false); 
      setActiveCallId(null); 
      sessionStorage.removeItem('activeCall'); 
      addToast({ type: 'info', message: 'Call declined' }); 
    };

    socket.on('message:new', onNewMessage);
    socket.on('message:sent', onMessageSent);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('message:read-receipt', onReadReceipt);
    socket.on('call:ended', onCallEnded);
    socket.on('call:declined', onCallDeclined);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('message:sent', onMessageSent);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('message:read-receipt', onReadReceipt);
      socket.off('call:ended', onCallEnded);
      socket.off('call:declined', onCallDeclined);
    };
  }, [socket, chatId, myId, queryClient, addToast]);

  const handleSend = useCallback(async (content: string, type: MessageType = 'text', mediaUrl?: string, fileName?: string) => {
    if (!chatId || !socket || !user) return;
    
    const temporaryId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    
    const optimistic: Message = {
      _id: temporaryId, 
      chatId, 
      senderId: myId as any,
      content, 
      messageType: type, 
      media: mediaUrl || '', 
      mediaUrl: mediaUrl || '', 
      thumbnailUrl: '',
      fileSize: 0, 
      fileName: fileName || '', 
      mimeType: '', 
      replyTo: null, 
      forwardedFrom: null,
      status: 'sent', 
      deliveredTo: [], 
      readBy: [], 
      reactions: [],
      isEdited: false, 
      editedAt: null, 
      isDeleted: false, 
      isPinned: false, 
      isStarred: false,
      temporaryId, 
      createdAt: now, 
      updatedAt: now,
    };
    
    queryClient.setQueryData(['messages', chatId, 1], (old: any) => {
      if (!old) return { messages: [optimistic], total: 1, hasMore: false };
      return { ...old, messages: [...old.messages, optimistic] };
    });
    
    queryClient.setQueryData(['chats'], (old: any) => {
      if (!old) return old;
      return { 
        ...old, 
        chats: old.chats.map((c: any) => 
          c._id === chatId ? { ...c, lastMessage: { content, senderId: myId, messageType: type, createdAt: now } } : c
        ) 
      };
    });
    
    socket.emit('message:send', { chatId, content, messageType: type, mediaUrl, fileName, temporaryId });
  }, [chatId, socket, myId, queryClient]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    
    const isImage = file.type.startsWith('image/'); 
    const isVideo = file.type.startsWith('video/');
    const type: MessageType = isImage ? 'image' : isVideo ? 'video' : 'document';
    
    try {
      const formData = new FormData(); 
      formData.append('file', file);
      const response = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) handleSend(file.name, type, response.data.data.url, file.name);
      else addToast({ type: 'error', message: 'Upload failed' });
    } catch { 
      addToast({ type: 'error', message: 'Upload failed' }); 
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleSend, addToast]);

  const handleTyping = useCallback((isTyping: boolean) => { 
    if (!socket || !chatId) return; 
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', { chatId }); 
  }, [socket, chatId]);
  
  const handleVoiceRecord = useCallback(() => {
    if (!isRecording) { 
      setIsRecording(true); 
      addToast({ type: 'info', message: 'Recording...' }); 
      setTimeout(() => { 
        setIsRecording(false); 
        handleSend('🎤 Voice message'); 
      }, 5000); 
    } else setIsRecording(false);
  }, [isRecording, addToast, handleSend]);

  const handleCall = async (type: 'voice' | 'video') => {
    if (!otherId || !socket || !chatId || isGroup) return;
    try {
      const result = await callService.initiate(otherId, type);
      socket.emit('call:signal', { receiverId: otherId, chatId, callType: type, signal: { callId: result.call._id } });
      setInCall(true); setCallType(type); setActiveCallId(result.call._id); setIsCaller(true);
      sessionStorage.setItem('activeCall', JSON.stringify({ callId: result.call._id, callType: type, isCaller: true, chatId }));
      addToast({ type: 'success', message: `Calling ${chatName}...` });
    } catch { 
      addToast({ type: 'error', message: 'Call failed' }); 
    }
  };

  const handleEndCall = (duration: number) => {
    if (socket && activeCallId) socket.emit('call:end', { callId: activeCallId, duration });
    setInCall(false); setActiveCallId(null);
    sessionStorage.removeItem('activeCall');
  };

  const handleToggleFavorite = async () => {
    if (!otherId || isGroup) return;
    try {
      if (isFavorite) { 
        await contactService.unfavoriteContact(otherId); 
        addToast({ type: 'success', message: 'Removed from favorites' }); 
      } else { 
        await contactService.favoriteContact(otherId); 
        addToast({ type: 'success', message: 'Added to favorites' }); 
      }
      setIsFavorite(!isFavorite);
    } catch { 
      addToast({ type: 'error', message: 'Failed' }); 
    }
  };

  const handleReport = () => setShowReportModal(true);
  
  const submitReport = async () => {
    if (!reportReason.trim()) return;
    try { 
      await api.post('/reports', { targetType: 'profile', targetId: otherId, reason: reportReason }); 
      addToast({ type: 'success', message: 'Reported' }); 
      setShowReportModal(false); 
      setReportReason(''); 
    } catch { 
      addToast({ type: 'error', message: 'Failed' }); 
    }
  };

  const handleBlock = async () => {
    if (!otherId || isGroup) return;
    try {
      if (isBlocked) { 
        await contactService.unblockContact(otherId); 
        setIsBlocked(false); 
        addToast({ type: 'success', message: 'Unblocked' }); 
      } else { 
        if (!window.confirm('Block this user? They will no longer be able to message you.')) return;
        await contactService.blockContact(otherId); 
        setIsBlocked(true); 
        addToast({ type: 'success', message: 'Blocked' }); 
      }
    } catch { 
      addToast({ type: 'error', message: 'Failed' }); 
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Delete all messages in this chat? This cannot be undone.')) return;
    try { 
      await chatService.clearChat(chatId!); 
      queryClient.setQueryData(['messages', chatId, 1], { messages: [], total: 0, hasMore: false }); 
      addToast({ type: 'success', message: 'Chat cleared' }); 
    } catch { 
      addToast({ type: 'error', message: 'Failed' }); 
    }
  };

  const handleCloseChat = () => navigate('/chats');
  const handleViewInfo = () => { 
    if (isGroup) navigate(`/groups/${chatId}`); 
  };

  if (inCall) {
    return (
      <div className="flex flex-col h-full bg-gray-900">
        <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
          <Avatar src={chatAvatar} name={chatName} size="xl" />
          <h2 className="text-xl font-semibold">{chatName}</h2>
          <CallTimer onEnd={handleEndCall} isCaller={isCaller} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <ChatHeader
        name={chatName}
        avatar={chatAvatar}
        isOnline={otherParticipant?.status === 'online'}
        isGroup={isGroup}
        isHdmVerified={otherParticipant?.isHdmVerified}
        isFavorite={isFavorite}
        isBlocked={isBlocked}
        onBack={() => navigate('/chats')}
        showBack={isMobile}
        onSearch={() => setShowSearch(!showSearch)}
        onToggleFavorite={handleToggleFavorite}
        onReport={handleReport}
        onBlock={handleBlock}
        onClearChat={handleClearChat}
        onCloseChat={handleCloseChat}
        onViewInfo={handleViewInfo}
        onCall={isGroup ? undefined : handleCall}
        onAddContact={!isInContacts && !isGroup ? () => setShowAddContact(true) : undefined}
      />

      {showSearch && (
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-spark-500"
              autoFocus
            />
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="text-xs text-spark-500 font-medium"
            >
              Cancel
            </button>
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-400 mt-2">
              Found {messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase())).length} messages
            </p>
          )}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {messages.length === 0 ? (
          <EmptyState 
            title="No messages yet" 
            description="Send a message to start the conversation! 👋" 
          />
        ) : (
          messages
            .filter((m) => !searchQuery || m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((msg) => {
              const msgSenderId = typeof msg.senderId === 'string' ? msg.senderId : (msg.senderId as any)?._id?.toString?.() || (msg.senderId as any)?._id || '';
              const isOwn = msgSenderId === myId;
              // Get sender name for group chats
              const senderName = !isOwn && isGroup ? (msg.senderId as any)?.displayName || 'User' : '';
              
              return (
                <MessageBubble 
                  key={msg._id || msg.temporaryId} 
                  message={msg} 
                  isOwn={isOwn}
                  isGroup={isGroup}
                  showSenderName={isGroup}
                  senderName={senderName}
                />
              );
            })
        )}
        {typingUsers.length > 0 && !isGroup && <TypingIndicator names={[chatName]} />}
        {typingUsers.length > 0 && isGroup && <TypingIndicator names={[`${typingUsers.length} ${typingUsers.length === 1 ? 'person is' : 'people are'} typing`]} />}
        <div ref={messagesEndRef} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
      />
      
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        onAttach={() => fileInputRef.current?.click()}
        onVoice={handleVoiceRecord}
        isRecording={isRecording}
        isBlocked={isBlocked && !isGroup}
        showEmoji={showEmojiPicker}
        onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
        onEmojiSelect={(emoji) => { handleSend(emoji); setShowEmojiPicker(false); }}
      />

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report Contact" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Why are you reporting this user?
          </p>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please provide details..."
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-none"
            rows={4}
          />
          <div className="flex gap-2">
            <Button onClick={() => setShowReportModal(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={submitReport} variant="danger" className="flex-1">Submit Report</Button>
          </div>
        </div>
      </Modal>

      {/* Add Contact Modal */}
      <AddContactOverlay
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        phone={otherParticipant?.phone || ''}
        name={chatName}
      />
    </div>
  );
}

// Import missing Button component
import Button from '@/components/ui/Button';