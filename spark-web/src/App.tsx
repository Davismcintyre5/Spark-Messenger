import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import ToastContainer from '@/components/ui/Toast';
import SplashScreen from '@/components/ui/SplashScreen';
import IncomingCallModal from '@/components/calls/IncomingCallModal';

function GlobalCallListener() {
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    const onIncoming = (e: CustomEvent) => setIncomingCall(e.detail);
    const onEnd = () => setIncomingCall(null);
    const onDecline = () => setIncomingCall(null);

    window.addEventListener('spark:incoming-call', onIncoming as EventListener);
    window.addEventListener('spark:call-ended', onEnd as EventListener);
    window.addEventListener('spark:call-declined', onDecline as EventListener);

    const pending = sessionStorage.getItem('pendingCall');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        if (data.callId) setIncomingCall(data);
      } catch {}
    }

    return () => {
      window.removeEventListener('spark:incoming-call', onIncoming as EventListener);
      window.removeEventListener('spark:call-ended', onEnd as EventListener);
      window.removeEventListener('spark:call-declined', onDecline as EventListener);
    };
  }, []);

  const handleAccept = () => {
    if (!incomingCall) return;
    const socket = (window as any).__spark_socket;
    if (socket) socket.emit('call:answer', { callId: incomingCall.callId, signal: {} });
    sessionStorage.setItem('activeCall', JSON.stringify({
      callId: incomingCall.callId, callType: incomingCall.callType,
      isCaller: false, chatId: incomingCall.chatId,
    }));
    sessionStorage.removeItem('pendingCall');
    window.location.href = `/chats/${incomingCall.chatId}`;
    setIncomingCall(null);
  };

  const handleDecline = () => {
    if (!incomingCall) return;
    const socket = (window as any).__spark_socket;
    if (socket) socket.emit('call:decline', { callId: incomingCall.callId });
    sessionStorage.removeItem('pendingCall');
    setIncomingCall(null);
  };

  return (
    <IncomingCallModal
      isOpen={!!incomingCall}
      callerName={incomingCall?.callerName || ''}
      callerAvatar={incomingCall?.callerAvatar}
      callType={incomingCall?.callType || 'voice'}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <>
      <RouterProvider router={router} />
      <GlobalCallListener />
      <ToastContainer />
    </>
  );
}