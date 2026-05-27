import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import env from '../config/env';
import {
  handleConnection,
  handleDisconnection,
} from './handlers/connectionHandler';
import { handleMessage, handleMessageRead, handleMessageDelivered } from './handlers/messageHandler';
import { handleTyping } from './handlers/typingHandler';
import { handlePresenceUpdate } from './handlers/presenceHandler';
import {
  handleCallSignal,
  handleCallAnswer,
  handleCallEnd,
  handleCallDecline,
  handleWebRTCSignal,
} from './handlers/callHandler';
import { handleJoinGroup, handleLeaveGroup } from './handlers/groupHandler';
import { joinUserRooms, leaveUserRooms } from './rooms';

let io: Server | null = null;

export function initializeSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
    pingInterval: env.WS_PING_INTERVAL,
    pingTimeout: env.WS_PING_TIMEOUT,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = verifyAccessToken(token as string);
      socket.userId = decoded.userId;
      socket.phone = decoded.phone;
      socket.displayName = decoded.displayName || decoded.phone;
      socket.isGhostMode = false;
      next();
    } catch (error: any) {
      logger.warn('Socket auth failed', { error: error.message });
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    logger.info(`Socket connected: ${socket.userId} (${socket.id})`);

    await joinUserRooms(socket);
    await handleConnection(socket, io);

    // Messaging
    socket.on('message:send', (data) => handleMessage(socket, io!, data));
    socket.on('message:read', (data) => handleMessageRead(socket, io!, data));
    socket.on('message:delivered', (data) => handleMessageDelivered(socket, io!, data));

    // Typing
    socket.on('typing:start', (data) => handleTyping(socket, io!, data, true));
    socket.on('typing:stop', (data) => handleTyping(socket, io!, data, false));

    // Presence
    socket.on('presence:update', (data) => handlePresenceUpdate(socket, io!, data));

    // Calls
    socket.on('call:signal', (data) => handleCallSignal(socket, io!, data));
    socket.on('call:answer', (data) => handleCallAnswer(socket, io!, data));
    socket.on('call:end', (data) => handleCallEnd(socket, io!, data));
    socket.on('call:decline', (data) => handleCallDecline(socket, io!, data));
    socket.on('call:webrtc-signal', (data) => handleWebRTCSignal(socket, io!, data));

    // Groups
    socket.on('group:join', (data) => handleJoinGroup(socket, io!, data));
    socket.on('group:leave', (data) => handleLeaveGroup(socket, io!, data));

    // Disconnect
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.userId} (${socket.id})`);
      await handleDisconnection(socket, io!);
      await leaveUserRooms(socket);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}