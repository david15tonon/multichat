import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConversationWithMessages, MessagePublic } from '../lib/api';

/** Rappels confiés au socket par `useChat`, pour les déclencher à la main. */
let handlers: { onEvent?: (e: unknown) => void; onOpen?: () => void; onClose?: () => void } = {};
const connect = vi.fn();
const close = vi.fn();

vi.mock('../lib/ws', () => ({
  ChatSocket: class {
    constructor(_token: string, callbacks: typeof handlers) {
      handlers = callbacks;
    }
    connect = connect;
    close = close;
  },
}));

vi.mock('../lib/api', () => ({
  tokenStore: { access: 'jeton' },
  api: {
    conversations: vi.fn().mockResolvedValue([]),
    conversation: vi.fn(),
    sendMessage: vi.fn(),
    markRead: vi.fn(),
  },
}));

const { api } = await import('../lib/api');
const { useChat } = await import('./useChat');

/** Enveloppe minimale : seuls les messages comptent pour ces cas. */
const conversation = (id: string, messages: MessagePublic[]): ConversationWithMessages => ({
  id,
  is_group: false,
  participants: [],
  unread_count: 0,
  created_at: '2026-10-23T09:00:00Z',
  messages,
});

const message = (id: string, content: string): MessagePublic => ({
  id,
  content,
  original_language: 'fr',
  translated_content: content,
  target_language: 'en',
  tone: 'standard',
  status: 'sent',
  translation_status: 'translated',
  sender_id: 'elena',
  receiver_id: 'moi',
  created_at: '2026-10-23T09:00:00Z',
});

beforeEach(() => {
  handlers = {};
  connect.mockClear();
  close.mockClear();
  vi.mocked(api.conversations).mockResolvedValue([]);
  vi.mocked(api.conversation).mockReset();
});

describe('useChat — publication du socket', () => {
  it('n’expose le socket qu’une fois la connexion ouverte', async () => {
    // Avant l'ouverture, `signal()` n'émettrait rien : useWebRTC n'a aucune
    // raison de le recevoir.
    const { result } = renderHook(() => useChat('moi', 'fr'));

    expect(result.current.socket).toBeNull();
    expect(connect).toHaveBeenCalled();

    await act(async () => handlers.onOpen?.());

    expect(result.current.socket).not.toBeNull();
    expect(result.current.isConnected).toBe(true);
  });

  it('ne monte aucun socket sans utilisateur', () => {
    renderHook(() => useChat(null, 'fr'));

    expect(connect).not.toHaveBeenCalled();
  });
});

describe('useChat — chargement de la conversation active', () => {
  it('ignore la réponse d’une conversation déjà quittée', async () => {
    // Deux chargements se croisent : celui de « c1 » répond en dernier. Sans
    // garde d'annulation, il écrasait les messages de « c2 ».
    let resolveFirst: (value: ConversationWithMessages) => void = () => {};
    vi.mocked(api.conversation).mockImplementation((id: string) =>
      id === 'c1'
        ? new Promise<ConversationWithMessages>((resolve) => {
            resolveFirst = resolve;
          })
        : Promise.resolve(conversation('c2', [message('m2', 'conversation 2')])),
    );

    const { result } = renderHook(() => useChat('moi', 'fr'));

    act(() => result.current.selectConversation('c1'));
    act(() => result.current.selectConversation('c2'));

    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(result.current.messages[0].content).toBe('conversation 2');

    await act(async () => {
      resolveFirst(conversation('c1', [message('m1', 'conversation 1')]));
    });

    expect(result.current.messages[0].content).toBe('conversation 2');
  });

  it('affiche les messages de la conversation ouverte', async () => {
    vi.mocked(api.conversation).mockResolvedValue(
      conversation('c1', [message('m1', 'bonjour')]),
    );

    const { result } = renderHook(() => useChat('moi', 'fr'));
    act(() => result.current.selectConversation('c1'));

    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(result.current.messages[0].content).toBe('bonjour');
  });
});
