/**
 * Appel vidéo pair-à-pair.
 *
 * La signalisation emprunte le WebSocket déjà en place : le serveur sait
 * router un message vers un utilisateur connecté, c'est tout ce qu'il faut.
 * Le média, lui, ne transite jamais par le serveur.
 *
 * Limite à connaître : STUN seul suffit en local et sur la plupart des
 * réseaux domestiques, mais **deux pairs derrière des NAT symétriques ne
 * pourront pas se joindre sans serveur TURN** (cas fréquent en mobile).
 * `VITE_TURN_URL` est prévu pour ça.
 *
 * `getUserMedia` exige par ailleurs une origine sûre : `localhost` convient,
 * une IP LAN en http simple non.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatSocket, ServerEvent } from '../lib/ws';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'unavailable';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];

if (import.meta.env.VITE_TURN_URL) {
  ICE_SERVERS.push({
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  });
}

interface UseWebRTCResult {
  callState: CallState;
  /** Identifiant du pair de l'appel en cours (appelant ou appelé). */
  peerId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  error: string | null;
  startCall: (peerId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  hangUp: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  /** À brancher sur le flux d'événements du socket. */
  handleSignal: (event: ServerEvent) => void;
}

export function useWebRTC(socket: ChatSocket | null): UseWebRTCResult {
  const [callState, setCallState] = useState<CallState>('idle');
  const [peerId, setPeerId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);
  // Les candidats ICE peuvent arriver avant la description distante.
  const queuedCandidates = useRef<RTCIceCandidateInit[]>([]);

  const cleanup = useCallback(() => {
    connection.current?.close();
    connection.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    pendingOffer.current = null;
    queuedCandidates.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setPeerId(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallState('idle');
  }, []);

  const createConnection = useCallback(
    (remoteId: string) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.signal('call:ice', remoteId, { candidate: event.candidate.toJSON() });
        }
      };

      pc.ontrack = (event) => setRemoteStream(event.streams[0]);

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setCallState('connected');
        if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
          // 'failed' sans TURN = NAT symétrique des deux côtés, cas typique.
          if (pc.connectionState === 'failed') {
            setError('Connexion impossible — un serveur TURN est probablement nécessaire.');
          }
          cleanup();
        }
      };

      connection.current = pc;
      return pc;
    },
    [socket, cleanup],
  );

  const captureMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const startCall = useCallback(
    async (remoteId: string) => {
      setError(null);
      try {
        const stream = await captureMedia();
        const pc = createConnection(remoteId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        setPeerId(remoteId);
        setCallState('calling');
        socket?.signal('call:offer', remoteId, { sdp: offer });
      } catch (cause) {
        setError(
          cause instanceof DOMException && cause.name === 'NotAllowedError'
            ? 'Accès à la caméra refusé.'
            : 'Impossible de démarrer l’appel.',
        );
        cleanup();
      }
    },
    [captureMedia, createConnection, socket, cleanup],
  );

  const acceptCall = useCallback(async () => {
    if (!peerId || !pendingOffer.current) return;
    setError(null);
    try {
      const stream = await captureMedia();
      const pc = createConnection(peerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(pendingOffer.current);
      queuedCandidates.current.forEach((candidate) => void pc.addIceCandidate(candidate));
      queuedCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket?.signal('call:answer', peerId, { sdp: answer });
      pendingOffer.current = null;
    } catch {
      setError('Impossible d’accepter l’appel.');
      cleanup();
    }
  }, [peerId, captureMedia, createConnection, socket, cleanup]);

  const rejectCall = useCallback(() => {
    if (peerId) socket?.signal('call:reject', peerId);
    cleanup();
  }, [peerId, socket, cleanup]);

  const hangUp = useCallback(() => {
    if (peerId) socket?.signal('call:hangup', peerId);
    cleanup();
  }, [peerId, socket, cleanup]);

  const toggleMute = useCallback(() => {
    const audio = localStreamRef.current?.getAudioTracks() ?? [];
    audio.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(audio.length > 0 && !audio[0].enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const video = localStreamRef.current?.getVideoTracks() ?? [];
    video.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCameraOff(video.length > 0 && !video[0].enabled);
  }, []);

  const handleSignal = useCallback(
    (event: ServerEvent) => {
      switch (event.type) {
        case 'call:offer':
          // Un appel entrant pendant un appel en cours est refusé d'office.
          if (callState !== 'idle') {
            socket?.signal('call:reject', event.data.from);
            return;
          }
          pendingOffer.current = event.data.sdp;
          setPeerId(event.data.from);
          setCallState('ringing');
          break;

        case 'call:answer':
          void connection.current?.setRemoteDescription(event.data.sdp).then(() => {
            queuedCandidates.current.forEach(
              (candidate) => void connection.current?.addIceCandidate(candidate),
            );
            queuedCandidates.current = [];
          });
          break;

        case 'call:ice':
          if (connection.current?.remoteDescription) {
            void connection.current.addIceCandidate(event.data.candidate);
          } else {
            queuedCandidates.current.push(event.data.candidate);
          }
          break;

        case 'call:reject':
          setError('Appel refusé.');
          cleanup();
          break;

        case 'call:hangup':
          cleanup();
          break;

        case 'call:unavailable':
          setCallState('unavailable');
          setError('Votre correspondant n’est pas connecté.');
          break;

        default:
          break;
      }
    },
    [callState, socket, cleanup],
  );

  // Filet de sécurité : libérer caméra et micro si le composant disparaît.
  useEffect(() => cleanup, [cleanup]);

  return {
    callState,
    peerId,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    error,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
    toggleMute,
    toggleCamera,
    handleSignal,
  };
}
