import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { Socket } from 'socket.io-client';

export function usePresence(userId: string | undefined) {
  const socket = useSocket();
  const [status, setStatus] = useState<'online' | 'offline' | 'away'>('offline');
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !socket) return;

    const onPresenceChanged = (data: any) => {
      if (data.userId === userId) {
        setStatus(data.status);
        if (data.lastSeen) setLastSeen(data.lastSeen);
      }
    };

    socket.on('presence:changed', onPresenceChanged);

    return () => {
      socket.off('presence:changed', onPresenceChanged);
    };
  }, [userId, socket]);

  return { status, lastSeen, isOnline: status === 'online' };
}