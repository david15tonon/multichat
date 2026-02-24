import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageTone } from '../../types';
import { Icon } from '../atoms/Icon';
import { ToneSelector } from '../molecules/ToneSelector';

export interface MessageComposerProps {
  onSend: (message: string, tone: MessageTone) => void;
  isConnected?: boolean;
  isTranslating?: boolean;
  placeholder?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.offWhite};
  border-top: 3px solid ${({ theme }) => theme.colors.neutral.black};
`;

const InputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-end;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const TextArea = styled.textarea<{ $isConnected: boolean }>`
  width: 100%;
  min-height: 48px;
  max-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  padding-right: 48px;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.neutral.black};
  resize: none;
  outline: none;
  box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.neutral.black};
  transition: all ${({ theme }) => theme.transitions.normal};
  opacity: ${({ $isConnected }) => ($isConnected ? 1 : 0.6)};

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.gray};
  }

  &:focus {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 ${({ theme }) => theme.colors.neutral.black};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const EmojiButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  bottom: ${({ theme }) => theme.spacing.md};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.neutral.gray};
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.1);
  }
`;

const SendButton = styled.button<{ $canSend: boolean }>`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $canSend }) =>
    $canSend ? theme.colors.primary.purple : theme.colors.neutral.gray};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;
  cursor: ${({ $canSend }) => ($canSend ? 'pointer' : 'not-allowed')};
  color: ${({ theme }) => theme.colors.neutral.white};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  transition: all ${({ theme }) => theme.transitions.normal};
  opacity: ${({ $canSend }) => ($canSend ? 1 : 0.6)};

  &:hover:not(:disabled) {
    transform: ${({ $canSend }) => ($canSend ? 'translate(-2px, -2px)' : 'none')};
    box-shadow: ${({ $canSend }) => ($canSend ? '6px 6px 0 #000' : '4px 4px 0 #000')};
  }

  &:active:not(:disabled) {
    transform: translate(0, 0);
    box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

const ToneRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PreviewArea = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 2px solid ${({ theme }) => theme.colors.primary.purple};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const PreviewLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.purple};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-transform: uppercase;
`;

const PreviewText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
  font-style: italic;
`;

const DisconnectedMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.status.warning};
  color: ${({ theme }) => theme.colors.neutral.white};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  isConnected = true,
  isTranslating = false,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState<MessageTone>('standard');
  const [showPreview, setShowPreview] = useState(false);

  const canSend = message.trim().length > 0 && isConnected && !isTranslating;

  const handleSend = () => {
    if (canSend) {
      onSend(message, selectedTone);
      setMessage('');
      setShowPreview(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container>
      {!isConnected && (
        <DisconnectedMessage>
          <Icon name="offline" size={16} /> Reconnecting...
        </DisconnectedMessage>
      )}

      <ToneRow>
        <ToneSelector selected={selectedTone} onChange={setSelectedTone} variant="compact" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Icon name="globe" size={20} />
        </button>
      </ToneRow>

      {showPreview && message.trim() && (
        <PreviewArea>
          <PreviewLabel>
            {selectedTone.toUpperCase()}
            <span>PRÉVISUALISATION (EN)</span>
          </PreviewLabel>
          <PreviewText>"{message}"</PreviewText>
        </PreviewArea>
      )}

      <InputRow>
        <InputWrapper>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={!isConnected || isTranslating}
            $isConnected={isConnected}
            rows={1}
          />
          <EmojiButton>
            <Icon name="smile" size={20} />
          </EmojiButton>
        </InputWrapper>

        <SendButton $canSend={canSend} onClick={handleSend} disabled={!canSend}>
          <Icon name="send" size={24} />
        </SendButton>
      </InputRow>
    </Container>
  );
};
