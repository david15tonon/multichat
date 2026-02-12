import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'neutral';
  size?: 'small' | 'medium';
}

const StyledBadge = styled.span<{
  $variant: BadgeProps['variant'];
  $size: BadgeProps['size'];
  theme: Theme;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};

  ${({ $size, theme }) => {
    switch ($size) {
      case 'small':
        return `
          min-width: 18px;
          height: 18px;
          padding: 0 ${theme.spacing.xs};
          font-size: 10px;
        `;
      case 'medium':
        return `
          min-width: 24px;
          height: 24px;
          padding: 0 ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.xs};
        `;
      default:
        return '';
    }
  }}

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background-color: ${theme.colors.primary.purple};
          color: ${theme.colors.neutral.white};
        `;
      case 'success':
        return `
          background-color: ${theme.colors.status.online};
          color: ${theme.colors.neutral.white};
        `;
      case 'error':
        return `
          background-color: ${theme.colors.status.error};
          color: ${theme.colors.neutral.white};
        `;
      case 'warning':
        return `
          background-color: ${theme.colors.status.warning};
          color: ${theme.colors.neutral.white};
        `;
      case 'neutral':
        return `
          background-color: ${theme.colors.neutral.gray};
          color: ${theme.colors.neutral.white};
        `;
      default:
        return '';
    }
  }}
`;

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
}) => {
  return (
    <StyledBadge $variant={variant} $size={size}>
      {children}
    </StyledBadge>
  );
};
