import React from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { theme } from "./design-system/theme";
import { LoginScreen } from "./components/pages/LoginScreen";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: ${({ theme: themeObject }) => themeObject.typography.fontFamily};
    background: ${({ theme: themeObject }) => themeObject.colors.background};
    color: ${({ theme: themeObject }) => themeObject.colors.textPrimary};
  }
`;

export const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <LoginScreen />
  </ThemeProvider>
);
