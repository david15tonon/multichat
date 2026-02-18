import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  isOnline?: boolean;
  initials?: string;
  onClick?: () => void;
}

const AvatarContainer = styled.div<{
  $size: AvatarProps['size'];
  $clickable: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  background-color: ${({ theme }) => theme.colors.primary.orange};
  color: ${({ theme }) => theme.colors.neutral.white};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};

  ${({ $size, theme }) => {
    switch ($size) {
      case 'small':
        return `
          width: 32px;
          height: 32px;
          font-size: ${theme.typography.fontSize.xs};
        `;
      case 'medium':
        return `
          width: 48px;
          height: 48px;
          font-size: ${theme.typography.fontSize.base};
        `;
      case 'large':
        return `
          width: 64px;
          height: 64px;
          font-size: ${theme.typography.fontSize.xl};
        `;
      case 'xlarge':
        return `
          width: 96px;
          height: 96px;
          font-size: ${theme.typography.fontSize['3xl']};
        `;
      default:
        return '';
    }
  }}

  ${({ $clickable }) =>
    $clickable &&
    `
    transition: transform 0.2s ease;
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OnlineIndicator = styled.div<{ $size: AvatarProps['size'];  }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '10px';
      case 'medium':
        return '14px';
      case 'large':
        return '18px';
      case 'xlarge':
        return '24px';
      default:
        return '14px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '10px';
      case 'medium':
        return '14px';
      case 'large':
        return '18px';
      case 'xlarge':
        return '24px';
      default:
        return '14px';
    }
  }};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.status.online};
  border: 2px solid ${({ theme }) => theme.colors.neutral.white};
`;

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'medium',
  isOnline = false,
  initials,
  onClick,
}) => {
  const getInitials = () => {
    if (initials) return initials;
    if (alt) {
      const words = alt.split(' ');
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return alt.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <AvatarContainer $size={size} $clickable={!!onClick} onClick={onClick}>
      {src ? <AvatarImage src={src} alt={alt} /> : getInitials()}
      {isOnline && <OnlineIndicator $size={size} />}
    </AvatarContainer>
  );
};
