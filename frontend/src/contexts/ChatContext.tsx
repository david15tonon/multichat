/**
 * Une seule session de chat pour toute l'application authentifiée.
 *
 * Auparavant chaque route appelait `useChat` de son côté : deux WebSockets
 * concurrents pour le même utilisateur, et une rupture de connexion à chaque
 * navigation entre l'inbox et une conversation. Le socket vit maintenant ici,
 * monté une fois, partagé par toutes les routes.
 */

import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from '../hooks/useChat';
import { useWebRTC } from '../hooks/useWebRTC';
import type { ServerEvent } from '../lib/ws';
import type { Language } from '../types';

type ChatContextValue = ReturnType<typeof useChat> & {
  call: ReturnType<typeof useWebRTC>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const language = (user?.preferred_language ?? 'fr') as Language;

  // Identité stable obligatoire : `useChat` dépend de ce callback pour monter
  // le socket. Une fonction recréée à chaque rendu le fermerait en boucle.
  const callSignal = useRef<((event: ServerEvent) => void) | null>(null);
  const handleCallSignal = useCallback(
    (event: ServerEvent) => callSignal.current?.(event),
    [],
  );

  const chat = useChat(user?.id ?? null, language, handleCallSignal);
  const call = useWebRTC(chat.socket);
  callSignal.current = call.handleSignal;

  return <ChatContext.Provider value={{ ...chat, call }}>{children}</ChatContext.Provider>;
}

export function useChatSession(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatSession doit être utilisé dans un <ChatProvider>');
  return context;
}
