import React, { useState } from 'react';
import styled from 'styled-components';
import { Logo, Button, Input, Icon } from '../components/atoms';

export interface ForgotPasswordPageProps {
  onResetRequest: (email: string) => void;
  onBackToLogin: () => void;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.primary.purple};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 3px 3px 0 ${({ theme }) => theme.colors.neutral.black};

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Illustration = styled.div`
  width: 200px;
  height: 150px;
  background-color: ${({ theme }) => theme.colors.primary.yellow};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* Enveloppe / Email illustration */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 80px;
    background-color: ${({ theme }) => theme.colors.neutral.white};
    border: 3px solid ${({ theme }) => theme.colors.neutral.black};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  &::after {
    content: '✉️';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  color: ${({ theme }) => theme.colors.neutral.black};
  text-align: center;
  margin: 0;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.black};
  text-align: center;
  margin: 0;
  line-height: 1.6;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.div<{ $type: 'error' | 'success' }>`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, $type }) => 
    $type === 'error' ? theme.colors.status.error : theme.colors.status.online};
  color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ResetInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  text-align: center;
`;

const ResetIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary.purple};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.neutral.white};
`;

const ResetEmail = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.purple};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  word-break: break-all;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.neutral.black};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-decoration: underline;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover {
    text-decoration: none;
  }
`;

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onResetRequest,
  onBackToLogin,
  isLoading = false,
  error,
  success,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onResetRequest(email);
  };

  if (submitted && success) {
    return (
      <Container>
        <ThemeToggle>
          <Icon name="moon" size={24} />
        </ThemeToggle>

        <Content>
          <LogoSection>
            <Illustration />
            <Logo size="large" />
          </LogoSection>

          <ResetInfo>
            <ResetIcon>
              <Icon name="check" size={32} />
            </ResetIcon>
            <Title>Email envoyé !</Title>
            <Description>
              Nous avons envoyé un lien de réinitialisation à :
            </Description>
            <ResetEmail>{email}</ResetEmail>
            <Description>
              Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
              Si vous ne voyez pas l'email, vérifiez vos spams.
            </Description>
          </ResetInfo>

          <BackButton onClick={onBackToLogin}>
            ← Retour à la connexion
          </BackButton>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <ThemeToggle>
        <Icon name="moon" size={24} />
      </ThemeToggle>

      <Content>
        <LogoSection>
          <Illustration />
          <Logo size="large" />
        </LogoSection>

        <Title>Mot de passe oublié ?</Title>
        <Description>
          Pas de panique ! Entrez votre email et nous vous enverrons
          un lien pour réinitialiser votre mot de passe.
        </Description>

        {error && (
          <Message $type="error">
            <Icon name="alert" size={20} />
            {error}
          </Message>
        )}

        {success && !submitted && (
          <Message $type="success">
            <Icon name="check" size={20} />
            {success}
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={isLoading}>
            Envoyer le lien
          </Button>
        </Form>

        <BackButton onClick={onBackToLogin}>
          ← Retour à la connexion
        </BackButton>
      </Content>
    </Container>
  );
};