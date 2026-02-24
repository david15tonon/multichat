export const theme = {
  colors: {
    primary: {
      yellow: '#FDB924',
      orange: '#FF6B35',
      purple: '#6C5CE7',
    },
    neutral: {
      black: '#000000',
      white: '#FFFFFF',
      offWhite: '#F5F5F0',
      gray: '#8E8E93',
      lightGray: '#E5E5EA',
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
