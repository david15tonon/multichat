import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useThemeMode } from './ThemeContext';

function Sonde() {
  const { mode, resolved, toggle, setMode } = useThemeMode();
  return (
    <>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={toggle}>basculer</button>
      <button onClick={() => setMode('system')}>système</button>
    </>
  );
}

const show = () => render(<ThemeProvider><Sonde /></ThemeProvider>);

/** Simule la préférence du système d'exploitation. */
function stubSystem(dark: boolean, listeners: Array<(e: MediaQueryListEvent) => void> = []) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark && query.includes('dark'),
    media: query,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: () => undefined,
  }));
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('ThemeContext', () => {
  it('suit la préférence système par défaut', () => {
    stubSystem(true);
    show();

    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('retombe en clair si le système ne demande pas le sombre', () => {
    stubSystem(false);
    show();

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('fige un choix explicite au basculement', async () => {
    stubSystem(false);
    const user = userEvent.setup();
    show();

    await user.click(screen.getByText('basculer'));

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('mémorise le choix d’un rechargement à l’autre', async () => {
    stubSystem(false);
    const user = userEvent.setup();
    const { unmount } = show();
    await user.click(screen.getByText('basculer'));
    unmount();

    show();
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('réagit à un changement de préférence système tant qu’aucun choix n’est figé', () => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];
    stubSystem(false, listeners);
    show();
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');

    act(() => listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent)));
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('expose le thème sur <html> pour les contrôles natifs', () => {
    stubSystem(true);
    show();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('ne tombe pas quand localStorage est inaccessible', () => {
    stubSystem(false);
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué');
    });

    expect(() => show()).not.toThrow();
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    getItem.mockRestore();
  });
});
