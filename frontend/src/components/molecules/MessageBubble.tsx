import React, { useState } from 'react';
import styled from 'styled-components';
import { useT } from '../../i18n/I18nContext';
import { Message } from '../../types';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  showTranslation?: boolean;
}

const Container = styled.div<{ $isOwn: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-direction: ${({ $isOwn }) => ($isOwn ? 'row-reverse' : 'row')};
  align-items: flex-end;
  max-width: 80%;
  align-self: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
`;

const BubbleContent = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
  flex: 1;
`;

const BubbleWrapper = styled.div<{ $isOwn: boolean;  }>`
  background-color: ${({ theme, $isOwn }) =>
    $isOwn ? theme.colors.primary.yellow : theme.colors.neutral.white};
  color: ${({ theme, $isOwn }) =>
    $isOwn ? theme.colors.neutral.onBright : theme.colors.neutral.black};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.neutral.black};
  position: relative;
  max-width: 100%;
`;

const MessageText = styled.p`
  margin: 0;
  color: inherit;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 1.5;
  word-wrap: break-word;
`;

const TranslationDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.neutral.lightGray};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  position: relative;
`;

const TranslationLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.primary.purple};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-style: italic;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const TranslationToggle = styled(TranslationLabel).attrs({ as: 'button' })`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: inherit;

  &:hover {
    text-decoration: underline;
  }
`;

const TranslatedText = styled.p`
  margin: 0;
  /* Hérite du fond puis s'atténue : lisible sur la bulle jaune comme sur la
     surface sombre, là où une couleur grise figée échouait sur l'une des deux. */
  color: inherit;
  opacity: 0.75;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
  word-wrap: break-word;
  font-style: italic;
`;

const Timestamp = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.gray};
  margin: 0 ${({ theme }) => theme.spacing.xs};
`;

const StatusIndicator = styled.div<{ $status: Message['status'];  }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'sending':
        return theme.colors.neutral.gray;
      case 'sent':
        return theme.colors.status.online;
      case 'delivered':
        return theme.colors.status.online;
      case 'read':
        return theme.colors.primary.purple;
      case 'failed':
        return theme.colors.status.error;
      default:
        return theme.colors.neutral.gray;
    }
  }};
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.neutral.onAccent};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusIcon = (status: Message['status']) => {
  switch (status) {
    case 'sending':
      return 'refresh';
    case 'failed':
      return 'alert';
    default:
      return 'check';
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderName,
  senderAvatar,
  showTranslation = true,
}) => {
  const t = useT();
  const [showTranslatedText, setShowTranslatedText] = useState(showTranslation);

  const hasTranslation = Boolean(
    message.translatedContent && message.translatedContent !== message.content,
  );

  // Un message REÇU s'ouvre sur la langue du lecteur : c'est tout l'intérêt du
  // produit. L'original passe dessous, consultable d'un clic.
  // Un message ENVOYÉ garde en tête ce qu'on a écrit, et montre dessous ce que
  // le destinataire va lire.
  const primaryText = !isOwn && hasTranslation ? message.translatedContent! : message.content;
  const secondaryText = !isOwn && hasTranslation ? message.content : message.translatedContent;

  const secondaryLabel = isOwn
    ? t('bubble.translatedTo', { language: (message.targetLanguage ?? '').toUpperCase() })
    : t('bubble.originalIn', { language: message.originalLanguage.toUpperCase() });

  return (
    <Container $isOwn={isOwn}>
      {!isOwn && <Avatar src={senderAvatar} alt={senderName} size="small" />}

      <BubbleContent $isOwn={isOwn}>
        <BubbleWrapper $isOwn={isOwn}>
          <MessageText>{primaryText}</MessageText>

          {hasTranslation && (
            <>
              <TranslationDivider />
              <TranslationToggle
                type="button"
                onClick={() => setShowTranslatedText((shown) => !shown)}
                aria-expanded={showTranslatedText}
                title={showTranslatedText ? t('bubble.hideOriginal') : t('bubble.showOriginal')}
              >
                <Icon name="translate" size={12} />
                {message.translationStatus === 'translating'
                  ? t('bubble.translating')
                  : secondaryLabel}
              </TranslationToggle>
              {showTranslatedText && <TranslatedText>{secondaryText}</TranslatedText>}
            </>
          )}

          {message.translationStatus === 'failed' && (
            <ErrorBanner>
              <Icon name="alert" size={12} />
              {t('bubble.failed')}
            </ErrorBanner>
          )}
        </BubbleWrapper>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Timestamp>{formatTime(message.timestamp)}</Timestamp>
          {isOwn && (
            <StatusIndicator $status={message.status}>
              <Icon name={getStatusIcon(message.status)} size={12} />
            </StatusIndicator>
          )}
        </div>
      </BubbleContent>
    </Container>
  );
};
