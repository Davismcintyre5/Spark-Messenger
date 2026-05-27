import { api } from './api';

export const searchService = {
  global: async (query: string, type?: string): Promise<any> => {
    const response = await api.get('/search', { params: { q: query, type } });
    return response.data.data;
  },

  ai: async (query: string): Promise<any> => {
    const response = await api.get('/search/ai', { params: { q: query } });
    return response.data.data;
  },
};