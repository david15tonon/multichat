import { render, screen } from '@testing-library/react';
import { ThemeProvider as StyledThemeProvider, useTheme } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { LightOnly } from './LightOnly';
import { darkTheme, theme } from '../styles/theme';

/** Révèle le thème effectivement reçu par un descendant. */
function Sonde() {
  const received = useTheme();
  return <span data-testid="encre">{received.colors.neutral.black}</span>;
}

describe('LightOnly', () => {
  it('impose le thème clair même sous un thème sombre', () => {
    // La landing page et les écrans d'authentification sont posés sur des
    // aplats vifs et des couleurs écrites en dur : l'inversion les casse.
    render(
      <StyledThemeProvider theme={darkTheme}>
        <LightOnly>
          <Sonde />
        </LightOnly>
      </StyledThemeProvider>,
    );

    expect(screen.getByTestId('encre')).toHaveTextContent(theme.colors.neutral.black);
  });

  it('laisse le thème sombre intact en dehors de son sous-arbre', () => {
    render(
      <StyledThemeProvider theme={darkTheme}>
        <Sonde />
      </StyledThemeProvider>,
    );

    expect(screen.getByTestId('encre')).toHaveTextContent(darkTheme.colors.neutral.black);
  });
});
