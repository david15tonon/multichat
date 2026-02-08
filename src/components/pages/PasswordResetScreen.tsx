import React from "react";
import styled from "styled-components";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { PersonSearchIllustration } from "../molecules/Illustrations";

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.yellow};
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
`;

const Copy = styled.p`
  margin: 0;
  font-weight: 600;
`;

export const PasswordResetScreen = () => (
  <Page>
    <PersonSearchIllustration size={170} />
    <Title>Mot de passe oublié ?</Title>
    <Copy>Entrez votre email pour recevoir un lien de réinitialisation.</Copy>
    <Input placeholder="Email" type="email" />
    <Button $fullWidth>Envoyer le lien</Button>
    <Button $variant="ghost" $fullWidth>
      S'inscrire
    </Button>
  </Page>
);
