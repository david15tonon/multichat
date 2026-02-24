import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Message, MessageTone } from '../types';
import { Header } from '../components/organisms/Header';
import { MessageComposer } from '../components/organisms/MessageComposer';
import { MessageBubble } from '../components/molecules/MessageBubble';

export interface ChatPageProps {
  currentUserId: string;
  contactName: string;
  contactAvatar?: string;
  isOnline?: boolean;
  messages: Message[];
  onSendMessage: (content: string, tone: MessageTone) => void;
  onBackClick?: () => void;
  onVideoCall?: () => void;
  showSettingsButton?: boolean;
  onSettingsClick?: () => void; 
  isConnected?: boolean;
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.neutral.offWhite};
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.white};

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral.lightGray};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral.gray};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.neutral.black};
    }
  }
`;

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const DateBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.black};
  text-transform: uppercase;
`;

const TranslationErrorModal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.colors.primary.purple};
  border: 4px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: 8px 8px 0 ${({ theme }) => theme.colors.neutral.black};
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: ${({ $show }) => ($show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 400px;
  width: 90%;
  color: ${({ theme }) => theme.colors.neutral.white};
  text-align: center;
`;

const ModalIcon = styled.div`
  width: 80px;
  height: 80px;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.purple};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  margin: 0;
`;

const ModalText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin: 0;
  line-height: 1.6;
`;

const VideoCallButton = styled.button`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary.purple};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.neutral.white};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

export const ChatPage: React.FC<ChatPageProps> = ({
  currentUserId,
  contactName,
  contactAvatar,
  isOnline = true,
  messages,
  onSendMessage,
  onBackClick,
  onVideoCall,
  isConnected = true,
  showSettingsButton = false,
  onSettingsClick,
}) => {
  const [showError, setShowError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for translation errors
  useEffect(() => {
    const hasError = messages.some((msg) => msg.translationStatus === 'failed');
    if (hasError && isConnected === false) {
      setShowError(true);
    }
  }, [messages, isConnected]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Container>
      <Header
         title={contactName}
         subtitle="EN LIGNE"
         showBackButton
         showSettingsButton={showSettingsButton}
         onSettingsClick={onSettingsClick}
         isOnline={isConnected}
         userAvatar={contactAvatar}
         onBackClick={onBackClick}
/>

      <MessagesArea>
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <React.Fragment key={date}>
            <DateDivider>
              <DateBadge>
                {date === new Date().toDateString() ? 'AUJOURD\'HUI' : date}
              </DateBadge>
            </DateDivider>
            {msgs.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                senderName={contactName}
                senderAvatar={contactAvatar}
              />
            ))}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </MessagesArea>

      <MessageComposer
        onSend={onSendMessage}
        isConnected={isConnected}
        placeholder="Oui, ça marche parfaitement !"
      />

      <TranslationErrorModal $show={showError}>
        <ModalIcon>
          <Icon name="offline" size={40} />
        </ModalIcon>
        <ModalTitle>Translation Unavailable</ModalTitle>
        <ModalText>
          We couldn't translate that last message. It looks like you've lost your internet connection.
        </ModalText>
        <Button variant="secondary" onClick={() => setShowError(false)}>
          <Icon name="refresh" size={20} />
          Try Again
        </Button>
      </TranslationErrorModal>
    </Container>
  );
};

// Helper imports
import { Icon } from '../components/atoms/Icon';
import { Button } from '../components/atoms/Button';
