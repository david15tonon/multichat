import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it } from 'vitest';
import { LocaleSwitcher } from './LocaleSwitcher';
import { theme } from '../../styles/theme';
import { I18nProvider, useT } from '../../i18n/I18nContext';
import { dictionaries } from '../../i18n/translations';

/** Témoin : prouve que la bascule change réellement les textes affichés. */
function Temoin() {
  const t = useT();
  return <span data-testid="accroche">{t('landing.hero.title')}</span>;
}

const afficher = () =>
  render(
    <ThemeProvider theme={theme}>
      <I18nProvider>
        <LocaleSwitcher />
        <Temoin />
      </I18nProvider>
    </ThemeProvider>,
  );

const bouton = (locale: 'en' | 'fr') =>
  screen.getByRole('button', {
    name: dictionaries.en[locale === 'en' ? 'landing.nav.switchToEn' : 'landing.nav.switchToFr'],
  });

describe('LocaleSwitcher', () => {
  beforeEach(() => window.localStorage.clear());

  it('propose les deux langues d’interface', () => {
    afficher();

    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('FR')).toBeInTheDocument();
  });

  it('marque la langue courante comme sélectionnée', () => {
    afficher();

    expect(bouton('en')).toHaveAttribute('aria-pressed', 'true');
    expect(bouton('fr')).toHaveAttribute('aria-pressed', 'false');
  });

  it('bascule l’interface en français au clic', async () => {
    afficher();
    expect(screen.getByTestId('accroche')).toHaveTextContent(
      dictionaries.en['landing.hero.title'],
    );

    await userEvent.click(bouton('fr'));

    expect(screen.getByTestId('accroche')).toHaveTextContent(
      dictionaries.fr['landing.hero.title'],
    );
    // Le libellé accessible suit la langue : il est maintenant en français.
    expect(
      screen.getByRole('button', { name: dictionaries.fr['landing.nav.switchToEn'] }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('mémorise le choix pour la visite suivante', async () => {
    afficher();

    await userEvent.click(bouton('fr'));

    expect(window.localStorage.getItem('multichat.ui-locale')).toBe('fr');
  });
});
