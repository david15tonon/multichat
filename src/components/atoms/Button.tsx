import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'social';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $fullWidth: boolean;
  $loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  transition: all ${({ theme }) => theme.transitions.normal};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  position: relative;
  overflow: hidden;
  cursor: ${({ disabled, $loading }) => (disabled || $loading ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled, $loading }) => (disabled || $loading ? 0.6 : 1)};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  /* Size variants */
  ${({ $size, theme }) => {
    switch ($size) {
      case 'small':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 36px;
        `;
      case 'large':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 56px;
        `;
      default: // medium
        return `
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.base};
          min-height: 48px;
        `;
    }
  }}

  /* Color variants */
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background-color: ${theme.colors.primary.purple};
          color: ${theme.colors.neutral.white};
          box-shadow: 4px 4px 0 ${theme.colors.neutral.black};
          
          &:hover:not(:disabled) {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 ${theme.colors.neutral.black};
          }
          
          &:active:not(:disabled) {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 ${theme.colors.neutral.black};
          }
        `;
      case 'secondary':
        return `
          background-color: ${theme.colors.primary.yellow};
          color: ${theme.colors.neutral.black};
          box-shadow: 4px 4px 0 ${theme.colors.neutral.black};
          
          &:hover:not(:disabled) {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 ${theme.colors.neutral.black};
          }
          
          &:active:not(:disabled) {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 ${theme.colors.neutral.black};
          }
        `;
      case 'outline':
        return `
          background-color: ${theme.colors.neutral.white};
          color: ${theme.colors.neutral.black};
          box-shadow: 4px 4px 0 ${theme.colors.neutral.black};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.neutral.offWhite};
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 ${theme.colors.neutral.black};
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${theme.colors.neutral.black};
          border: none;
          box-shadow: none;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.neutral.lightGray};
          }
        `;
      case 'social':
        return `
          background-color: ${theme.colors.neutral.white};
          color: ${theme.colors.neutral.black};
          box-shadow: 4px 4px 0 ${theme.colors.neutral.black};
          padding: ${theme.spacing.md};
          
          &:hover:not(:disabled) {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 ${theme.colors.neutral.black};
          }
        `;
      default:
        return '';
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  ariaLabel,
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
    >
      {loading ? <LoadingSpinner /> : icon}
      {children}
    </StyledButton>
  );
};
