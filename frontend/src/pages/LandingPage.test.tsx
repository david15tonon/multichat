import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LandingPage } from './LandingPage';
import { theme } from '../styles/theme';
import { I18nProvider } from '../i18n/I18nContext';
import { dictionaries, type UiLocale } from '../i18n/translations';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const show = (locale: UiLocale = 'fr') =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <I18nProvider locale={locale}>
          <LandingPage />
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );

/**
 * Le premier rendu paie la compilation styled-components de toute la page
 * (~800 lignes) : il frôle la limite par défaut de 5 s et rendait ce fichier
 * instable. Les rendus suivants retombent sous la seconde.
 */
describe('LandingPage', { timeout: 20_000 }, () => {
  beforeEach(() => navigate.mockClear());

  it('monte et affiche le titre d’accroche', () => {
    show();
    expect(screen.getByRole('heading', { name: dictionaries.fr['landing.hero.title'] })).toBeInTheDocument();
  });

  it('suit la langue de l’interface', () => {
    show('en');
    expect(screen.getByRole('heading', { name: dictionaries.en['landing.hero.title'] })).toBeInTheDocument();
    expect(screen.queryByText(dictionaries.fr['landing.hero.subtitle'])).not.toBeInTheDocument();
  });

  it('envoie vers l’inscription depuis l’appel à l’action principal', async () => {
    show();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(dictionaries.fr['landing.hero.ctaPrimary']) }),
    );
    expect(navigate).toHaveBeenCalledWith('/signup');
  });

  it('envoie vers la connexion depuis la barre de navigation', async () => {
    show();
    await userEvent.click(screen.getByRole('button', { name: dictionaries.fr['landing.nav.login'] }));
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('garde des ancres pour la navigation interne, pas des routes', () => {
    show();
    const barre = within(screen.getByRole('navigation'));
    const lien = barre.getByRole('link', { name: dictionaries.fr['landing.nav.features'] });
    expect(lien).toHaveAttribute('href', '#features');
  });
});
