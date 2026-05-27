import React from 'react';
import { StatusFeed } from '@/types/models';
import Avatar from '@/components/ui/Avatar';

interface StatusCardProps {
  feed: StatusFeed;
  onClick: () => void;
}

export default function StatusCard({ feed, onClick }: StatusCardProps) {
  const latest = feed.statuses[0];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
    >
      <div className="relative">
        <Avatar
          src={feed.user.avatar}
          name={feed.user.displayName}
          size="md"
          status={feed.user.status}
        />
        <div className="absolute inset-0 rounded-full border-2 border-spark-500 scale-[1.15]" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block">{feed.user.displayName}</span>
        <span className="text-xs text-gray-400">
          {latest
            ? new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
      </div>
      <span className="text-xs text-gray-400">{feed.statuses.length} update{feed.statuses.length > 1 ? 's' : ''}</span>
    </button>
  );
}