import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

const InputWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const InputContainer = styled.div<{ $hasIcon: boolean; $error: boolean; theme: Theme }>`
  position: relative;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme, $error }) => 
    $error ? theme.colors.status.error : theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  transition: all ${({ theme }) => theme.transitions.normal};
  padding-left: ${({ $hasIcon, theme }) => ($hasIcon ? theme.spacing.xl : '0')};

  &:focus-within {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.neutral.gray};
  pointer-events: none;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.black};
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.gray};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.status.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, errorMessage, fullWidth = false, icon, label, ...props }, ref) => {
    return (
      <InputWrapper $fullWidth={fullWidth}>
        {label && <Label>{label}</Label>}
        <InputContainer $hasIcon={!!icon} $error={error}>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <StyledInput ref={ref} {...props} />
        </InputContainer>
        {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';
