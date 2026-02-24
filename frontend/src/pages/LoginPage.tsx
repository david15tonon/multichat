import React, { useState } from 'react';
import styled from 'styled-components';
import { Logo, Button, Input, Icon } from '../components/atoms';

export interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSocialLogin: (provider: 'google' | 'apple' | 'twitter') => void;
  onForgotPassword: () => void;
  onSignup: () => void;
  isLoading?: boolean;
  error?: string;
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.primary.yellow};
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
  background-color: ${({ theme }) => theme.colors.primary.orange};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* Simple person illustration */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 100px;
    background-color: ${({ theme }) => theme.colors.neutral.white};
    border-radius: 50% 50% 0 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 50px;
    background-color: ${({ theme }) => theme.colors.neutral.white};
    border-radius: 50%;
  }
`;

const ChatBubbleDecor = styled.div`
  position: absolute;
  top: 20px;
  left: 30px;
  width: 60px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &::before,
  &::after {
    content: '';
    width: 6px;
    height: 6px;
    background-color: ${({ theme }) => theme.colors.neutral.black};
    border-radius: 50%;
  }
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.neutral.black};
  }

  span {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const SocialButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const LinksSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Link = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.neutral.black};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }
`;

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onSocialLogin,
  onForgotPassword,
  onSignup,
  isLoading = false,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <Container>
      <ThemeToggle>
        <Icon name="moon" size={24} />
      </ThemeToggle>

      <Content>
        <LogoSection>
          <Illustration>
            <ChatBubbleDecor />
          </Illustration>
          <Logo size="large" />
        </LogoSection>

        {error && (
          <ErrorMessage>
            <Icon name="alert" size={20} />
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={isLoading}>
            Connexion →
          </Button>
        </Form>

        <Divider>
          <span>OU</span>
        </Divider>

        <SocialButtons>
          <Button
            variant="social"
            onClick={() => onSocialLogin('google')}
            icon={<Icon name="google" size={20} />}
          />
          <Button
            variant="social"
            onClick={() => onSocialLogin('apple')}
            icon={<Icon name="apple" size={20} />}
          />
          <Button
            variant="social"
            onClick={() => onSocialLogin('twitter')}
            icon={<Icon name="x" size={20} />}
          />
        </SocialButtons>

        <LinksSection>
          <Link onClick={onForgotPassword}>Mot de passe oublié ?</Link>
          <Link onClick={onSignup}>S'inscrire</Link>
        </LinksSection>
      </Content>
    </Container>
  );
};
