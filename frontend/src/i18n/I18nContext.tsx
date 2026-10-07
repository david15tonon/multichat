/**
 * Langue de l'interface.
 *
 * Elle suit la langue du compte : un utilisateur configuré en anglais doit
 * lire une interface en anglais. Avant connexion, on part de la langue du
 * navigateur. Toute langue dont l'interface n'est pas traduite retombe sur
 * l'anglais, sans que les MESSAGES en soient affectés — eux restent traduits
 * dans les 9 langues.
 */

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
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
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function browserLocale(): UiLocale {
  if (typeof navigator === 'undefined') return FALLBACK_LOCALE;
  const short = navigator.language.slice(0, 2);
  return isUiLocale(short) ? short : FALLBACK_LOCALE;
}

/**
 * Fournit une langue explicite. Volontairement indépendant de
 * l'authentification : un composant se teste ainsi sans monter toute la pile
 * d'authentification pour afficher trois libellés.
 */
export function I18nProvider({
  children,
  locale = browserLocale(),
}: {
  children: ReactNode;
  locale?: UiLocale;
}) {
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

  const value = useMemo(() => ({ locale, t }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Variante branchée sur le compte : c'est elle que monte l'application. */
export function AuthI18nProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const preferred = user?.preferred_language;

  const locale: UiLocale = useMemo(() => {
    if (preferred && isUiLocale(preferred)) return preferred;
    // Langue du compte non traduite (ja, ar…) : anglais plutôt qu'un français
    // codé en dur que l'utilisateur ne lit peut-être pas.
    if (preferred) return FALLBACK_LOCALE;
    return browserLocale();
  }, [preferred]);

  return <I18nProvider locale={locale}>{children}</I18nProvider>;
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
