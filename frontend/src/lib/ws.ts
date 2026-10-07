/**
 * Connexion WebSocket au backend MultiChat.
 *
 * Contrat vérifié côté serveur :
 *  - l'URL est `/api/ws?token=<JWT>` — le jeton passe en query, pas en en-tête
 *    (des docstrings annonçaient `/ws`, ce qui était faux) ;
 *  - le serveur diffuse `message` à TOUS les participants, émetteur compris :
 *    l'appelant doit dédupliquer sur l'identifiant ;
 *  - les « salons » sont en mémoire côté serveur et peuplés par les appels REST
 *    `conversations` / `send`. Après une reconnexion, il faut rejouer un
 *    `GET /conversations` sans quoi plus rien n'arrive.
 */

import { API_BASE } from './api';

export type ServerEvent =
  | { type: 'message'; data: Record<string, unknown> }
  | { type: 'typing'; data: { user_id: string; conversation_id: string; is_typing: boolean } }
  | { type: 'read'; data: { user_id: string; message_id: string; conversation_id: string } }
  | { type: 'user_status'; data: { user_id: string; is_online: boolean } }
  | { type: 'pong' }
  // Signalisation WebRTC — relayée telle quelle par le serveur, jamais stockée.
  | { type: 'call:offer'; data: { from: string; sdp: RTCSessionDescriptionInit } }
  | { type: 'call:answer'; data: { from: string; sdp: RTCSessionDescriptionInit } }
  | { type: 'call:ice'; data: { from: string; candidate: RTCIceCandidateInit } }
  | { type: 'call:hangup'; data: { from: string } }
  | { type: 'call:reject'; data: { from: string } }
  | { type: 'call:unavailable'; data: { user_id: string } }
  | { type: 'error'; message: string };

export interface ChatSocketHandlers {
  onEvent: (event: ServerEvent) => void;
  /** Appelé à chaque (re)connexion établie — c'est là qu'il faut resynchroniser. */
  onOpen?: () => void;
  onClose?: (code: number) => void;
}

const HEARTBEAT_MS = 25_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export function wsUrl(token: string): string {
  const base = import.meta.env.VITE_WS_URL ?? API_BASE.replace(/^http/, 'ws');
  return `${base.replace(/\/$/, '')}/api/ws?token=${encodeURIComponent(token)}`;
}

export class ChatSocket {
  private socket: WebSocket | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private closedByUs = false;

  constructor(
    private readonly token: string,
    private readonly handlers: ChatSocketHandlers,
  ) {}

  connect(): void {
    this.closedByUs = false;
    this.socket = new WebSocket(wsUrl(this.token));

    this.socket.onopen = () => {
      this.attempts = 0;
      this.heartbeat = setInterval(() => this.send({ type: 'ping' }), HEARTBEAT_MS);
      this.handlers.onOpen?.();
    };

    this.socket.onmessage = (raw) => {
      try {
        this.handlers.onEvent(JSON.parse(raw.data) as ServerEvent);
      } catch {
        /* trame non JSON : ignorée plutôt que de casser la session */
      }
    };

    this.socket.onclose = (event) => {
      this.stopHeartbeat();
      this.handlers.onClose?.(event.code);
      // 1008 = jeton refusé : se reconnecter en boucle ne servirait à rien.
      if (!this.closedByUs && event.code !== 1008) this.scheduleReconnect();
    };

    this.socket.onerror = () => this.socket?.close();
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** this.attempts, MAX_RECONNECT_DELAY_MS);
    this.attempts += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  send(payload: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  setTyping(conversationId: string, isTyping: boolean): void {
    this.send({ type: 'typing', conversation_id: conversationId, is_typing: isTyping });
  }

  markRead(messageId: string, conversationId: string): void {
    this.send({ type: 'read', message_id: messageId, conversation_id: conversationId });
  }

  /** Envoie un événement de signalisation d'appel au pair désigné. */
  signal(type: string, to: string, payload: Record<string, unknown> = {}): void {
    this.send({ type, to, ...payload });
  }

  close(): void {
    this.closedByUs = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }
}
