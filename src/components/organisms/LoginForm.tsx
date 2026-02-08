import React from "react";
import styled from "styled-components";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { SocialAuthButton } from "../molecules/SocialAuthButton";
import type { SocialProvider } from "../../types";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 2px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

interface LoginFormProps {
  providers: SocialProvider[];
  onSubmit?: (data: { email: string; password: string }) => void;
}

export const LoginForm = ({ providers, onSubmit }: LoginFormProps) => {
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit?.({
          email: String(formData.get("email")),
          password: String(formData.get("password")),
        });
      }}
    >
      <Input name="email" placeholder="Email" type="email" required />
      <Input name="password" placeholder="Mot de passe" type="password" required />
      <Button $fullWidth type="submit">
        Connexion
      </Button>
      <Divider>ou</Divider>
      <Row>
        {providers.map((provider) => (
          <SocialAuthButton key={provider.id} provider={provider} />
        ))}
      </Row>
    </Form>
  );
};
