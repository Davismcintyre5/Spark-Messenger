import { api } from './api';

export interface LegalDocument {
  _id: string;
  type: 'terms' | 'privacy' | 'cookies' | 'ads_preferences';
  title: string;
  content: string;
  version: number;
  publishedAt: string | null;
  isPublished: boolean;
  updatedAt?: string;
}

export const legalService = {
  getAll: async (): Promise<LegalDocument[]> => {
    try {
      // Fetch all document types
      const types = ['terms', 'privacy', 'cookies', 'ads_preferences'];
      const promises = types.map(type => legalService.getByType(type));
      const results = await Promise.all(promises);
      
      // Filter out null results
      const validDocs = results.filter(doc => doc !== null) as LegalDocument[];
      return validDocs;
    } catch (error) {
      console.error('Failed to fetch legal documents:', error);
      return [];
    }
  },

  getByType: async (type: string): Promise<LegalDocument | null> => {
    try {
      const response = await api.get(`/legal/${type}`);
      // The data is in response.data.data
      const document = response.data?.data;
      console.log(`Fetched ${type}:`, document?.content?.substring(0, 100));
      return document || null;
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      return null;
    }
  },
};