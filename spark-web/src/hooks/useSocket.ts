// src/hooks/useSocket.ts
import { useContext } from 'react';
import { SocketContext } from '@/providers/SocketProvider';
import { Socket } from 'socket.io-client';

export const useSocket = (): Socket | null => {
  const { socket } = useContext(SocketContext);
  return socket;
};