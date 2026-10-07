/**
 * Contexte d'authentification : inscription, connexion, déconnexion et
 * hydratation de la session au démarrage.
 *
 * Note sur la sécurité : le backend émet des JWT SANS révocation côté serveur.
 * `logout` ne fait que repasser l'utilisateur hors ligne ; un refresh token
 * reste valable jusqu'à son expiration (7 jours). On efface donc les jetons
 * localement sans supposer qu'ils sont invalidés à distance.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, tokenStore, type RegisterPayload, type UserInDB } from '../lib/api';
import type { Language, MessageTone } from '../types';

interface AuthContextValue {
  user: UserInDB | null;
  isAuthenticated: boolean;
  /** Vrai tant que la session initiale n'a pas été résolue. */
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (next: {
    full_name?: string;
    avatar_url?: string;
    preferred_language?: Language;
    preferred_tone?: MessageTone;
  }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydratation : un jeton stocké ne vaut session que si /me l'accepte.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!tokenStore.access) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const authenticate = useCallback(
    async (run: () => Promise<{ access_token: string; refresh_token: string; token_type: string }>) => {
      setError(null);
      try {
        tokenStore.save(await run());
        setUser(await api.me());
      } catch (cause) {
        tokenStore.clear();
        setUser(null);
        const message = cause instanceof Error ? cause.message : 'Échec de la connexion';
        setError(message);
        throw cause;
      }
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) => authenticate(() => api.login(email, password)),
    [authenticate],
  );

  const signup = useCallback(
    (payload: RegisterPayload) => authenticate(() => api.register(payload)),
    [authenticate],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* le serveur ne révoque pas les jetons : l'échec ne doit pas bloquer */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const updatePreferences = useCallback<AuthContextValue['updatePreferences']>(async (next) => {
    const updated = await api.updateSettings(next);
    setUser(updated);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      login,
      signup,
      logout,
      updatePreferences,
      clearError: () => setError(null),
    }),
    [user, isLoading, error, login, signup, logout, updatePreferences],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  return context;
}
