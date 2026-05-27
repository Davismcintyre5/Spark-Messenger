import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Check, Users, CheckCheck,
  MoreVertical, MessageCircle, Star, Phone,
} from 'lucide-react';
import { useChatList, useTotalUnreadCount } from '@/hooks/useChat';
import { api } from '@/services/api';
import { chatService } from '@/services/chatService';
import { useUIStore } from '@/stores/uiStore';
import ChatListItem from '@/components/chat/ChatListItem';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

type FilterType = 'all' | 'unread' | 'favorites' | 'groups';

const filters: Array<{ type: FilterType; label: string; icon: React.ReactNode }> = [
  { type: 'all', label: 'All', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { type: 'unread', label: 'Unread', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { type: 'favorites', label: 'Favorites', icon: <Star className="w-3.5 h-3.5" /> },
  { type: 'groups', label: 'Groups', icon: <Users className="w-3.5 h-3.5" /> },
];

export default function ChatsPage() {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const { data, isLoading, refetch } = useChatList();
  const { data: totalUnread = 0 } = useTotalUnreadCount();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allChats = data?.chats || [];
  const pinnedChats = data?.pinnedChats || [];

  const filteredChats = allChats.filter((chat) => {
    const matchesSearch = !search ||
      (chat.isGroup ? chat.groupName : chat.participants?.[0]?.displayName || '')
        .toLowerCase().includes(search.toLowerCase());
    
    if (activeFilter === 'unread') {
      return matchesSearch && (chat as any).unreadCount > 0;
    }
    if (activeFilter === 'groups') {
      return matchesSearch && chat.isGroup;
    }
    if (activeFilter === 'favorites') {
      return matchesSearch && (chat as any).isFavorite;
    }
    return matchesSearch;
  });

  const toggleSelect = (chatId: string) => {
    const next = new Set(selectedChats);
    if (next.has(chatId)) next.delete(chatId); else next.add(chatId);
    setSelectedChats(next);
    if (next.size === 0) setSelectMode(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await chatService.markAllAsRead();
      addToast({ type: 'success', message: 'All messages marked as read' });
      refetch();
    } catch {
      addToast({ type: 'error', message: 'Failed to mark as read' });
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedChats.size === 0) return;
    try {
      await chatService.bulkAction(Array.from(selectedChats), 'mark_read');
      addToast({ type: 'success', message: `${selectedChats.size} chats marked as read` });
      setSelectMode(false);
      setSelectedChats(new Set());
      refetch();
    } catch {
      addToast({ type: 'error', message: 'Failed' });
    }
  };

  const handleMessageNumber = async () => {
    if (!newPhone.trim()) return;
    try {
      const response = await api.post('/chats/direct', { participantId: newPhone });
      navigate(`/chats/${response.data.data._id}`);
      setShowNewChat(false);
      setNewPhone('');
    } catch {
      addToast({ type: 'error', message: 'User not found' });
    }
  };

  const menuItems = [
    { icon: Users, label: 'New Group', onClick: () => { navigate('/groups/create'); setMenuOpen(false); } },
    { icon: Phone, label: 'Message a Number', onClick: () => { setShowNewChat(true); setMenuOpen(false); } },
    { icon: Check, label: 'Select Chats', onClick: () => { setSelectMode(true); setMenuOpen(false); } },
    { icon: CheckCheck, label: 'Mark All as Read', onClick: () => { handleMarkAllAsRead(); setMenuOpen(false); } },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Chats</h2>
            {totalUnread > 0 && (
              <span className="bg-spark-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/contacts')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
                  {menuItems.map(({ icon: Icon, label, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-800/50 overflow-x-auto">
        {filters.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === type
                ? 'bg-spark-100 dark:bg-spark-900 text-spark-600 dark:text-spark-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {pinnedChats.length > 0 && activeFilter === 'all' && (
          <div>
            <p className="px-4 py-2 text-xs font-medium text-spark-500 uppercase tracking-wider">Pinned</p>
            {pinnedChats.map((chat) => (
              <div key={chat._id} className="flex items-center">
                {selectMode && (
                  <button
                    onClick={() => toggleSelect(chat._id)}
                    className={`w-8 h-8 ml-2 rounded-full flex items-center justify-center shrink-0 ${
                      selectedChats.has(chat._id) ? 'bg-spark-500 text-white' : 'border-2 border-gray-300'
                    }`}
                  >
                    {selectedChats.has(chat._id) && <Check className="w-4 h-4" />}
                  </button>
                )}
                <div className="flex-1" onClick={() => selectMode ? toggleSelect(chat._id) : navigate(`/chats/${chat._id}`)}>
                  <ChatListItem chat={chat} isPinned />
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div key={chat._id} className="flex items-center">
              {selectMode && (
                <button
                  onClick={() => toggleSelect(chat._id)}
                  className={`w-8 h-8 ml-2 rounded-full flex items-center justify-center shrink-0 ${
                    selectedChats.has(chat._id) ? 'bg-spark-500 text-white' : 'border-2 border-gray-300'
                  }`}
                >
                  {selectedChats.has(chat._id) && <Check className="w-4 h-4" />}
                </button>
              )}
              <div className="flex-1" onClick={() => selectMode ? toggleSelect(chat._id) : navigate(`/chats/${chat._id}`)}>
                <ChatListItem chat={chat} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title={search ? "No chats match your search" : activeFilter === 'unread' ? "No unread messages" : "No chats yet"}
            description={search ? "Try a different search term" : activeFilter === 'unread' ? "All caught up!" : "Start a new conversation"}
            action={
              <button onClick={() => navigate('/contacts')} className="text-spark-500 font-medium text-sm">
                Go to Contacts
              </button>
            }
          />
        )}

        {selectMode && (
          <div className="sticky bottom-0 h-16 bg-spark-500 text-white flex items-center justify-between px-4">
            <span className="font-medium text-sm">{selectedChats.size} selected</span>
            <div className="flex gap-2">
              <button onClick={handleBulkMarkRead} className="px-3 py-1.5 rounded-lg bg-white/20 text-xs">Mark Read</button>
              <button onClick={() => { setSelectMode(false); setSelectedChats(new Set()); }} className="px-3 py-1.5 rounded-lg bg-white/20 text-xs">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Message a Number Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Message a Number</h3>
            <Input
              label="Phone Number"
              placeholder="+254 712 345 678"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowNewChat(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
              <button onClick={handleMessageNumber} className="px-4 py-2 bg-spark-500 text-white text-sm rounded-lg">Start Chat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}