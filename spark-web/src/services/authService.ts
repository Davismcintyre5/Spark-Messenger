import { api } from './api';
import type { ApiResponse, AuthResponse, SendOtpRequest, VerifyOtpRequest } from '@/types/api';

export const authService = {
  sendOtp: async (data: SendOtpRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/send-otp', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken?: string, deviceId?: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken, deviceId });
  },

  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },
};