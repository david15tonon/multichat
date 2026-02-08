import styled from "styled-components";

interface IconButtonProps {
  $variant?: "solid" | "outline";
}

export const IconButton = styled.button<IconButtonProps>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 3px solid ${({ theme }) => theme.colors.border};
  background: ${({ $variant, theme }) =>
    $variant === "solid" ? theme.colors.yellow : theme.colors.surface};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  cursor: pointer;

  &:active {
    transform: translate(2px, 2px);
    box-shadow: ${({ theme }) => theme.shadows.none};
  }
`;
