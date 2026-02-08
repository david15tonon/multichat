import React from "react";
import styled from "styled-components";
import { Logo } from "../atoms/Logo";
import { ChatIllustration } from "../molecules/Illustrations";
import { LoginForm } from "../organisms/LoginForm";

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.yellow};
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.bold};
`;

const LinkText = styled.button`
  background: none;
  border: none;
  font-weight: 700;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
`;

export const LoginScreen = () => (
  <Page>
    <Logo />
    <ChatIllustration />
    <Card>
      <LoginForm
        providers={[
          { id: "google", label: "Google", icon: "google" },
          { id: "apple", label: "Apple", icon: "apple" },
          { id: "x", label: "X", icon: "x" },
        ]}
      />
    </Card>
    <LinkText type="button">Mot de passe oublié ?</LinkText>
    <LinkText type="button">S'inscrire</LinkText>
  </Page>
);
