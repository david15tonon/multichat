import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../../design-system/theme";
import { LoginScreen } from "./LoginScreen";

const Wrapper = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const AppExample = () => (
  <ThemeProvider theme={theme}>
    <Wrapper>
      <LoginScreen />
    </Wrapper>
  </ThemeProvider>
);
