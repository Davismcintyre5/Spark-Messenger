// ====================================================================
// USER
// ====================================================================
export interface User {
  _id: string;
  phone: string;
  email?: string;
  username?: string;
  displayName: string;
  bio: string;
  avatar: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isHdmVerified: boolean;
  hdmVerifiedPlan: 'monthly' | 'yearly' | 'permanent' | null;
  hdmVerifiedExpiresAt: string | null;
  privacy: PrivacySettings;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  about: 'everyone' | 'contacts' | 'nobody';
  status: 'all' | 'selected' | 'except';
  readReceipts: boolean;
  typingIndicator: boolean;
  onlineStatus: boolean;
  freezeLastSeen: boolean;
  hideBlueTicks: boolean;
  hideDoubleTicks: boolean;
  hideTyping: boolean;
  hideRecording: boolean;
  antiDeleteMessages: boolean;
  antiDeleteStatus: boolean;
  ghostMode: boolean;
}

export interface PrivacyProfile {
  name: string;
  config: Partial<PrivacySettings>;
}

// ====================================================================
// CHAT
// ====================================================================
export interface Chat {
  _id: string;
  participants: User[];
  isGroup: boolean;
  groupName: string;
  groupIcon: string;
  groupDescription: string;
  groupAdmins: string[];
  lastMessage: {
    content: string;
    senderId: string;
    messageType: string;
    createdAt: string;
  } | null;
  pinnedMessages: string[];
  wallpaper: string;
  createdAt: string;
  updatedAt: string;
}

// ====================================================================
// MESSAGE
// ====================================================================
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker' | 'gif';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  _id: string;
  chatId: string;
  senderId: string | User;
  content: string;
  messageType: MessageType;
  media: string;
  mediaUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  fileName: string;
  mimeType: string;
  replyTo: string | Message | null;
  forwardedFrom: string | null;
  status: MessageStatus;
  deliveredTo: string[];
  readBy: string[];
  reactions: Reaction[];
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  isPinned: boolean;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
  temporaryId?: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

// ====================================================================
// GROUP
// ====================================================================
export interface Group {
  _id: string;
  chatId: string;
  name: string;
  icon: string;
  description: string;
  ownerId: string;
  admins: string[];
  members: User[];
  memberCount: number;
  inviteLink: string;
  privacy: 'open' | 'closed';
  createdAt: string;
}

// ====================================================================
// CONTACT
// ====================================================================
export interface Contact {
  _id: string;
  userId: string;
  contactPhone: string;
  contactName: string;
  contactUserId: User | null;
  isOnSpark: boolean;
  isBlocked: boolean;
  isFavorite: boolean;
}

// ====================================================================
// STATUS
// ====================================================================
export interface StatusUpdate {
  _id: string;
  userId: string | User;
  content: string;
  media: string;
  mediaUrl: string;
  caption: string;
  backgroundColor: string;
  viewers: string[];
  reactions: Reaction[];
  expiresAt: string;
  createdAt: string;
}

export interface StatusFeed {
  user: User;
  statuses: StatusUpdate[];
}

// ====================================================================
// CALL
// ====================================================================
export type CallType = 'voice' | 'video';
export type CallStatus = 'initiated' | 'ringing' | 'ongoing' | 'ended' | 'missed' | 'declined';

export interface Call {
  _id: string;
  chatId: string;
  callerId: string | User;
  receiverId: string | User;
  callType: CallType;
  status: CallStatus;
  duration: number;
  isGroup: boolean;
  createdAt: string;
}

// ====================================================================
// NOTIFICATION
// ====================================================================
export interface Notification {
  _id: string;
  userId: string;
  type: 'message' | 'call' | 'status' | 'group_invite' | 'mention' | 'reaction' | 'system' | 'payment';
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  chatId: string | null;
  messageId: string | null;
  createdAt: string;
}

// ====================================================================
// PAYMENT
// ====================================================================
export interface PaymentPlan {
  plan: 'monthly' | 'yearly' | 'permanent';
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'stripe' | 'mpesa_stk_push' | 'mpesa_send_money' | 'mpesa_paybill' | 'mpesa_till' | 'paypal';
  enabled: boolean;
  description: string;
}

// ====================================================================
// AI
// ====================================================================
export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}