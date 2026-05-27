import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Video, Search, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { useCallHistory } from '@/hooks/useCalls';
import { useSocket as useSocketContext } from '@/providers/SocketProvider';
import { useAuth } from '@/providers/AuthProvider';
import { callService } from '@/services/callService';
import { useUIStore } from '@/stores/uiStore';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { timeAgo } from '@/utils/format';
import { Call } from '@/types/models';

export default function CallsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocketContext();
  const addToast = useUIStore((s) => s.addToast);
  const { data, isLoading } = useCallHistory();
  const [search, setSearch] = useState('');

  const myId = user?._id?.toString?.() || '';
  const calls: Call[] = data?.calls || [];

  const getOtherParty = (call: Call) => {
    const callerId = typeof call.callerId === 'string' ? call.callerId : (call.callerId as any)?._id?.toString?.() || '';
    if (callerId === myId) return call.receiverId;
    return call.callerId;
  };

  const filtered = search
    ? calls.filter((c) => {
        const other = getOtherParty(c) as any;
        return other?.displayName?.toLowerCase().includes(search.toLowerCase()) || false;
      })
    : calls;

  const handleStartCall = async (receiverId: string, callType: 'voice' | 'video') => {
    if (!socket) return;
    try {
      const result = await callService.initiate(receiverId, callType);
      socket.emit('call:signal', { receiverId, chatId: result.chatId, callType, signal: { callId: result.call._id } });
      addToast({ type: 'success', message: `${callType} call started` });
      navigate(`/chats/${result.chatId}`);
    } catch {
      addToast({ type: 'error', message: 'Failed to start call' });
    }
  };

  const handleSelectCall = (call: Call) => {
    navigate(`/calls/${call._id}`, { state: { call } });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-3">Calls</h2>
        <Input
          placeholder="Search calls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : filtered.length > 0 ? (
          filtered.map((call) => {
            const other = getOtherParty(call) as any;
            const callerId = typeof call.callerId === 'string' ? call.callerId : (call.callerId as any)?._id?.toString?.() || '';
            const isIncoming = callerId !== myId;
            const isMissed = call.status === 'missed' && isIncoming;

            return (
              <button
                key={call._id}
                onClick={() => handleSelectCall(call)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 text-left"
              >
                <Avatar src={other?.avatar} name={other?.displayName || 'Unknown'} size="md" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block">{other?.displayName || 'Unknown'}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    {isMissed ? (
                      <PhoneMissed className="w-3 h-3 text-red-500" />
                    ) : isIncoming ? (
                      <PhoneIncoming className="w-3 h-3 text-green-500" />
                    ) : (
                      <PhoneOutgoing className="w-3 h-3 text-spark-500" />
                    )}
                    {isIncoming ? 'Incoming' : 'Outgoing'} · {call.callType} · {timeAgo(call.createdAt)}
                    {call.duration > 0 && ` · ${Math.floor(call.duration / 60)}m ${call.duration % 60}s`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartCall(other?._id, 'voice'); }}
                    className="p-2 rounded-full hover:bg-spark-50 dark:hover:bg-spark-900/30 text-spark-500"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartCall(other?._id, 'video'); }}
                    className="p-2 rounded-full hover:bg-spark-50 dark:hover:bg-spark-900/30 text-spark-500"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </button>
            );
          })
        ) : (
          <EmptyState
            title="No calls yet"
            description="Your call history will appear here"
          />
        )}
      </div>
    </div>
  );
}