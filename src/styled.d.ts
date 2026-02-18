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
        primary: string;
        secondary: string;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    typography: {
      fontFamily: {
        primary: string;
        secondary: string;
      };
      fontSize: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
      };
      fontWeight: {
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
      };
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    zIndex: {
      modal: number;
      dropdown: number;
      header: number;
    };
  }
}