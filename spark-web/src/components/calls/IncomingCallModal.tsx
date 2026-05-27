import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallModal({
  isOpen, callerName, callerAvatar, callType, onAccept, onDecline,
}: IncomingCallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-6 text-white">
      <Avatar src={callerAvatar} name={callerName} size="xl" />
      <div className="text-center">
        <h2 className="text-xl font-semibold">{callerName}</h2>
        <p className="text-gray-400 mt-1 flex items-center justify-center gap-1">
          {callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          Incoming {callType} call...
        </p>
      </div>
      <div className="flex gap-6">
        <button
          onClick={onDecline}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500 hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="w-6 h-6" />
          <span className="text-xs font-medium">Decline</span>
        </button>
        <button
          onClick={onAccept}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-500 hover:bg-green-600 transition-colors"
        >
          <Phone className="w-6 h-6" />
          <span className="text-xs font-medium">Accept</span>
        </button>
      </div>
    </div>
  );
}