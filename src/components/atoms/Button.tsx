import styled, { css } from "styled-components";

export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  $variant?: ButtonVariant;
  $fullWidth?: boolean;
}

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.violet};
    color: #ffffff;
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.textPrimary};
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
  `,
};

export const Button = styled.button<ButtonProps>`
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  padding: 16px 20px;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  ${({ $variant = "primary" }) => variantStyles[$variant]}

  &:active {
    transform: translate(2px, 2px);
    box-shadow: ${({ theme }) => theme.shadows.soft};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
