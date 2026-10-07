/**
 * Pilote la conversation active : chargement REST, envoi, et temps réel.
 *
 * Deux contraintes du backend sont traitées ici :
 *  - les messages diffusés par WebSocket reviennent aussi à leur émetteur :
 *    `upsertMessage` déduplique sur l'identifiant ;
 *  - les salons serveur sont en mémoire et peuplés par les appels REST : à
 *    chaque (re)connexion du socket, on rejoue `GET /conversations`.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, tokenStore, type ConversationPublic, type MessagePublic } from '../lib/api';
import { ChatSocket, type ServerEvent } from '../lib/ws';
import { otherParticipant, toMessage, upsertMessage } from '../lib/mappers';
import type { Message, MessageTone, Language } from '../types';

interface UseChatResult {
  conversations: ConversationPublic[];
  messages: Message[];
  activeConversationId: string | null;
  contact: ReturnType<typeof otherParticipant>;
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
  selectConversation: (id: string | null) => void;
  startConversation: (userId: string) => Promise<string | null>;
  markRead: (messageId: string) => void;
  sendMessage: (content: string, tone: MessageTone) => Promise<void>;
  notifyTyping: (isTyping: boolean) => void;
  /** Socket actif, pour la signalisation d'appel. */
  socket: ChatSocket | null;
}

export function useChat(
  currentUserId: string | null,
  language: Language,
  /** Reçoit les événements `call:*` pour la signalisation WebRTC. */
  onCallSignal?: (event: ServerEvent) => void,
): UseChatResult {
  const [conversations, setConversations] = useState<ConversationPublic[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<ChatSocket | null>(null);
  // En state (et pas seulement en ref) : useWebRTC doit réagir à sa création.
  const [socket, setSocket] = useState<ChatSocket | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await api.conversations();
      setConversations(list);
      setActiveConversationId((current) => current ?? list[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chargement impossible');
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const conversation = await api.conversation(conversationId);
      setMessages(conversation.messages.map(toMessage));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chargement impossible');
    }
  }, []);

  // Socket : monté une fois la session établie.
  useEffect(() => {
    const token = tokenStore.access;
    if (!currentUserId || !token) return;

    const handleEvent = (event: ServerEvent) => {
      if (event.type === 'message') {
        setMessages((current) =>
          upsertMessage(current, toMessage(event.data as unknown as MessagePublic)),
        );
      } else if (event.type === 'typing') {
        setIsTyping(event.data.is_typing);
      } else if (event.type.startsWith('call:')) {
        onCallSignal?.(event);
      } else if (event.type === 'read') {
        setMessages((current) =>
          current.map((m) => (m.id === event.data.message_id ? { ...m, status: 'read' } : m)),
        );
      }
    };

    const chatSocket = new ChatSocket(token, {
      onEvent: handleEvent,
      onOpen: () => {
        setIsConnected(true);
        // Indispensable : réabonne le socket aux salons côté serveur.
        void loadConversations();
      },
      onClose: () => setIsConnected(false),
    });

    socketRef.current = chatSocket;
    setSocket(chatSocket);
    chatSocket.connect();

    return () => {
      chatSocket.close();
      socketRef.current = null;
      setSocket(null);
    };
  }, [currentUserId, loadConversations, onCallSignal]);

  useEffect(() => {
    if (activeConversationId) void loadMessages(activeConversationId);
  }, [activeConversationId, loadMessages]);

  const sendMessage = useCallback(
    async (content: string, tone: MessageTone) => {
      const conversation = conversations.find((c) => c.id === activeConversationId);
      const receiver = conversation && currentUserId
        ? otherParticipant(conversation, currentUserId)
        : undefined;
      if (!receiver) {
        setError('Aucun destinataire sélectionné');
        return;
      }

      setError(null);
      try {
        const sent = await api.sendMessage({
          content,
          tone,
          receiver_id: receiver.id,
          original_language: language,
        });
        setMessages((current) => upsertMessage(current, toMessage(sent)));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Échec de l'envoi");
      }
    },
    [activeConversationId, conversations, currentUserId, language],
  );

  /** Crée (ou retrouve) la conversation avec cet utilisateur et la sélectionne. */
  const startConversation = useCallback(
    async (userId: string) => {
      try {
        const conversation = await api.createConversation([userId]);
        await loadConversations();
        setActiveConversationId(conversation.id);
        return conversation.id;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Création impossible');
        return null;
      }
    },
    [loadConversations],
  );

  /** Accusé de lecture : REST pour la persistance, socket pour l'immédiateté. */
  const markRead = useCallback(
    (messageId: string) => {
      if (!activeConversationId) return;
      socketRef.current?.markRead(messageId, activeConversationId);
      void api.markRead(messageId).catch(() => undefined);
    },
    [activeConversationId],
  );

  const notifyTyping = useCallback(
    (typing: boolean) => {
      if (activeConversationId) socketRef.current?.setTyping(activeConversationId, typing);
    },
    [activeConversationId],
  );

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return {
    conversations,
    messages,
    activeConversationId,
    contact: activeConversation && currentUserId
      ? otherParticipant(activeConversation, currentUserId)
      : undefined,
    isConnected,
    isTyping,
    error,
    selectConversation: setActiveConversationId,
    startConversation,
    markRead,
    sendMessage,
    notifyTyping,
    socket,
  };
}
