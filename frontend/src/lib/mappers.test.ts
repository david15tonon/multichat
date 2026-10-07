import { describe, expect, it } from 'vitest';
import {
  otherParticipant,
  toMessage,
  toTranslationStatus,
  upsertMessage,
} from './mappers';
import type { ConversationPublic, MessagePublic, UserPublic } from './api';
import type { Message } from '../types';

const user = (id: string, name: string): UserPublic => ({
  id,
  full_name: name,
  is_online: true,
  preferred_language: 'fr',
});

const dto = (overrides: Partial<MessagePublic> = {}): MessagePublic => ({
  id: 'm1',
  content: 'Bonjour',
  original_language: 'fr',
  translated_content: 'Hello',
  target_language: 'en',
  tone: 'standard',
  status: 'sent',
  translation_status: 'translated',
  sender_id: 'u1',
  receiver_id: 'u2',
  created_at: '2026-10-06T18:30:00Z',
  ...overrides,
});

describe('toTranslationStatus', () => {
  it('ramène pending à translating, absent du type frontend', () => {
    expect(toTranslationStatus('pending')).toBe('translating');
  });

  it('renvoie undefined quand le backend ne fournit rien', () => {
    expect(toTranslationStatus(null)).toBeUndefined();
    expect(toTranslationStatus(undefined)).toBeUndefined();
  });

  it('laisse passer les statuts déjà communs aux deux côtés', () => {
    expect(toTranslationStatus('translated')).toBe('translated');
    expect(toTranslationStatus('failed')).toBe('failed');
  });
});

describe('toMessage', () => {
  it('convertit snake_case en camelCase et la date ISO en Date', () => {
    const message = toMessage(dto());

    expect(message.senderId).toBe('u1');
    expect(message.receiverId).toBe('u2');
    expect(message.translatedContent).toBe('Hello');
    expect(message.targetLanguage).toBe('en');
    expect(message.timestamp).toBeInstanceOf(Date);
    expect(message.timestamp.toISOString()).toBe('2026-10-06T18:30:00.000Z');
  });

  it('ne plante pas sur une charge WebSocket partielle', () => {
    // Régression : la diffusion temps réel omettait original_language, tone et
    // translation_status. MessageBubble faisait alors
    // `originalLanguage.toUpperCase()` sur undefined et cassait tout le rendu.
    const partiel = {
      id: 'm9',
      content: 'Salut',
      sender_id: 'u1',
      receiver_id: 'u2',
      status: 'sent',
      created_at: '2026-10-07T10:00:00Z',
    } as unknown as MessagePublic;

    const message = toMessage(partiel);

    expect(message.originalLanguage).toBeDefined();
    expect(message.tone).toBeDefined();
    expect(() => message.originalLanguage.toUpperCase()).not.toThrow();
  });

  it('remplace les null du backend par undefined', () => {
    const message = toMessage(dto({ translated_content: null, target_language: null }));

    expect(message.translatedContent).toBeUndefined();
    expect(message.targetLanguage).toBeUndefined();
  });
});

describe('upsertMessage', () => {
  const base: Message = toMessage(dto());

  it('ajoute un message absent de la liste', () => {
    const result = upsertMessage([], base);
    expect(result).toHaveLength(1);
  });

  it('remplace sans dupliquer quand le serveur rediffuse le même id', () => {
    // Le backend diffuse chaque message à TOUS les participants, émetteur
    // compris : sans déduplication, l'émetteur verrait son message deux fois.
    const updated = { ...base, status: 'read' as const };
    const result = upsertMessage([base], updated);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('read');
  });

  it('préserve l’ordre des messages existants', () => {
    const second = toMessage(dto({ id: 'm2' }));
    const result = upsertMessage([base, second], { ...base, content: 'modifié' });

    expect(result.map((m) => m.id)).toEqual(['m1', 'm2']);
    expect(result[0].content).toBe('modifié');
  });
});

describe('otherParticipant', () => {
  const conversation = {
    id: 'c1',
    is_group: false,
    participants: [user('u1', 'Alice'), user('u2', 'Bob')],
    unread_count: 0,
    created_at: '2026-10-06T18:00:00Z',
  } as ConversationPublic;

  it('renvoie l’interlocuteur, pas l’utilisateur courant', () => {
    expect(otherParticipant(conversation, 'u1')?.full_name).toBe('Bob');
    expect(otherParticipant(conversation, 'u2')?.full_name).toBe('Alice');
  });

  it('renvoie undefined si l’utilisateur courant est seul participant', () => {
    const solo = { ...conversation, participants: [user('u1', 'Alice')] };
    expect(otherParticipant(solo, 'u1')).toBeUndefined();
  });
});
