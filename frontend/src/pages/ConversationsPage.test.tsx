import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConversationsPage, type ConversationsPageProps } from './ConversationsPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import type { UserPublic } from '../lib/api';

const user = (id: string, name: string): UserPublic => ({
  id,
  full_name: name,
  avatar_url: null,
  preferred_language: 'en',
  is_online: false,
  last_seen: null,
});

const page = (props: Partial<ConversationsPageProps> = {}) => (
  <ThemeProvider>
    <I18nProvider locale="fr">
      <ConversationsPage
        currentUserId="moi"
        conversations={[]}
        onOpenConversation={vi.fn()}
        onSearchUsers={vi.fn().mockResolvedValue([])}
        onStartConversation={vi.fn()}
        {...props}
      />
    </I18nProvider>
  </ThemeProvider>
);

const searchField = () => screen.getByPlaceholderText(/rechercher/i);

describe('ConversationsPage — recherche débouncée', { timeout: 20_000 }, () => {
  it('n’interroge pas l’API sous deux caractères', async () => {
    const onSearchUsers = vi.fn().mockResolvedValue([]);
    const u = userEvent.setup();
    render(page({ onSearchUsers }));

    await u.type(searchField(), 'e');

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(onSearchUsers).not.toHaveBeenCalled();
  });

  it('affiche les résultats du terme saisi', async () => {
    const onSearchUsers = vi.fn().mockResolvedValue([user('elena', 'Elena Rossi')]);
    const u = userEvent.setup();
    render(page({ onSearchUsers }));

    await u.type(searchField(), 'ele');

    expect(await screen.findByText('Elena Rossi')).toBeInTheDocument();
    expect(onSearchUsers).toHaveBeenCalledWith('ele');
  });

  it('n’affiche pas les résultats d’un terme précédent', async () => {
    // Les résultats portent leur terme : ceux d'« ele » ne doivent plus
    // s'afficher dès que la recherche porte sur « elena ».
    const onSearchUsers = vi
      .fn()
      .mockImplementation(async (term: string) =>
        term === 'ele' ? [user('elena', 'Elena Rossi')] : new Promise(() => []),
      );
    const u = userEvent.setup();
    render(page({ onSearchUsers }));

    await u.type(searchField(), 'ele');
    expect(await screen.findByText('Elena Rossi')).toBeInTheDocument();

    await u.type(searchField(), 'na');

    await waitFor(() => expect(screen.queryByText('Elena Rossi')).not.toBeInTheDocument());
    expect(screen.getByText('Recherche…')).toBeInTheDocument();
  });

  it('efface la recherche une fois la conversation ouverte', async () => {
    const onSearchUsers = vi.fn().mockResolvedValue([user('elena', 'Elena Rossi')]);
    const onStartConversation = vi.fn().mockResolvedValue(undefined);
    const u = userEvent.setup();
    render(page({ onSearchUsers, onStartConversation }));

    await u.type(searchField(), 'ele');
    await u.click(await screen.findByRole('button', { name: 'Écrire' }));

    await waitFor(() => expect(screen.queryByText('Elena Rossi')).not.toBeInTheDocument());
    expect((searchField() as HTMLInputElement).value).toBe('');
  });

  it('signale un échec de recherche sans vider la saisie', async () => {
    const onSearchUsers = vi.fn().mockRejectedValue(new Error('réseau coupé'));
    const u = userEvent.setup();
    render(page({ onSearchUsers }));

    await u.type(searchField(), 'ele');

    expect(await screen.findByText('réseau coupé')).toBeInTheDocument();
    expect((searchField() as HTMLInputElement).value).toBe('ele');
  });
});
