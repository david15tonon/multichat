import React from "react";
import styled from "styled-components";
import { Logo } from "../atoms/Logo";
import { SignupForm } from "../organisms/SignupForm";

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

export const SignupScreen = () => (
  <Page>
    <Logo />
    <Card>
      <SignupForm />
    </Card>
  </Page>
);
