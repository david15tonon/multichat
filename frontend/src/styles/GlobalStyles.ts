import { createGlobalStyle } from 'styled-components';
// import { Theme } from './theme';  ← Vous pouvez supprimer cette ligne si non utilisée

export const GlobalStyles = createGlobalStyle`  // ← Pas de retour à la ligne !
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.neutral.black};
    background-color: ${({ theme }) => theme.colors.neutral.white};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
    width: 100%;
  }

  input, button, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;