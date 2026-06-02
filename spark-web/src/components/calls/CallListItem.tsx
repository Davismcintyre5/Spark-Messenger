import React from 'react';
import { Call } from '@/types/models';
import Avatar from '@/components/ui/Avatar';
import { Phone, Video, PhoneMissed } from 'lucide-react';
import { timeAgo } from '@/utils/format';
import { useAuth } from '@/providers/AuthProvider';

interface CallListItemProps {
  call: Call;
}

export default function CallListItem({ call }: CallListItemProps) {
  const { user } = useAuth();
  const isIncoming = call.receiverId === user?._id || (call.receiverId as any)?._id === user?._id;
  const otherParty = isIncoming ? call.callerId : call.receiverId;
  const name = (otherParty as any)?.displayName || 'Unknown';
  const avatar = (otherParty as any)?.avatar;
  const isMissed = call.status === 'missed';

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <Avatar src={avatar} name={name} size="md" />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block">{name}</span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          {isIncoming ? 'Incoming' : 'Outgoing'} · {call.callType} · {timeAgo(call.createdAt)}
        </span>
      </div>
      <div>
        {call.callType === 'video' ? (
          <Video className={`w-4 h-4 ${isMissed ? 'text-red-500' : 'text-spark-500'}`} />
        ) : (
          <Phone className={`w-4 h-4 ${isMissed ? 'text-red-500' : 'text-spark-500'}`} />
        )}
      </div>
    </div>
  );
}