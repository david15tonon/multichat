import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { MessageBubble } from './MessageBubble';
import { theme } from '../../styles/theme';
import type { Message } from '../../types';

const message: Message = {
  id: 'm1',
  senderId: 'elena',
  receiverId: 'david',
  content: 'Hi David!',
  originalLanguage: 'en',
  translatedContent: 'Salut David !',
  targetLanguage: 'fr',
  tone: 'standard',
  timestamp: new Date('2026-10-07T09:11:00Z'),
  status: 'sent',
  translationStatus: 'translated',
};

const show = (props: Partial<Parameters<typeof MessageBubble>[0]> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <MessageBubble message={message} isOwn={false} senderName="Elena" {...props} />
    </ThemeProvider>,
  );

describe('MessageBubble — priorité des langues', () => {
  it('affiche d’abord MA langue sur un message reçu', () => {
    // Le lecteur francophone doit lire le français en premier ; c'est tout
    // l'intérêt du produit. L'anglais d'origine passe en dessous.
    show({ isOwn: false });

    expect(screen.getByText('Salut David !')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ORIGINAL EN EN/i })).toBeInTheDocument();
  });

  it('relègue l’original sous le repli sur un message reçu', () => {
    show({ isOwn: false, showTranslation: false });

    expect(screen.getByText('Salut David !')).toBeInTheDocument();
    expect(screen.queryByText('Hi David!')).not.toBeInTheDocument();
  });

  it('garde en tête ce que J’AI écrit sur un message envoyé', () => {
    show({ isOwn: true });

    expect(screen.getByText('Hi David!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /TRADUIT VERS FR/i })).toBeInTheDocument();
  });

  it('montre sous le repli ce que le destinataire lira', () => {
    show({ isOwn: true });

    expect(screen.getByText('Salut David !')).toBeInTheDocument();
  });

  it('bascule l’affichage de la seconde version au clic', async () => {
    const user = userEvent.setup();
    show({ isOwn: false });

    expect(screen.queryByText('Hi David!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ORIGINAL EN EN/i }));
    expect(screen.queryByText('Hi David!')).not.toBeInTheDocument();
  });

  it('affiche le seul texte disponible quand rien n’est traduit', () => {
    const brut: Message = { ...message, translatedContent: undefined, translationStatus: 'failed' };
    render(
      <ThemeProvider theme={theme}>
        <MessageBubble message={brut} isOwn={false} senderName="Elena" />
      </ThemeProvider>,
    );

    expect(screen.getByText('Hi David!')).toBeInTheDocument();
    expect(screen.getByText(/TRADUCTION INDISPONIBLE/i)).toBeInTheDocument();
  });
});
