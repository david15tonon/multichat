/**
 * Mode clair / sombre.
 *
 * Trois états : `light`, `dark`, et `system` (par défaut) qui suit la
 * préférence du système d'exploitation et réagit si elle change en cours de
 * session. Le choix est mémorisé par navigateur.
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
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme, darkTheme } from '../styles/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'multichat.theme';

interface ThemeContextValue {
  /** Préférence choisie, `system` compris. */
  mode: ThemeMode;
  /** Thème réellement appliqué, une fois `system` résolu. */
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  /** Bascule clair <-> sombre en figeant un choix explicite. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function readStoredMode(): ThemeMode {
  // localStorage peut lever (navigation privée, stockage bloqué) : on retombe
  // alors sur la préférence système plutôt que de faire tomber l'application.
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* stockage indisponible */
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemDark, setSystemDark] = useState(prefersDark);

  // Suivre la préférence système tant que l'utilisateur n'a pas tranché.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* le choix ne survivra pas au rechargement, sans conséquence autre */
    }
  }, []);

  const resolved: 'light' | 'dark' =
    mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  const toggle = useCallback(
    () => setMode(resolved === 'dark' ? 'light' : 'dark'),
    [resolved, setMode],
  );

  // Pour la barre de défilement, les contrôles natifs et la couleur d'onglet.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  const value = useMemo(
    () => ({ mode, resolved, setMode, toggle }),
    [mode, resolved, setMode, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={resolved === 'dark' ? darkTheme : theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode doit être utilisé dans un <ThemeProvider>');
  return context;
}
