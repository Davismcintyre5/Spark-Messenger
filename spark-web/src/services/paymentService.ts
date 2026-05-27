import { api } from './api';
import type { PaymentPlan } from '@/types/models';

export const paymentService = {
  initiatePayment: async (data: {
    plan: 'monthly' | 'yearly' | 'permanent';
    paymentMethod: string;
    phone?: string;
  }): Promise<{ payment: any; paymentUrl: string | null }> => {
    const response = await api.post('/payments/initiate', data);
    return response.data.data;
  },

  confirmManualPayment: async (activationId: string, transactionReference?: string): Promise<any> => {
    const response = await api.post('/payments/confirm', { activationId, transactionReference });
    return response.data.data;
  },

  getActivationStatus: async (): Promise<any[]> => {
    const response = await api.get('/payments/activations');
    return response.data.data;
  },

  getPaymentHistory: async (page: number = 1): Promise<any> => {
    const response = await api.get('/payments/history', { params: { page } });
    return response.data.data;
  },
};