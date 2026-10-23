import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPage, type SettingsPageProps } from './SettingsPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';

const page = (props: Partial<SettingsPageProps> = {}) => (
  <ThemeProvider>
    <I18nProvider locale="fr">
      <SettingsPage
        language="fr"
        tone="standard"
        onLanguageChange={vi.fn()}
        onToneChange={vi.fn()}
        {...props}
      />
    </I18nProvider>
  </ThemeProvider>
);

const openAccountTab = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Compte' }));

/** L'onglet Compte n'a qu'un seul champ libre : le nom affiché. */
const nameField = () => screen.getByRole('textbox') as HTMLInputElement;

describe('SettingsPage — brouillon du nom affiché', { timeout: 20_000 }, () => {
  it('reprend le nom arrivé après le montage', async () => {
    // Le profil n'est pas là au premier rendu, il vient de l'API. Le champ
    // doit suivre — c'est ce que faisait l'effet remplacé par un ajustement
    // pendant le rendu.
    const user = userEvent.setup();
    const { rerender } = render(page({ fullName: undefined }));
    await openAccountTab(user);
    expect(nameField().value).toBe('');

    rerender(page({ fullName: 'David Tonon' }));

    expect(nameField().value).toBe('David Tonon');
  });

  it('ne réécrit pas le champ pendant que l’utilisateur tape', async () => {
    // Le nom du profil n'a pas changé : aucune raison d'écraser la saisie.
    const user = userEvent.setup();
    render(page({ fullName: 'David Tonon' }));
    await openAccountTab(user);

    await user.clear(nameField());
    await user.type(nameField(), 'David T.');

    expect(nameField().value).toBe('David T.');
  });

  it('envoie le nom saisi, débarrassé des espaces', async () => {
    const onFullNameChange = vi.fn();
    const user = userEvent.setup();
    render(page({ fullName: 'David', onFullNameChange }));
    await openAccountTab(user);

    await user.clear(nameField());
    await user.type(nameField(), '  David Tonon  ');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onFullNameChange).toHaveBeenCalledWith('David Tonon');
  });
});
