/**
 * Langue de l'interface.
 *
 * Une seule règle, pour toute l'application :
 *   langue du COMPTE si l'utilisateur est connecté (une langue dont
 *   l'interface n'est pas traduite retombe sur l'anglais), sinon le CHOIX
 *   EXPLICITE du visiteur — mémorisé d'une visite à l'autre —, sinon
 *   l'ANGLAIS.
 *
 * Les pages publiques s'ouvrent donc en anglais tant que le visiteur n'a pas
 * demandé autre chose : la détection de la langue du navigateur a été retirée,
 * c'est elle qui faisait apparaître la landing en français sans que personne
 * l'ait demandé. La bascule FR/EN de la barre de navigation est le seul moyen
 * d'en changer avant connexion.
 *
 * Rien de tout cela ne touche aux MESSAGES, qui restent traduits dans les
 * 9 langues indépendamment de l'interface.
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
import { useAuth } from '../contexts/AuthContext';
import {
  dictionaries,
  FALLBACK_LOCALE,
  isUiLocale,
  type TranslationKey,
  type UiLocale,
} from './translations';

export type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  locale: UiLocale;
  /**
   * Choix du visiteur. Sans effet tant qu'une langue est imposée (compte
   * connecté) : là, c'est le compte qui fait foi, et on en change dans les
   * réglages.
   */
  setLocale: (locale: UiLocale) => void;
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'multichat.ui-locale';

/** Le stockage peut être refusé (navigation privée, iframe) : jamais fatal. */
function storedLocale(): UiLocale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value && isUiLocale(value) ? value : null;
  } catch {
    return null;
  }
}

function storeLocale(locale: UiLocale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* choix non mémorisé, mais la session en cours reste correcte */
  }
}

export function I18nProvider({
  children,
  locale: imposed,
}: {
  children: ReactNode;
  /** Langue imposée par le compte (ou par un test). Prime sur le choix du visiteur. */
  locale?: UiLocale;
}) {
  const [chosen, setChosen] = useState<UiLocale>(() => storedLocale() ?? FALLBACK_LOCALE);
  const locale = imposed ?? chosen;

  const setLocale = useCallback((next: UiLocale) => {
    setChosen(next);
    storeLocale(next);
  }, []);

  // Les lecteurs d'écran et la synthèse vocale prononcent la page selon cet
  // attribut : un texte anglais annoncé `lang="fr"` est inaudible.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback<Translate>(
    (key, params) => {
      const template = dictionaries[locale][key] ?? dictionaries[FALLBACK_LOCALE][key] ?? key;
      if (!params) return template;
      return Object.entries(params).reduce(
        (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
        template,
      );
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Variante branchée sur le compte : c'est elle que monte l'application. */
export function AuthI18nProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const preferred = user?.preferred_language;

  const imposed: UiLocale | undefined = useMemo(() => {
    if (!preferred) return undefined; // visiteur : son propre choix s'applique
    // Langue du compte non traduite (ja, ar…) : anglais plutôt qu'un français
    // codé en dur que l'utilisateur ne lit peut-être pas.
    return isUiLocale(preferred) ? preferred : FALLBACK_LOCALE;
  }, [preferred]);

  return <I18nProvider locale={imposed}>{children}</I18nProvider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n doit être utilisé dans un <I18nProvider>');
  return context;
}

/** Raccourci : `const t = useT();` puis `t('chat.send')`. */
export function useT(): Translate {
  return useI18n().t;
}
