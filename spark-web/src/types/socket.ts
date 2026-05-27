export interface SocketMessagePayload {
  chatId: string;
  content: string;
  messageType: string;
  replyTo?: string;
  media?: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  temporaryId?: string;
}

export interface SocketTypingPayload {
  chatId: string;
  isTyping: boolean;
}

export interface SocketPresencePayload {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  isGhostMode?: boolean;
}

export interface SocketCallPayload {
  chatId: string;
  receiverId?: string;
  callType: 'voice' | 'video';
  signal?: any;
}

export interface SocketCallIncoming {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  chatId: string;
  callType: 'voice' | 'video';
  signal: any;
}

export interface SocketEvents {
  'message:new': (message: any) => void;
  'message:sent': (data: { messageId: string; temporaryId: string }) => void;
  'message:error': (data: { error: string; temporaryId?: string }) => void;
  'message:read-receipt': (data: { chatId: string; messageIds: string[]; readBy: string }) => void;
  'typing:start': (data: { chatId: string; userId: string; displayName: string }) => void;
  'typing:stop': (data: { chatId: string; userId: string }) => void;
  'presence:changed': (data: SocketPresencePayload) => void;
  'presence:list': (data: Array<{ _id: string; status: string; lastSeen: string }>) => void;
  'call:incoming': (data: SocketCallIncoming) => void;
  'call:answered': (data: { callId: string; signal: any }) => void;
  'call:ended': (data: { callId: string; duration: number }) => void;
  'call:declined': (data: { callId: string; declinedBy: string }) => void;
}