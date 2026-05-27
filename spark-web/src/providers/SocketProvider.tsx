import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
const ACCESS_TOKEN_KEY = 'spark_access_token';

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;
    if (socketRef.current?.connected) return;

    const newSocket = io(WS_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log('[Socket] Reconnect attempt:', attempt);
    });

    newSocket.on('call:incoming', (data: any) => {
      sessionStorage.setItem('pendingCall', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('spark:incoming-call', { detail: data }));
    });

    newSocket.on('call:ended', () => {
      sessionStorage.removeItem('pendingCall');
      window.dispatchEvent(new CustomEvent('spark:call-ended'));
    });

    newSocket.on('call:declined', () => {
      sessionStorage.removeItem('pendingCall');
      window.dispatchEvent(new CustomEvent('spark:call-declined'));
    });

    newSocket.on('call:webrtc-signal', (data: any) => {
      const existing = sessionStorage.getItem('pendingWebRTCSignals');
      const signals = existing ? JSON.parse(existing) : [];
      signals.push(data);
      sessionStorage.setItem('pendingWebRTCSignals', JSON.stringify(signals));
      window.dispatchEvent(new CustomEvent('spark:webrtc-signal', { detail: data }));
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    (window as any).__spark_socket = newSocket;

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && !socketRef.current) {
        const newSocket = io(WS_URL, {
          auth: { token },
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
        });
        newSocket.on('connect', () => console.log('[Socket] Connected:', newSocket.id));
        newSocket.on('connect_error', (error) => console.error('[Socket] Connection error:', error.message));
        newSocket.on('call:incoming', (data: any) => {
          sessionStorage.setItem('pendingCall', JSON.stringify(data));
          window.dispatchEvent(new CustomEvent('spark:incoming-call', { detail: data }));
        });
        newSocket.on('call:ended', () => {
          sessionStorage.removeItem('pendingCall');
          window.dispatchEvent(new CustomEvent('spark:call-ended'));
        });
        newSocket.on('call:declined', () => {
          sessionStorage.removeItem('pendingCall');
          window.dispatchEvent(new CustomEvent('spark:call-declined'));
        });
        newSocket.on('call:webrtc-signal', (data: any) => {
          const existing = sessionStorage.getItem('pendingWebRTCSignals');
          const signals = existing ? JSON.parse(existing) : [];
          signals.push(data);
          sessionStorage.setItem('pendingWebRTCSignals', JSON.stringify(signals));
          window.dispatchEvent(new CustomEvent('spark:webrtc-signal', { detail: data }));
        });
        socketRef.current = newSocket;
        setSocket(newSocket);
        (window as any).__spark_socket = newSocket;
      } else if (!token && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
    checkToken();
    window.addEventListener('storage', (e) => { if (e.key === ACCESS_TOKEN_KEY) checkToken(); });
    return () => window.removeEventListener('storage', () => {});
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}

export function useSocket(): Socket | null {
  return useContext(SocketContext).socket;
}