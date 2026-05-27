import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useWebRTC } from '@/hooks/useWebRTC';

interface CallScreenProps {
  callType: 'voice' | 'video';
  isCaller: boolean;
  remoteName: string;
  remoteAvatar?: string;
  remoteId: string;
  onEndCall: () => void;
  socket: any;
  callId: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CallScreen({
  callType, isCaller, remoteName, remoteAvatar, remoteId, onEndCall, socket, callId,
}: CallScreenProps) {
  const handleIceCandidate = (candidate: RTCIceCandidate) => {
    socket?.emit('call:webrtc-signal', { targetId: remoteId, callId, signal: { type: 'candidate', candidate } });
  };

  const {
    localStream, remoteVideoRef, isMuted, isVideoOff, isSpeakerOn,
    startLocalStream, createPeerConnection, createOffer, createAnswer,
    setRemoteDescription, addIceCandidate, toggleMute, toggleVideo,
    toggleSpeaker, hangup,
  } = useWebRTC({ isCaller, callType, onIceCandidate: handleIceCandidate });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const hasStarted = useRef(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [duration, setDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected'>(
    isCaller ? 'ringing' : 'connecting',
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Process a WebRTC signal (reused by both listener and buffered processor)
  const processSignal = useCallback(async (data: any) => {
    if (data.callId !== callId) return;
    try {
      if (data.signal?.type === 'offer') {
        setCallStatus('connecting');
        const stream = await startLocalStream();
        if (stream && localVideoRef.current) localVideoRef.current.srcObject = stream;
        const pc = createPeerConnection(stream!);
        pcRef.current = pc;
        pc.onconnectionstatechange = () => { if (pc.connectionState === 'connected') setCallStatus('connected'); };
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus('connected');
          }
        };
        await setRemoteDescription(data.signal.sdp);
        const answer = await createAnswer();
        if (answer) {
          socket?.emit('call:webrtc-signal', {
            targetId: data.fromId,
            callId,
            signal: { type: 'answer', sdp: answer },
          });
        }
      } else if (data.signal?.type === 'answer') {
        await setRemoteDescription(data.signal.sdp);
      } else if (data.signal?.type === 'candidate') {
        await addIceCandidate(data.signal.candidate);
      }
    } catch (err) {
      console.error('[CallScreen] Signal error:', err);
    }
  }, [callId, startLocalStream, createPeerConnection, setRemoteDescription, createAnswer, addIceCandidate, socket, remoteVideoRef]);

  // Listen for call answered (caller only)
  useEffect(() => {
    if (!socket) return;
    const onAnswered = (data: any) => {
      if (data.callId === callId) setCallStatus('connecting');
    };
    socket.on('call:answered', onAnswered);
    return () => socket.off('call:answered', onAnswered);
  }, [socket, callId]);

  // Timer
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  // Start WebRTC
  useEffect(() => {
    if (hasStarted.current || !socket) return;
    hasStarted.current = true;

    (async () => {
      const stream = await startLocalStream();
      if (!stream) return;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeerConnection(stream);
      pcRef.current = pc;
      pc.onconnectionstatechange = () => { if (pc.connectionState === 'connected') setCallStatus('connected'); };
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus('connected');
        }
      };

      if (isCaller) {
        const offer = await createOffer();
        if (offer) {
          socket.emit('call:webrtc-signal', {
            targetId: remoteId,
            callId,
            signal: { type: 'offer', sdp: offer },
          });
        }
      }

      // Process any buffered WebRTC signals (from page reload)
      const buffered = sessionStorage.getItem('pendingWebRTCSignals');
      if (buffered) {
        try {
          const signals = JSON.parse(buffered);
          for (const data of signals) {
            await processSignal(data);
          }
        } catch {}
        sessionStorage.removeItem('pendingWebRTCSignals');
      }
    })();

    return () => {
      hangup();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [socket]);

  // Listen for live WebRTC signals
  useEffect(() => {
    if (!socket) return;
    const onSignal = (data: any) => processSignal(data);
    socket.on('call:webrtc-signal', onSignal);
    return () => socket.off('call:webrtc-signal', onSignal);
  }, [socket, processSignal]);

  const handleEnd = () => {
    hangup();
    if (timerRef.current) clearInterval(timerRef.current);
    socket?.emit('call:end', { callId, duration });
    onEndCall();
  };

  const statusText = {
    ringing: 'Ringing...',
    connecting: 'Connecting...',
    connected: formatDuration(duration),
  }[callStatus];

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {callType === 'video' ? (
        <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
          <Avatar src={remoteAvatar} name={remoteName} size="xl" />
          <h2 className="text-xl font-semibold">{remoteName}</h2>
          <p className={`text-lg font-mono ${callStatus === 'connected' ? 'text-white' : 'text-gray-400'}`}>
            {statusText}
          </p>
        </div>
      )}

      {callType === 'video' && (
        <div className="absolute top-6 left-0 right-0 text-center">
          <span className="text-white text-sm font-mono bg-black/40 px-3 py-1 rounded-full">{statusText}</span>
        </div>
      )}

      {callType === 'video' && localStream && (
        <video ref={localVideoRef} className="absolute top-4 right-4 w-32 h-48 rounded-xl object-cover border-2 border-white/30 shadow-lg" autoPlay playsInline muted />
      )}

      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4">
        <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        {callType === 'video' && (
          <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}
        <button onClick={toggleSpeaker} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isSpeakerOn ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
          {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <button onClick={handleEnd} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors ml-2">
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}