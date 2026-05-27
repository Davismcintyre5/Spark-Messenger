export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: {
    userId: string;
    phone: string;
    displayName: string;
    email?: string;
    avatar?: string;
    username?: string;
    isHdmVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  deviceInfo?: {
    deviceId?: string;
    deviceName?: string;
    deviceType?: string;
    os?: string;
  };
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  messageType?: string;
  replyTo?: string;
  media?: string;
  mediaUrl?: string;
  temporaryId?: string;
}