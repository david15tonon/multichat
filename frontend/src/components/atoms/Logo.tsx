import React from 'react';
import styled from 'styled-components';

export interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'default' | 'white';
}

const LogoContainer = styled.div<{ $size: LogoProps['size'] }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return 'height: 24px;';
      case 'large':
        return 'height: 64px;';
      default: // medium
        return 'height: 40px;';
    }
  }}
`;

const LogoText = styled.span<{ $size: LogoProps['size']; $variant: LogoProps['variant'] }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  color: ${({ theme, $variant }) =>
    $variant === 'white' ? theme.colors.neutral.white : theme.colors.neutral.black};

  ${({ $size, theme }) => {
    switch ($size) {
      case 'small':
        return `font-size: ${theme.typography.fontSize.lg};`;
      case 'large':
        return `font-size: ${theme.typography.fontSize['4xl']};`;
      default: // medium
        return `font-size: ${theme.typography.fontSize['2xl']};`;
    }
  }}
`;

const LogoIcon = styled.div<{ $size: LogoProps['size'] }>`
  position: relative;
  flex-shrink: 0;

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return 'width: 24px; height: 24px;';
      case 'large':
        return 'width: 64px; height: 64px;';
      default: // medium
        return 'width: 40px; height: 40px;';
    }
  }}
`;

const ChatBubble = styled.div<{ $size: LogoProps['size'] }>`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          width: 16px;
          height: 12px;
          top: 2px;
          left: 2px;
        `;
      case 'large':
        return `
          width: 42px;
          height: 32px;
          top: 5px;
          left: 5px;
        `;
      default: // medium
        return `
          width: 26px;
          height: 20px;
          top: 3px;
          left: 3px;
        `;
    }
  }}

  &::before,
  &::after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.neutral.black};
    border-radius: 50%;
  }

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          &::before, &::after {
            width: 2px;
            height: 2px;
            top: 4px;
          }
          &::before { left: 3px; }
          &::after { right: 3px; }
        `;
      case 'large':
        return `
          &::before, &::after {
            width: 6px;
            height: 6px;
            top: 11px;
          }
          &::before { left: 8px; }
          &::after { right: 8px; }
        `;
      default: // medium
        return `
          &::before, &::after {
            width: 4px;
            height: 4px;
            top: 7px;
          }
          &::before { left: 5px; }
          &::after { right: 5px; }
        `;
    }
  }}
`;

const PersonIcon = styled.div<{ $size: LogoProps['size'] }>`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.primary.orange};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          width: 12px;
          height: 12px;
          bottom: 0;
          right: 0;
        `;
      case 'large':
        return `
          width: 32px;
          height: 32px;
          bottom: 0;
          right: 0;
        `;
      default: // medium
        return `
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
        `;
    }
  }}
`;

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  variant = 'default',
}) => {
  return (
    <LogoContainer $size={size}>
      <LogoIcon $size={size}>
        <ChatBubble $size={size} />
        <PersonIcon $size={size} />
      </LogoIcon>
      {showText && (
        <LogoText $size={size} $variant={variant}>
          MultiChat
        </LogoText>
      )}
    </LogoContainer>
  );
};
