import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, Sparkles, MessageSquare, Languages, Search, ShieldAlert, 
  Trash2, Menu, X, Clock, ChevronRight, Plus, 
  Copy, Check, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import Avatar from '@/components/ui/Avatar';

const quickActions = [
  { icon: <MessageSquare className="w-4 h-4" />, label: 'Draft Message', prompt: 'Help me draft a message: ' },
  { icon: <Languages className="w-4 h-4" />, label: 'Translate', prompt: 'Translate to Swahili: ' },
  { icon: <Search className="w-4 h-4" />, label: 'Summarize', prompt: 'Summarize this: ' },
  { icon: <ShieldAlert className="w-4 h-4" />, label: 'Privacy Check', prompt: 'Is this safe to share? ' },
];

export default function AiChatPage() {
  const { 
    messages, 
    loading, 
    sendMessage, 
    clearChat, 
    loadChatHistory, 
    deleteChat, 
    deleteAllHistory, 
    currentChatId, 
    chatHistories 
  } = useAI();
  
  const [input, setInput] = useState('');
  const [showActions, setShowActions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    await sendMessage(input.trim());
    setInput('');
    setShowActions(false);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setShowActions(false);
    inputRef.current?.focus();
  };

  const handleClearChat = async () => {
    if (window.confirm('Clear current conversation? It will be saved in history.')) {
      await clearChat();
      setShowActions(true);
    }
  };

  const handleNewChat = () => {
    clearChat();
    setShowActions(true);
    setInput('');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopied(`msg-${index}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLoadChat = (chatId: string) => {
    loadChatHistory(chatId);
    setShowActions(false);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(chatId);
  };

  const confirmDelete = (chatId: string) => {
    deleteChat(chatId);
    setShowDeleteConfirm(null);
  };

  const handleDeleteAllHistory = () => {
    if (window.confirm('⚠️ Are you sure you want to delete ALL chat history? This cannot be undone.')) {
      deleteAllHistory();
      setShowActions(true);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - Chat History */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed md:relative w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          flex flex-col z-50 transition-transform duration-300 h-full
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:translate-x-0
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-spark-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Chat History</h3>
                <p className="text-xs text-gray-400">{chatHistories.length} conversations</p>
              </div>
            </div>
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chatHistories.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No chat history yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a conversation with HDM AI</p>
                <button
                  onClick={handleNewChat}
                  className="mt-4 px-4 py-2 bg-spark-500 text-white rounded-lg text-sm hover:bg-spark-600 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              chatHistories.map((chat) => (
                <div key={chat.id} className="group relative">
                  <button
                    onClick={() => handleLoadChat(chat.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-spark-50 dark:bg-spark-950/30 border border-spark-200 dark:border-spark-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate pr-6">{chat.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{chat.preview}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{formatTime(chat.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete button for individual chat */}
                  {showDeleteConfirm === chat.id ? (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                      <button
                        onClick={() => confirmDelete(chat.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button
              onClick={handleClearChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Clear Current Chat
            </button>
            
            {chatHistories.length > 0 && (
              <button
                onClick={handleDeleteAllHistory}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete All History
              </button>
            )}
          </div>
        </div>
      </>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spark-500 to-spark-600 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-semibold text-base">HDM AI</h2>
                  <Sparkles className="w-4 h-4 text-spark-500" />
                  {currentChatId && (
                    <span className="text-xs text-gray-400 ml-2 hidden sm:inline">• Chat active</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">Spark Assistant • Powered by HDM AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spark-500 to-spark-600 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="group relative max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-spark-500 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700 shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed break-words">
                      {msg.content}
                    </p>
                    <span className={`text-[10px] mt-1.5 block ${msg.role === 'user' ? 'text-white/50' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyMessage(msg.content, idx)}
                    className={`absolute -top-2 -right-2 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600 ${
                      msg.role === 'user' ? 'hidden' : ''
                    }`}
                    title="Copy message"
                  >
                    {copied === `msg-${idx}` ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                
                {msg.role === 'user' && (
                  <Avatar name="You" size="xs" className="ml-2 mt-1 shrink-0" />
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spark-500 to-spark-600 flex items-center justify-center shrink-0 mr-2 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-spark-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-spark-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-spark-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={endRef} />
          </div>
        </div>

        {/* Quick Actions */}
        {showActions && messages.length <= 1 && !loading && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs text-gray-400 mb-2 px-1">✨ Try asking me to:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 hover:border-spark-300 hover:text-spark-500 transition-colors shadow-sm"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 transition-all focus-within:ring-2 focus-within:ring-spark-500">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask HDM AI anything..."
                  className="flex-1 py-2.5 bg-transparent text-sm outline-none placeholder-gray-400"
                  disabled={loading}
                />
                {input && (
                  <button
                    onClick={() => setInput('')}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-full bg-spark-500 text-white hover:bg-spark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              HDM AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}