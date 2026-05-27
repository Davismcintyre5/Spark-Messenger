import { useState, useCallback, useEffect } from 'react';
import { aiService } from '@/services/aiService';

interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  lastMessage: string;
  timestamp: Date;
  messages: AiChatMessage[];
}

const STORAGE_KEY = 'spark_ai_chat_histories';
const CURRENT_CHAT_KEY = 'spark_ai_current_chat';

export function useAI() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat histories from localStorage on mount
  useEffect(() => {
    loadHistoriesFromStorage();
  }, []);

  const loadHistoriesFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const histories = JSON.parse(stored);
      setChatHistories(histories);
      
      // Load last active chat
      const lastChatId = localStorage.getItem(CURRENT_CHAT_KEY);
      if (lastChatId) {
        const lastChat = histories.find((h: ChatHistory) => h.id === lastChatId);
        if (lastChat) {
          setMessages(lastChat.messages);
          setCurrentChatId(lastChat.id);
          return;
        }
      }
    }
    
    // Default welcome message if no history
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm HDM AI, your Spark assistant. I can help you:\n\n• Draft and rewrite messages\n• Translate text to different languages\n• Summarize long conversations\n• Check privacy and security\n• Answer questions\n\nHow can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const saveHistoriesToStorage = (histories: ChatHistory[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
    setChatHistories(histories);
  };

  const saveCurrentChat = (chatId: string | null) => {
    if (chatId) {
      localStorage.setItem(CURRENT_CHAT_KEY, chatId);
    } else {
      localStorage.removeItem(CURRENT_CHAT_KEY);
    }
    setCurrentChatId(chatId);
  };

  const generateChatTitle = (userMessage: string): string => {
    // Truncate to first 50 chars for title
    return userMessage.length > 50 ? userMessage.substring(0, 47) + '...' : userMessage;
  };

  const generateChatPreview = (messages: AiChatMessage[]): string => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      return lastUserMessage.content.length > 60 
        ? lastUserMessage.content.substring(0, 57) + '...' 
        : lastUserMessage.content;
    }
    return 'Empty conversation';
  };

  const saveChatToHistory = useCallback((chatMessages: AiChatMessage[], chatId?: string | null) => {
    if (chatMessages.length === 0) return;
    
    const firstUserMessage = chatMessages.find(m => m.role === 'user');
    if (!firstUserMessage) return;
    
    const title = generateChatTitle(firstUserMessage.content);
    const preview = generateChatPreview(chatMessages);
    const now = new Date();
    
    let updatedHistories = [...chatHistories];
    
    if (chatId) {
      // Update existing chat
      const index = updatedHistories.findIndex(h => h.id === chatId);
      if (index !== -1) {
        updatedHistories[index] = {
          ...updatedHistories[index],
          title,
          preview,
          lastMessage: preview,
          timestamp: now,
          messages: chatMessages,
        };
      } else {
        // Chat not found, create new
        const newChat: ChatHistory = {
          id: Date.now().toString(),
          title,
          preview,
          lastMessage: preview,
          timestamp: now,
          messages: chatMessages,
        };
        updatedHistories = [newChat, ...updatedHistories];
        saveCurrentChat(newChat.id);
      }
    } else {
      // Create new chat
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        title,
        preview,
        lastMessage: preview,
        timestamp: now,
        messages: chatMessages,
      };
      updatedHistories = [newChat, ...updatedHistories];
      saveCurrentChat(newChat.id);
    }
    
    // Keep only last 50 chats
    if (updatedHistories.length > 50) {
      updatedHistories = updatedHistories.slice(0, 50);
    }
    
    saveHistoriesToStorage(updatedHistories);
  }, [chatHistories]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: AiChatMessage = { role: 'user', content, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const result = await aiService.chat(content);
      
      let reply = '';
      if (result.reply) {
        reply = result.reply;
      } else if (result.data?.reply) {
        reply = result.data.reply;
      } else if (result.response) {
        reply = result.response;
      } else if (typeof result === 'string') {
        reply = result;
      } else {
        reply = "Sorry, I couldn't process that. Please try again.";
      }
      
      const aiMsg: AiChatMessage = { role: 'assistant', content: reply, timestamp: new Date().toISOString() };
      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      
      // Save to history
      saveChatToHistory(finalMessages, currentChatId);
      
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMsg: AiChatMessage = {
        role: 'assistant',
        content: 'AI service is currently unavailable. Please try again later.',
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveChatToHistory(finalMessages, currentChatId);
    } finally {
      setLoading(false);
    }
  }, [messages, currentChatId, saveChatToHistory]);

  const clearChat = useCallback(async () => {
    const welcomeMessage: AiChatMessage[] = [
      {
        role: 'assistant',
        content: "Hi! I'm HDM AI, your Spark assistant. I can help you:\n\n• Draft and rewrite messages\n• Translate text to different languages\n• Summarize long conversations\n• Check privacy and security\n• Answer questions\n\nHow can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(welcomeMessage);
    saveCurrentChat(null);
  }, []);

  const loadChatHistory = useCallback((chatId: string) => {
    const chat = chatHistories.find(h => h.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      saveCurrentChat(chat.id);
    }
  }, [chatHistories]);

  // FIXED: Delete single chat history
  const deleteChat = useCallback((chatId: string) => {
    // Filter out the chat to delete
    const updatedHistories = chatHistories.filter(h => h.id !== chatId);
    saveHistoriesToStorage(updatedHistories);
    
    // If the deleted chat was currently active, clear current chat
    if (currentChatId === chatId) {
      const welcomeMessage: AiChatMessage[] = [
        {
          role: 'assistant',
          content: "Hi! I'm HDM AI, your Spark assistant. I can help you:\n\n• Draft and rewrite messages\n• Translate text to different languages\n• Summarize long conversations\n• Check privacy and security\n• Answer questions\n\nHow can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(welcomeMessage);
      saveCurrentChat(null);
    }
  }, [chatHistories, currentChatId]);

  // FIXED: Delete ALL chat history
  const deleteAllHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to delete ALL chat history? This cannot be undone.')) {
      // Clear all histories from storage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_CHAT_KEY);
      
      // Reset state
      setChatHistories([]);
      setCurrentChatId(null);
      
      // Set welcome message
      const welcomeMessage: AiChatMessage[] = [
        {
          role: 'assistant',
          content: "Hi! I'm HDM AI, your Spark assistant. I can help you:\n\n• Draft and rewrite messages\n• Translate text to different languages\n• Summarize long conversations\n• Check privacy and security\n• Answer questions\n\nHow can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(welcomeMessage);
    }
  }, []);

  return { 
    messages, 
    loading, 
    sendMessage, 
    clearChat,
    loadChatHistory,
    deleteChat,
    deleteAllHistory,
    currentChatId,
    chatHistories
  };
}