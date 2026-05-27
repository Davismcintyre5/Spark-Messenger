import { useRef, useState, useCallback } from 'react';

interface UseWebRTCOptions {
  isCaller: boolean;
  callType: 'voice' | 'video';
  onRemoteStream?: (stream: MediaStream) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

export function useWebRTC({ isCaller, callType, onRemoteStream, onIceCandidate }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.error('[WebRTC] getUserMedia failed:', error.name, error.message);
      return null;
    }
  }, [callType]);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      if (onRemoteStream && event.streams[0]) onRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
    };

    peerConnection.current = pc;
    return pc;
  }, [onRemoteStream, onIceCandidate]);

  const createOffer = useCallback(async () => {
    if (!peerConnection.current) return null;
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      return offer;
    } catch (err) {
      console.error('[WebRTC] createOffer failed:', err);
      return null;
    }
  }, []);

  const createAnswer = useCallback(async () => {
    if (!peerConnection.current) return null;
    try {
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      return answer;
    } catch (err) {
      console.error('[WebRTC] createAnswer failed:', err);
      return null;
    }
  }, []);

  const setRemoteDescription = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (err) {
      console.error('[WebRTC] setRemoteDescription failed:', err);
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('[WebRTC] addIceCandidate failed:', err);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => { track.enabled = !track.enabled; });
      setIsMuted((prev) => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => { track.enabled = !track.enabled; });
      setIsVideoOff((prev) => !prev);
    }
  }, [localStream]);

  const toggleSpeaker = useCallback(() => setIsSpeakerOn((prev) => !prev), []);

  const hangup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  }, [localStream]);

  return {
    localStream, remoteVideoRef, isMuted, isVideoOff, isSpeakerOn,
    startLocalStream, createPeerConnection, createOffer, createAnswer,
    setRemoteDescription, addIceCandidate, toggleMute, toggleVideo,
    toggleSpeaker, hangup,
  };
}