/**
 * Client HTTP typé pour l'API MultiChat.
 *
 * Points de contrat vérifiés côté backend :
 *  - le préfixe est `/api` (et non `/api/v1`, que des docstrings annonçaient
 *    à tort) ;
 *  - `/health` est servi HORS préfixe, à la racine ;
 *  - la route de lecture est `/api/messages/messages/{id}/read` : le segment
 *    `messages` est bien doublé, le routeur étant déjà préfixé.
 */

import type { ApiError, Language, MessageTone } from '../types';

// En développement on vise le backend local ; en production, VITE_API_URL doit
// être défini. À défaut, on retombe sur la même origine, ce qui fonctionne si
// le backend est servi derrière le même domaine via une rewrite.
const RAW_BASE =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://127.0.0.1:8000');
export const API_BASE = RAW_BASE.replace(/\/$/, '');

// ---------------------------------------------------------------- types API
// Miroirs des schémas Pydantic du backend (snake_case, volontairement).

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserInDB {
  id: string;
  email: string;
  full_name: string;
  preferred_language: Language;
  preferred_tone: MessageTone;
  avatar_url?: string | null;
  is_active: boolean;
  is_online: boolean;
  is_verified: boolean;
  created_at: string;
  last_seen?: string | null;
}

export interface UserPublic {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  is_online: boolean;
  preferred_language: Language;
  last_seen?: string | null;
}

export interface MessagePublic {
  id: string;
  content: string;
  original_language: Language;
  translated_content?: string | null;
  target_language?: Language | null;
  tone: MessageTone;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  translation_status?: 'pending' | 'translating' | 'translated' | 'failed' | null;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at?: string | null;
  sender?: UserPublic | null;
}

export interface ConversationPublic {
  id: string;
  is_group: boolean;
  name?: string | null;
  participants: UserPublic[];
  last_message?: MessagePublic | null;
  unread_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface ConversationWithMessages extends ConversationPublic {
  messages: MessagePublic[];
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  preferred_language?: Language;
  preferred_tone?: MessageTone;
}

export class ApiRequestError extends Error implements ApiError {
  code: string;
  details?: unknown;
  status: number;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = String(status);
    this.status = status;
    this.details = details;
  }
}

// --------------------------------------------------------------- stockage
const ACCESS_KEY = 'multichat.access_token';
const REFRESH_KEY = 'multichat.refresh_token';

// localStorage peut lever (mode privé, stockage bloqué) : on ne laisse jamais
// une erreur de stockage faire tomber l'application.
function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible : la session ne survivra pas au rechargement */
  }
}

export const tokenStore = {
  get access() {
    return safeRead(ACCESS_KEY);
  },
  get refresh() {
    return safeRead(REFRESH_KEY);
  },
  save(token: Token) {
    safeWrite(ACCESS_KEY, token.access_token);
    safeWrite(REFRESH_KEY, token.refresh_token);
  },
  clear() {
    safeWrite(ACCESS_KEY, null);
    safeWrite(REFRESH_KEY, null);
  },
};

// ------------------------------------------------------------ requêtes
async function parseError(response: Response): Promise<ApiRequestError> {
  let message = `Erreur ${response.status}`;
  let details: unknown;
  try {
    const body = await response.json();
    details = body;
    if (typeof body?.detail === 'string') message = body.detail;
    else if (Array.isArray(body?.detail) && body.detail[0]?.msg) message = body.detail[0].msg;
  } catch {
    /* corps non JSON : on garde le message générique */
  }
  return new ApiRequestError(message, response.status, details);
}

let refreshing: Promise<boolean> | null = null;

/** Rejoue le refresh token. Mutualisé pour éviter la tempête de refresh. */
async function refreshSession(): Promise<boolean> {
  const refresh_token = tokenStore.refresh;
  if (!refresh_token) return false;

  refreshing ??= (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });
      if (!response.ok) {
        tokenStore.clear();
        return false;
      }
      tokenStore.save((await response.json()) as Token);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retryOnUnauthorized = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const access = auth ? tokenStore.access : null;
  if (access) headers.Authorization = `Bearer ${access}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    throw new ApiRequestError('Serveur injoignable', 0, cause);
  }

  // 401 : on tente un refresh unique avant d'abandonner la session.
  if (response.status === 401 && auth && retryOnUnauthorized) {
    if (await refreshSession()) {
      return request<T>(path, { ...options, retryOnUnauthorized: false });
    }
    tokenStore.clear();
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// --------------------------------------------------------------- endpoints
export const api = {
  /** `/health` est servi à la racine, PAS sous `/api`. */
  health: () => request<{ status: string; version: string }>('/health', { auth: false }),

  register: (payload: RegisterPayload) =>
    request<Token>('/api/auth/register', { method: 'POST', body: payload, auth: false }),

  login: (email: string, password: string) =>
    request<Token>('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  me: () => request<UserInDB>('/api/auth/me'),

  /** Recherche par nom ou e-mail. Indispensable pour démarrer une
   *  conversation : sans elle il faudrait connaître l'UUID du destinataire. */
  searchUsers: (query: string) =>
    request<UserPublic[]>(`/api/auth/users/search?q=${encodeURIComponent(query)}`),

  conversations: () => request<ConversationPublic[]>('/api/messages/conversations'),

  createConversation: (participantIds: string[], name?: string) =>
    request<ConversationPublic>('/api/messages/conversations', {
      method: 'POST',
      body: { participant_ids: participantIds, is_group: participantIds.length > 1, name },
    }),

  conversation: (id: string, limit = 50, offset = 0) =>
    request<ConversationWithMessages>(
      `/api/messages/conversations/${id}?limit=${limit}&offset=${offset}`,
    ),

  sendMessage: (payload: {
    content: string;
    tone: MessageTone;
    receiver_id: string;
    original_language?: Language;
  }) => request<MessagePublic>('/api/messages/send', { method: 'POST', body: payload }),

  // Segment `messages` volontairement doublé : c'est le chemin réel du backend.
  markRead: (messageId: string) =>
    request<MessagePublic>(`/api/messages/messages/${messageId}/read`, { method: 'POST' }),

  settings: () => request<{ preferred_language: Language; preferred_tone: MessageTone }>(
    '/api/settings/me',
  ),

  updateSettings: (payload: {
    full_name?: string;
    avatar_url?: string;
    preferred_language?: Language;
    preferred_tone?: MessageTone;
  }) => request<UserInDB>('/api/settings/me', { method: 'PUT', body: payload }),

  deleteAccount: () => request<void>('/api/settings/me', { method: 'DELETE' }),
};
