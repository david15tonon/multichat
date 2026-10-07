import React, { useState } from 'react';
import styled from 'styled-components';
import { useT } from '../i18n/I18nContext';
import { Logo, Button, Input, Icon, VisuallyHidden } from '../components/atoms';

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
  color: ${({ theme }) => theme.colors.neutral.onBright};
  padding: ${({ theme }) => theme.spacing.xl};
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
  color: ${({ theme }) => theme.colors.neutral.onBright};
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
    background-color: ${({ theme }) => theme.colors.neutral.overlay};
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
  color: ${({ theme }) => theme.colors.neutral.onAccent};
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
    background-color: ${({ theme }) => theme.colors.neutral.overlay};
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
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <Container>

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
            placeholder={t('login.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <Input
            type="password"
            placeholder={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={isLoading}>
            {t('login.submit')} →
          </Button>
        </Form>

        <Divider>
          <span>{t('common.or')}</span>
        </Divider>

        <SocialButtons>
          <Button
            variant="social"
            disabled
            title={t('login.socialSoon')}
            onClick={() => onSocialLogin('google')}
            icon={<Icon name="google" size={20} />}
          >
            <VisuallyHidden>{t('login.withGoogle')}</VisuallyHidden>
          </Button>
          <Button
            variant="social"
            disabled
            title={t('login.socialSoon')}
            onClick={() => onSocialLogin('apple')}
            icon={<Icon name="apple" size={20} />}
          >
            <VisuallyHidden>{t('login.withApple')}</VisuallyHidden>
          </Button>
          <Button
            variant="social"
            disabled
            title={t('login.socialSoon')}
            onClick={() => onSocialLogin('twitter')}
            icon={<Icon name="x" size={20} />}
          >
            <VisuallyHidden>{t('login.withX')}</VisuallyHidden>
          </Button>
        </SocialButtons>

        <LinksSection>
          <Link onClick={onForgotPassword}>{t('login.forgot')}</Link>
          <Link onClick={onSignup}>{t('login.signup')}</Link>
        </LinksSection>
      </Content>
    </Container>
  );
};
