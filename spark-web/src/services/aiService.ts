import { api } from './api';

export const aiService = {
  // A1 - CHAT WITH HDM AI
  chat: async (message: string, language: string = 'en'): Promise<any> => {
    const response = await api.post('/ai/chat/ask', { message, language });
    // Handle nested response: response.data.data.data.reply
    const aiData = response.data?.data?.data;
    if (aiData && aiData.reply) {
      return { reply: aiData.reply };
    }
    if (response.data?.data?.reply) {
      return { reply: response.data.data.reply };
    }
    if (response.data?.reply) {
      return { reply: response.data.reply };
    }
    return { reply: 'Sorry, I could not process that request.' };
  },

  translate: async (text: string, targetLanguage: string): Promise<any> => {
    const response = await api.post('/ai/chat/translate', { text, targetLanguage });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  rewrite: async (text: string, style: string): Promise<any> => {
    const response = await api.post('/ai/chat/rewrite', { text, style });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  draft: async (prompt: string, tone: string): Promise<any> => {
    const response = await api.post('/ai/chat/draft', { prompt, tone });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  explain: async (text: string, level: string = 'simple'): Promise<any> => {
    const response = await api.post('/ai/chat/explain', { text, level });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  summarize: async (text: string, maxLength: number = 200): Promise<any> => {
    const response = await api.post('/ai/chat/summarize', { text, maxLength });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  summarizeUnread: async (messages: string[]): Promise<any> => {
    const response = await api.post('/ai/chat/summarize-unread', { messages });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  emojiSuggest: async (message: string, count: number = 3): Promise<any> => {
    const response = await api.post('/ai/chat/emoji-suggest', { message, count });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  autocomplete: async (partialText: string, maxSuggestions: number = 3, recentMessages?: any[]): Promise<any> => {
    const response = await api.post('/ai/chat/autocomplete', { partialText, maxSuggestions, recentMessages });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  toneDetect: async (text: string): Promise<any> => {
    const response = await api.post('/ai/chat/tone-detect', { text });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  format: async (text: string, formatType: string = 'markdown'): Promise<any> => {
    const response = await api.post('/ai/chat/format', { text, formatType });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  quoteReply: async (originalMessage: string, reply: string): Promise<any> => {
    const response = await api.post('/ai/chat/quote-reply', { originalMessage, reply });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  pollGenerate: async (topic: string, optionsCount: number = 4): Promise<any> => {
    const response = await api.post('/ai/chat/poll-generate', { topic, optionsCount });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  contextReply: async (message: string, contextMessages: string[]): Promise<any> => {
    const response = await api.post('/ai/chat/context-reply', { message, contextMessages });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  // A2 - SMART REPLY
  smartReply: async (message: string, count: number = 3, tone?: string, context?: any): Promise<any> => {
    const response = await api.post('/ai/smart/reply', { message, count, tone, context });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  quickReply: async (message: string, count: number = 4): Promise<any> => {
    const response = await api.post('/ai/smart/quick-reply', { message, count });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  replyContext: async (message: string, previousMessages: string[]): Promise<any> => {
    const response = await api.post('/ai/smart/reply-context', { message, previousMessages });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  replyTone: async (message: string, targetTone: string): Promise<any> => {
    const response = await api.post('/ai/smart/reply-tone', { message, targetTone });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  replyLanguage: async (message: string, language: string): Promise<any> => {
    const response = await api.post('/ai/smart/reply-language', { message, language });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  // A3 - MESSAGE INTELLIGENCE
  sentiment: async (text: string, context?: string): Promise<any> => {
    const response = await api.post('/ai/intel/sentiment', { text, context });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  keywords: async (text: string, count: number = 10): Promise<any> => {
    const response = await api.post('/ai/intel/keywords', { text, count });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  entities: async (text: string): Promise<any> => {
    const response = await api.post('/ai/intel/entities', { text });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  urgency: async (message: string): Promise<any> => {
    const response = await api.post('/ai/intel/urgency', { message });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  languageDetect: async (text: string): Promise<any> => {
    const response = await api.post('/ai/intel/language-detect', { text });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  // A4 - SAFETY & MODERATION
  checkSpam: async (text: string, userHistory?: any): Promise<any> => {
    const response = await api.post('/ai/safety/spam', { text, userHistory });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  checkHateSpeech: async (text: string, context?: string): Promise<any> => {
    const response = await api.post('/ai/safety/hate-speech', { text, context });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  checkNsfw: async (content: string, contentType: string = 'text'): Promise<any> => {
    const response = await api.post('/ai/safety/nsfw', { content, contentType });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  checkImpersonation: async (text: string, claimedIdentity: string, context?: any): Promise<any> => {
    const response = await api.post('/ai/safety/impersonation', { text, claimedIdentity, context });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  checkLink: async (url: string): Promise<any> => {
    const response = await api.post('/ai/safety/link-check', { url });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  // A5 - GROUP CHAT AI
  groupSummary: async (messages: any[], maxLength: number = 300, groupName?: string): Promise<any> => {
    const response = await api.post('/ai/group/summary', { messages, maxLength, groupName });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  groupHighlights: async (messages: any[], count: number = 5): Promise<any> => {
    const response = await api.post('/ai/group/highlights', { messages, count });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  mentionSuggest: async (partialName: string, groupMembers: string[]): Promise<any> => {
    const response = await api.post('/ai/group/mention-suggest', { partialName, groupMembers });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  // A6 - PRIVACY & SECURITY
  dataLeakCheck: async (message: string, scanType: string = 'full'): Promise<any> => {
    const response = await api.post('/ai/privacy/data-leak', { message, scanType });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },

  encryptSuggest: async (message: string): Promise<any> => {
    const response = await api.post('/ai/privacy/encrypt-suggest', { message });
    const result = response.data?.data?.data || response.data?.data;
    return result;
  },
};