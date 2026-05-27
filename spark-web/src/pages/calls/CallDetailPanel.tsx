import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Call } from '@/types/models';
import { useAuth } from '@/providers/AuthProvider';
import { timeAgoLong } from '@/utils/format';

interface CallDetailPanelProps {
  call: Call;
  onCallBack: (type: 'voice' | 'video') => void;
  onClose: () => void;
}

export default function CallDetailPanel({ call, onCallBack, onClose }: CallDetailPanelProps) {
  const { user } = useAuth();
  const myId = user?._id?.toString?.() || '';

  const callerId = typeof call.callerId === 'string' ? call.callerId : (call.callerId as any)?._id?.toString?.() || '';
  const isIncoming = callerId !== myId;
  const otherParty = isIncoming ? call.callerId : call.receiverId;
  const name = (otherParty as any)?.displayName || 'Unknown';
  const avatar = (otherParty as any)?.avatar;
  const isMissed = call.status === 'missed' && isIncoming;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 h-full p-6 text-center">
      <Avatar src={avatar} name={name} size="xl" />
      <h2 className="text-xl font-semibold mt-4">{name}</h2>

      <div className="flex items-center gap-2 mt-2 text-gray-400">
        {isMissed ? (
          <PhoneMissed className="w-5 h-5 text-red-500" />
        ) : isIncoming ? (
          <PhoneIncoming className="w-5 h-5 text-green-500" />
        ) : (
          <PhoneOutgoing className="w-5 h-5 text-spark-500" />
        )}
        <span className="text-sm">
          {isIncoming ? 'Incoming' : 'Outgoing'} · {call.callType}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        {timeAgoLong(call.createdAt)}
        {call.duration > 0 && ` · ${Math.floor(call.duration / 60)}m ${call.duration % 60}s`}
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={() => onCallBack('voice')} size="lg">
          <Phone className="w-4 h-4 mr-2" /> Voice Call
        </Button>
        <Button onClick={() => onCallBack('video')} size="lg" variant="secondary">
          <Video className="w-4 h-4 mr-2" /> Video Call
        </Button>
      </div>
    </div>
  );
}