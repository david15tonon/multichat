export const theme = {
  colors: {
    primary: {
      yellow: '#FDB924',
      orange: '#FF6B35',
      purple: '#6C5CE7',
    },
    neutral: {
      // `black` et `white` décrivent un RÔLE, pas une couleur littérale :
      // `black` est l'encre (traits, ombres, texte), `white` la surface.
      // Le thème sombre les inverse, ce qui suffit à basculer tout le système.
      black: '#000000',
      white: '#FFFFFF',
      offWhite: '#F5F5F0',
      gray: '#8E8E93',
      lightGray: '#E5E5EA',
      // Invariants : texte posé sur une couleur vive, et fond d'overlay.
      // Les inverser casserait le contraste (texte sombre sur violet).
      onAccent: '#FFFFFF',
      overlay: '#000000',
      // Encre posée sur un fond VIF (jaune, orange). Ces fonds restent clairs
      // en mode sombre : leur texte doit donc rester sombre, sinon on obtient
      // du blanc sur jaune. Invariant, comme onAccent.
      onBright: '#121214',
    },
    status: {
      online: '#34C759',
      offline: '#8E8E93',
      error: '#FF3B30',
      warning: '#FF9500',
    },
    background: {
      yellow: '#FDB924',
      orange: '#FF6B35',
      cream: '#F5F5F0',
      white: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  zIndex: {
    dropdown: 1000,
    modal: 2000,
    toast: 3000,
    tooltip: 4000,
  },
};

export type Theme = typeof theme;

/**
 * Thème sombre.
 *
 * Le système néo-brutaliste repose sur un contraste encre / surface. Il suffit
 * donc d'inverser ces deux rôles : `black` (traits, ombres, texte) devient
 * clair, `white` (surface) devient sombre. Les 118 usages existants basculent
 * sans qu'aucun composant ne soit modifié.
 *
 * `onAccent` et `overlay` restent invariants : du texte clair sur un bouton
 * violet doit le rester, et un fond d'overlay doit rester sombre.
 *
 * Les couleurs vives sont légèrement adoucies : à pleine saturation sur fond
 * sombre, elles vibrent et fatiguent l'œil.
 */
export const darkTheme: Theme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: {
      yellow: '#F5C04E',
      orange: '#FF8359',
      purple: '#8B7BF0',
    },
    neutral: {
      black: '#F2F2F0', // encre claire
      white: '#1A1A1C', // surface sombre
      offWhite: '#232326',
      gray: '#9A9AA0',
      lightGray: '#35353A',
      onAccent: '#FFFFFF',
      overlay: '#000000',
      onBright: '#121214',
    },
    status: {
      online: '#4ADE80',
      offline: '#9A9AA0',
      error: '#FF6B6B',
      warning: '#FFB74D',
    },
    background: {
      yellow: '#F5C04E',
      orange: '#FF8359',
      cream: '#121214',
      white: '#1A1A1C',
    },
  },
  shadows: {
    ...theme.shadows,
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    card: '0 2px 8px rgba(0, 0, 0, 0.45)',
  },
};
