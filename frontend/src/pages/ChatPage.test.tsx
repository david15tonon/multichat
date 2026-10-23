import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChatPage, type ChatPageProps } from './ChatPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import type { Message } from '../types';

const message = (id: string, translationStatus: Message['translationStatus']): Message => ({
  id,
  senderId: 'elena',
  receiverId: 'moi',
  content: 'Hi!',
  originalLanguage: 'en',
  translatedContent: 'Salut !',
  targetLanguage: 'fr',
  tone: 'standard',
  timestamp: new Date('2026-10-23T09:00:00Z'),
  status: 'sent',
  translationStatus,
});

const page = (props: Partial<ChatPageProps> = {}) => (
  <ThemeProvider>
    <I18nProvider locale="fr">
      <ChatPage
        currentUserId="moi"
        contactName="Elena"
        messages={[]}
        onSendMessage={vi.fn()}
        {...props}
      />
    </I18nProvider>
  </ThemeProvider>
);

const modal = () => screen.getByText('Traduction indisponible').closest('div') as HTMLElement;

describe('ChatPage — alerte de traduction', { timeout: 20_000 }, () => {
  it('reste masquée tant que la connexion tient', () => {
    // Une traduction échouée alors que le socket est vivant ne justifie pas
    // une modale : le serveur réessaie.
    render(page({ messages: [message('m1', 'failed')], isConnected: true }));

    expect(modal()).not.toBeVisible();
  });

  it('s’affiche sur un échec de traduction hors connexion', () => {
    render(page({ messages: [message('m1', 'failed')], isConnected: false }));

    expect(modal()).toBeVisible();
  });

  it('reste fermée après avoir été écartée', async () => {
    const u = userEvent.setup();
    const { rerender } = render(
      page({ messages: [message('m1', 'failed')], isConnected: false }),
    );

    await u.click(screen.getByRole('button', { name: /Réessayer/ }));
    expect(modal()).not.toBeVisible();

    // Un simple nouveau rendu ne doit pas la rouvrir : c'est précisément ce
    // que faisait l'effet qui recopiait l'état.
    rerender(page({ messages: [message('m1', 'failed')], isConnected: false }));
    expect(modal()).not.toBeVisible();
  });

  it('se rouvre sur un nouvel échec', async () => {
    const u = userEvent.setup();
    const { rerender } = render(
      page({ messages: [message('m1', 'failed')], isConnected: false }),
    );
    await u.click(screen.getByRole('button', { name: /Réessayer/ }));

    rerender(
      page({
        messages: [message('m1', 'failed'), message('m2', 'failed')],
        isConnected: false,
      }),
    );

    expect(modal()).toBeVisible();
  });
});
