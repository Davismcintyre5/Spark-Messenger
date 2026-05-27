import React from 'react';
import { Group } from '@/types/models';
import Avatar from '@/components/ui/Avatar';
import { Users } from 'lucide-react';

interface GroupListItemProps {
  group: Group;
  onClick: () => void;
}

export default function GroupListItem({ group, onClick }: GroupListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
    >
      <Avatar src={group.icon} name={group.name} size="md" />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block">{group.name}</span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {group.memberCount} members
        </span>
      </div>
    </button>
  );
}