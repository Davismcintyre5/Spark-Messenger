import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff } from 'lucide-react';

interface CallTimerProps {
  onEnd: (duration: number) => void;
  isCaller: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CallTimer({ onEnd, isCaller }: CallTimerProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'calling' | 'connecting' | 'connected' | 'unanswered'>(
    isCaller ? 'calling' : 'connecting',
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const unansweredRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-end if unanswered after 30 seconds
  useEffect(() => {
    if (status === 'calling' || status === 'connecting') {
      unansweredRef.current = setTimeout(() => {
        setStatus('unanswered');
        if (timerRef.current) clearInterval(timerRef.current);
        onEnd(0);
      }, 30000); // 30 seconds timeout
    }

    return () => {
      if (unansweredRef.current) clearTimeout(unansweredRef.current);
    };
  }, [status, onEnd]);

  // Simulate connection after 2 seconds for receiver
  useEffect(() => {
    if (status === 'connecting') {
      const connectTimeout = setTimeout(() => setStatus('connected'), 2000);
      return () => clearTimeout(connectTimeout);
    }
  }, [status]);

  // Caller: move from calling to connecting after 1 second
  useEffect(() => {
    if (status === 'calling') {
      const ringTimeout = setTimeout(() => setStatus('connecting'), 1000);
      return () => clearTimeout(ringTimeout);
    }
  }, [status]);

  // Timer when connected
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (unansweredRef.current) clearTimeout(unansweredRef.current);
    onEnd(duration);
  };

  const statusText: Record<string, string> = {
    calling: 'Calling...',
    connecting: 'Connecting...',
    connected: formatDuration(duration),
    unanswered: 'Call ended — No answer',
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className={`text-lg font-mono ${status === 'unanswered' ? 'text-red-400' : status === 'connected' ? 'text-white' : 'text-gray-400'}`}>
        {statusText[status]}
      </p>
      {status !== 'unanswered' && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={handleEnd}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      )}
      {status === 'unanswered' && (
        <button
          onClick={handleEnd}
          className="px-6 py-2 rounded-full bg-white/20 text-white text-sm hover:bg-white/30 transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
}