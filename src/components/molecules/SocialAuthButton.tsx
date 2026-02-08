import React from "react";
import styled from "styled-components";
import type { SocialProvider } from "../../types";

const Button = styled.button`
  flex: 1;
  min-width: 72px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
`;

const Icon = styled.span`
  font-size: 20px;
`;

interface SocialAuthButtonProps {
  provider: SocialProvider;
}

const iconMap = {
  google: "G",
  apple: "",
  x: "X",
};

export const SocialAuthButton = ({ provider }: SocialAuthButtonProps) => (
  <Button type="button" aria-label={`Continue with ${provider.label}`}>
    <Icon>{iconMap[provider.icon]}</Icon>
  </Button>
);
