import React from 'react';
import styled from 'styled-components';
import { Icon } from '../atoms/Icon';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
  showThemeToggle?: boolean;
  userAvatar?: string;
  isOnline?: boolean;
  onBackClick?: () => void;
  onSettingsClick?: () => void;
  onThemeToggle?: () => void;
  onAvatarClick?: () => void;
  rightAction?: React.ReactNode;
  backgroundColor?: string;
}

const HeaderContainer = styled.header<{ $backgroundColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme, $backgroundColor }) =>
    $backgroundColor || theme.colors.primary.yellow};
  border-bottom: 3px solid ${({ theme }) => theme.colors.neutral.black};
  min-height: 72px;
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const IconButton = styled.button`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  color: ${({ theme }) => theme.colors.neutral.black};
  margin: 0;
`;

const Subtitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const OnlineIndicator = styled.span`
  color: ${({ theme }) => theme.colors.status.online};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ConnectionBadge = styled.div<{ $isOnline: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $isOnline }) =>
    $isOnline ? theme.colors.status.online : theme.colors.status.error};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme, $isOnline }) =>
      $isOnline ? theme.colors.status.online : theme.colors.status.error};
  }
`;

export const Header: React.FC<HeaderProps> = ({
  title = 'MULTICHAT',
  subtitle,
  showBackButton = false,
  showSettingsButton = false,
  showThemeToggle = true,
  userAvatar,
  isOnline,
  onBackClick,
  onSettingsClick,
  onThemeToggle,
  onAvatarClick,
  rightAction,
  backgroundColor,
}) => {
  return (
    <HeaderContainer $backgroundColor={backgroundColor}>
      <LeftSection>
        {showBackButton && (
          <IconButton onClick={onBackClick}>
            <Icon name="arrow-left" size={24} />
          </IconButton>
        )}

        {userAvatar && <Avatar src={userAvatar} size="medium" isOnline={isOnline !== false} onClick={onAvatarClick} />}

        <TitleSection>
          <Title>{title}</Title>
          {subtitle && (
            <Subtitle>
              {isOnline !== undefined && (
                <OnlineIndicator>{isOnline ? 'EN LIGNE' : 'HORS LIGNE'}</OnlineIndicator>
              )}
              {subtitle}
            </Subtitle>
          )}
        </TitleSection>
      </LeftSection>

      <RightSection>
        {isOnline !== undefined && (
          <ConnectionBadge $isOnline={isOnline}>
            {isOnline ? 'CONNECTED' : 'NO CONNECTION'}
          </ConnectionBadge>
        )}

        {rightAction}

        {showThemeToggle && (
          <IconButton onClick={onThemeToggle}>
            <Icon name="moon" size={24} />
          </IconButton>
        )}

        {showSettingsButton && (
          <IconButton onClick={onSettingsClick}>
            <Icon name="settings" size={24} />
          </IconButton>
        )}
      </RightSection>
    </HeaderContainer>
  );
};
