import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Avatar, Button, Icon } from '../atoms';
import type { CallState } from '../../hooks/useWebRTC';

export interface CallOverlayProps {
  callState: CallState;
  peerName: string;
  peerAvatar?: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  error?: string | null;
  onAccept: () => void;
  onReject: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.neutral.overlay};
`;

const RemoteVideo = styled.video`
  width: 100%;
  max-width: 900px;
  flex: 1;
  object-fit: cover;
  background-color: #111;
  border: 4px solid ${({ theme }) => theme.colors.neutral.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const LocalVideo = styled.video`
  position: absolute;
  right: ${({ theme }) => theme.spacing.lg};
  bottom: 120px;
  width: 160px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  background-color: #222;
  border: 3px solid ${({ theme }) => theme.colors.primary.yellow};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;
`;

const Status = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.neutral.onAccent};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  text-align: center;
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.warning};
  text-align: center;
  max-width: 420px;
`;

const STATUS_LABEL: Record<CallState, string> = {
  idle: '',
  calling: 'Appel en cours…',
  ringing: 'Appel entrant',
  connected: 'En communication',
  unavailable: 'Indisponible',
};

/** Branche un MediaStream sur un <video> sans passer par le DOM à la main. */
function useStream(stream: MediaStream | null) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return ref;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({
  callState,
  peerName,
  peerAvatar,
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  error,
  onAccept,
  onReject,
  onHangUp,
  onToggleMute,
  onToggleCamera,
}) => {
  const remoteRef = useStream(remoteStream);
  const localRef = useStream(localStream);

  if (callState === 'idle') return null;

  const isIncoming = callState === 'ringing';

  return (
    <Backdrop role="dialog" aria-modal="true" aria-label={`Appel avec ${peerName}`}>
      {remoteStream ? (
        <RemoteVideo ref={remoteRef} autoPlay playsInline />
      ) : (
        <>
          <Avatar
            src={peerAvatar}
            alt={peerName}
            size="xlarge"
            initials={peerName.slice(0, 2).toUpperCase()}
          />
          <Status>
            {peerName} — {STATUS_LABEL[callState]}
          </Status>
        </>
      )}

      {localStream && <LocalVideo ref={localRef} autoPlay playsInline muted />}

      {error && <ErrorText>{error}</ErrorText>}

      <Controls>
        {isIncoming ? (
          <>
            <Button variant="primary" onClick={onAccept} icon={<Icon name="video" size={20} />}>
              Accepter
            </Button>
            <Button variant="secondary" onClick={onReject} icon={<Icon name="x" size={20} />}>
              Refuser
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onToggleMute} icon={<Icon name="phone" size={20} />}>
              {isMuted ? 'Réactiver le micro' : 'Couper le micro'}
            </Button>
            <Button
              variant="outline"
              onClick={onToggleCamera}
              icon={<Icon name="video" size={20} />}
            >
              {isCameraOff ? 'Activer la caméra' : 'Couper la caméra'}
            </Button>
            <Button variant="secondary" onClick={onHangUp} icon={<Icon name="x" size={20} />}>
              Raccrocher
            </Button>
          </>
        )}
      </Controls>
    </Backdrop>
  );
};
