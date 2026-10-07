/**
 * Conversion des schémas backend (snake_case, dates ISO) vers les types
 * frontend (camelCase, objets Date) définis dans `types/index.ts`.
 *
 * Fonctions pures, sans dépendance réseau : testables en isolation.
 */

import type { MessagePublic, ConversationPublic, UserPublic } from './api';
import type { Message, MessageStatus, TranslationStatus, User } from '../types';

/** `pending` existe côté backend mais pas dans le type frontend : on le ramène
 *  à `translating`, qui décrit le même état pour l'utilisateur. */
export function toTranslationStatus(
  value: MessagePublic['translation_status'],
): TranslationStatus | undefined {
  if (!value) return undefined;
  if (value === 'pending') return 'translating';
  return value as TranslationStatus;
}

/**
 * Tolère une charge partielle : le temps réel et le REST ont déjà divergé une
 * fois (langue et ton absents de la diffusion WebSocket), et un champ manquant
 * ne doit jamais faire planter le rendu d'une conversation.
 */
export function toMessage(dto: MessagePublic): Message {
  return {
    id: dto.id,
    senderId: dto.sender_id,
    receiverId: dto.receiver_id,
    content: dto.content,
    originalLanguage: dto.original_language ?? 'en',
    translatedContent: dto.translated_content ?? undefined,
    targetLanguage: dto.target_language ?? undefined,
    tone: dto.tone ?? 'standard',
    timestamp: new Date(dto.created_at ?? Date.now()),
    status: (dto.status ?? 'sent') as MessageStatus,
    translationStatus: toTranslationStatus(dto.translation_status),
  };
}

export function toUser(dto: UserPublic): Pick<User, 'id' | 'fullName' | 'isOnline' | 'avatar'> {
  return {
    id: dto.id,
    fullName: dto.full_name,
    isOnline: dto.is_online,
    avatar: dto.avatar_url ?? undefined,
  };
}

/** Désigne l'interlocuteur d'une conversation à deux, vu par `currentUserId`. */
export function otherParticipant(
  conversation: ConversationPublic,
  currentUserId: string,
): UserPublic | undefined {
  return conversation.participants.find((p) => p.id !== currentUserId);
}

/** Insère un message en écartant les doublons : le serveur rediffuse les
 *  messages à TOUS les participants, émetteur compris. */
export function upsertMessage(messages: Message[], incoming: Message): Message[] {
  const index = messages.findIndex((m) => m.id === incoming.id);
  if (index === -1) return [...messages, incoming];
  const next = [...messages];
  next[index] = incoming;
  return next;
}
