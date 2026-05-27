import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export function usePresence(userId: string | undefined) {
  const { on } = useSocket();
  const [status, setStatus] = useState<'online' | 'offline' | 'away'>('offline');
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const cleanup = on('presence:changed', (data) => {
      if (data.userId === userId) {
        setStatus(data.status);
        if (data.lastSeen) setLastSeen(data.lastSeen);
      }
    });

    return cleanup;
  }, [userId, on]);

  return { status, lastSeen, isOnline: status === 'online' };
}