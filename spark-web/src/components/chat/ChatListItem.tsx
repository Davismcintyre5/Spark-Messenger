import React from 'react';
import { Chat } from '@/types/models';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/providers/AuthProvider';
import { timeAgo, truncate } from '@/utils/format';
import { CheckCheck, Pin } from 'lucide-react';

interface ChatListItemProps {
  chat: Chat;
  onClick?: () => void;
  isPinned?: boolean;
}

export default function ChatListItem({ chat, onClick, isPinned }: ChatListItemProps) {
  const { user } = useAuth();
  const myId = user?._id?.toString?.() || '';

  const otherParticipant = chat.isGroup
    ? null
    : chat.participants?.find((p: any) => {
        const pid = typeof p === 'string' ? p : p._id?.toString?.() || p._id;
        return pid !== myId;
      });

  const name = chat.isGroup
    ? chat.groupName || 'Group'
    : otherParticipant?.displayName || otherParticipant?.phone || 'Unknown';

  const avatar = chat.isGroup ? chat.groupIcon : otherParticipant?.avatar;
  const isOnline = chat.isGroup ? false : otherParticipant?.status === 'online';
  const lastMsg = chat.lastMessage;
  const unreadCount = (chat as any).unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
    >
      <Avatar src={avatar} name={name} status={isOnline ? 'online' : 'offline'} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{name}</span>
          {isPinned && <Pin className="w-3 h-3 text-spark-500 shrink-0" />}
        </div>
        {lastMsg && (
          <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            {truncate(lastMsg.content, 40)}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {lastMsg && <span className="text-[10px] text-gray-400">{timeAgo(lastMsg.createdAt)}</span>}
        {unreadCount > 0 ? (
          <span className="min-w-[20px] h-5 rounded-full bg-spark-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : lastMsg && lastMsg.senderId?.toString?.() === myId ? (
          <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
        ) : null}
      </div>
    </button>
  );
}