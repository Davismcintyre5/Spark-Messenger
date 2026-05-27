import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Video, Search, MoreVertical, Star, AlertTriangle, Ban, Trash2, X, UserPlus } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  isGroup?: boolean;
  isHdmVerified?: boolean;
  isFavorite?: boolean;
  isBlocked?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onToggleFavorite?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  onClearChat?: () => void;
  onCloseChat?: () => void;
  onViewInfo?: () => void;
  onCall?: (type: 'voice' | 'video') => void;
  onAddContact?: () => void;
}

export default function ChatHeader({
  name, avatar, isOnline, isGroup, isHdmVerified, isFavorite, isBlocked,
  showBack, onBack, onSearch, onToggleFavorite, onReport, onBlock,
  onClearChat, onCloseChat, onViewInfo, onCall, onAddContact,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
      {showBack && <button onClick={onBack} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>}

      <button onClick={onViewInfo} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={avatar} name={name} size="sm" status={isGroup ? undefined : isOnline ? 'online' : 'offline'} />
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{name}</span>
            {isHdmVerified && (
              <svg className="w-4 h-4 text-spark-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            )}
          </div>
          <p className="text-xs text-gray-400">{isGroup ? 'Group' : isOnline ? 'online' : 'offline'}</p>
        </div>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onCall?.('voice')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <Phone className="w-5 h-5" />
        </button>
        <button onClick={() => onCall?.('video')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <Video className="w-5 h-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
              <button onClick={() => { onViewInfo?.(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <Avatar src={avatar} name={name} size="xs" />
                <div className="text-left"><span className="font-medium block">{name}</span><span className="text-xs text-gray-400">{isOnline ? 'Online' : 'Offline'}</span></div>
              </button>

              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />

              {onAddContact && (
                <button onClick={() => { onAddContact(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-spark-500 hover:bg-spark-50 dark:hover:bg-spark-900/20">
                  <UserPlus className="w-4 h-4" /> Add to Contacts
                </button>
              )}

              <button onClick={() => { onSearch?.(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Search className="w-4 h-4" /> Search
              </button>
              <button onClick={() => { onToggleFavorite?.(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Star className="w-4 h-4" /> {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
              <button onClick={() => { onReport?.(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <AlertTriangle className="w-4 h-4" /> Report
              </button>
              <button onClick={() => { onBlock?.(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Ban className="w-4 h-4" /> {isBlocked ? 'Unblock' : 'Block'}
              </button>

              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />

              <button onClick={() => { onClearChat?.(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="w-4 h-4" /> Clear Chat
              </button>
              <button onClick={() => { onCloseChat?.(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <X className="w-4 h-4" /> Close Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}