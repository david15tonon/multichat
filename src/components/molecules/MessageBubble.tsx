import React, { useState } from 'react';
import styled from 'styled-components';
import { Message } from '../../types';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { Theme } from '../../styles/theme';

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

const BubbleWrapper = styled.div<{ $isOwn: boolean; theme: Theme }>`
  background-color: ${({ theme, $isOwn }) =>
    $isOwn ? theme.colors.primary.yellow : theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.neutral.black};
  position: relative;
  max-width: 100%;
`;

const MessageText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.neutral.black};
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

const TranslatedText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.neutral.gray};
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

const StatusIndicator = styled.div<{ $status: Message['status']; theme: Theme }>`
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
  color: ${({ theme }) => theme.colors.neutral.white};
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
  const [showTranslatedText, setShowTranslatedText] = useState(showTranslation);

  const hasTranslation = message.translatedContent && message.translatedContent !== message.content;

  return (
    <Container $isOwn={isOwn}>
      {!isOwn && <Avatar src={senderAvatar} alt={senderName} size="small" />}

      <BubbleContent $isOwn={isOwn}>
        <BubbleWrapper $isOwn={isOwn}>
          <MessageText>{message.content}</MessageText>

          {hasTranslation && showTranslatedText && (
            <>
              <TranslationDivider />
              <TranslationLabel>
                <Icon name="translate" size={12} />
                {message.translationStatus === 'translating'
                  ? 'Traduction en cours...'
                  : 'AUTO-TRADUIT DU ' + message.originalLanguage.toUpperCase()}
              </TranslationLabel>
              <TranslatedText>{message.translatedContent}</TranslatedText>
            </>
          )}

          {message.translationStatus === 'failed' && (
            <ErrorBanner>
              <Icon name="alert" size={12} />
              TRANSLATION FAILED
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
