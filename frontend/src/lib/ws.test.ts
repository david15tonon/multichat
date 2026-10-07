import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatSocket, wsUrl } from './ws';

/** Faux WebSocket : capture ce qui est envoyé, pilote les callbacks à la main. */
class FakeWebSocket {
  static OPEN = 1;
  static instances: FakeWebSocket[] = [];
  readyState = FakeWebSocket.OPEN;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(payload: string) {
    this.sent.push(payload);
  }

  close() {
    this.closed = true;
  }
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal('WebSocket', FakeWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('wsUrl', () => {
  it('cible /api/ws et encode le jeton en query', () => {
    // Le chemin est bien /api/ws : des docstrings backend annonçaient /ws.
    const url = wsUrl('tok en+spécial');

    expect(url).toContain('/api/ws?token=');
    expect(url).toContain(encodeURIComponent('tok en+spécial'));
  });

  it('bascule http en ws', () => {
    expect(wsUrl('t').startsWith('ws')).toBe(true);
  });
});

describe('ChatSocket', () => {
  const handlers = () => ({ onEvent: vi.fn(), onOpen: vi.fn(), onClose: vi.fn() });

  it('prévient à l’ouverture pour permettre la resynchronisation', () => {
    // Les salons serveur sont en mémoire : il faut rejouer GET /conversations
    // à chaque (re)connexion, sinon plus rien n'arrive.
    const h = handlers();
    new ChatSocket('tok', h).connect();
    FakeWebSocket.instances[0].onopen?.();

    expect(h.onOpen).toHaveBeenCalledOnce();
  });

  it('transmet les événements JSON reçus', () => {
    const h = handlers();
    new ChatSocket('tok', h).connect();
    FakeWebSocket.instances[0].onmessage?.({ data: '{"type":"pong"}' });

    expect(h.onEvent).toHaveBeenCalledWith({ type: 'pong' });
  });

  it('ignore une trame non JSON au lieu de casser la session', () => {
    const h = handlers();
    new ChatSocket('tok', h).connect();

    expect(() =>
      FakeWebSocket.instances[0].onmessage?.({ data: 'pas du json' }),
    ).not.toThrow();
    expect(h.onEvent).not.toHaveBeenCalled();
  });

  it('signal() ajoute le destinataire et la charge utile', () => {
    const socket = new ChatSocket('tok', handlers());
    socket.connect();
    socket.signal('call:offer', 'peer-1', { sdp: { type: 'offer' } });

    expect(JSON.parse(FakeWebSocket.instances[0].sent[0])).toEqual({
      type: 'call:offer',
      to: 'peer-1',
      sdp: { type: 'offer' },
    });
  });

  it('setTyping et markRead respectent le protocole serveur', () => {
    const socket = new ChatSocket('tok', handlers());
    socket.connect();
    socket.setTyping('conv-1', true);
    socket.markRead('msg-1', 'conv-1');

    const [typing, read] = FakeWebSocket.instances[0].sent.map((p) => JSON.parse(p));
    expect(typing).toEqual({ type: 'typing', conversation_id: 'conv-1', is_typing: true });
    expect(read).toEqual({ type: 'read', message_id: 'msg-1', conversation_id: 'conv-1' });
  });

  it('ne se reconnecte pas après un jeton refusé (code 1008)', () => {
    vi.useFakeTimers();
    new ChatSocket('mauvais', handlers()).connect();
    FakeWebSocket.instances[0].onclose?.({ code: 1008 });
    vi.advanceTimersByTime(60_000);

    // Boucler sur un jeton invalide ne ferait que marteler le serveur.
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('se reconnecte après une coupure réseau', () => {
    vi.useFakeTimers();
    new ChatSocket('tok', handlers()).connect();
    FakeWebSocket.instances[0].onclose?.({ code: 1006 });
    vi.advanceTimersByTime(2000);

    expect(FakeWebSocket.instances.length).toBeGreaterThan(1);
  });

  it('ne se reconnecte pas après une fermeture volontaire', () => {
    vi.useFakeTimers();
    const socket = new ChatSocket('tok', handlers());
    socket.connect();
    socket.close();
    FakeWebSocket.instances[0].onclose?.({ code: 1000 });
    vi.advanceTimersByTime(60_000);

    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
