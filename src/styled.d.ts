// src/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: {
        yellow: string;
        orange: string;
        purple: string;
      };
      neutral: {
        black: string;
        white: string;
        offWhite: string;
        gray: string;
        lightGray: string;
      };
      status: {
        online: string;
        offline: string;
        error: string;
        warning: string;
      };
      background: {
        yellow: string;    // ← CORRIGÉ
        orange: string;    // ← CORRIGÉ
        cream: string;     // ← CORRIGÉ
        white: string;     // ← CORRIGÉ
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;       // ← CORRIGÉ (notez les quotes pour le chiffre)
    };
    typography: {
      fontFamily: {
        primary: string;
        // secondary: string;  ← Supprimez car pas dans theme.ts
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;      // ← AJOUTÉ
        lg: string;
        xl: string;
        '2xl': string;     // ← AJOUTÉ
        '3xl': string;     // ← AJOUTÉ
        '4xl': string;     // ← AJOUTÉ
      };
      fontWeight: {
        normal: number;    // ← CORRIGÉ (au lieu de regular)
        medium: number;
        semibold: number;
        bold: number;
        black: number;     // ← AJOUTÉ
      };
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;          // ← AJOUTÉ
      full: string;
    };
    shadows: {             // ← AJOUTÉ (manquant)
      sm: string;
      md: string;
      lg: string;
      card: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    zIndex: {
      dropdown: number;    // ← RÉORGANISÉ pour correspondre
      modal: number;
      toast: number;       // ← AJOUTÉ
      tooltip: number;     // ← AJOUTÉ
    };
  }
}