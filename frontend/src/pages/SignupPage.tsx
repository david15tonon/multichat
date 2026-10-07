import React, { useState } from 'react';
import styled from 'styled-components';
import { useThemeMode } from '../contexts/ThemeContext';
import { Logo, Button, Input, Icon, VisuallyHidden } from '../components/atoms';
import { LanguagePicker } from '../components/molecules/LanguagePicker';
import type { Language } from '../types';

export interface SignupPageProps {
  onSignup: (name: string, email: string, password: string, language: Language) => void;
  onSocialSignup: (provider: 'google' | 'apple' | 'twitter') => void;
  onLoginClick: () => void;
  onTermsClick: () => void;
  onPrivacyClick: () => void;
  isLoading?: boolean;
  error?: string;
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.primary.orange};
  color: ${({ theme }) => theme.colors.neutral.onBright};
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
  background-color: ${({ theme }) => theme.colors.primary.purple};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* Groupe de personnes */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 30%;
    transform: translateX(-50%);
    width: 60px;
    height: 80px;
    background-color: ${({ theme }) => theme.colors.neutral.white};
    border-radius: 50% 50% 0 0;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 30%;
    transform: translateX(50%);
    width: 60px;
    height: 80px;
    background-color: ${({ theme }) => theme.colors.neutral.white};
    border-radius: 50% 50% 0 0;
  }
`;

const WelcomeBadge = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.black};
  z-index: 1;
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

const PasswordRequirements = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.offWhite};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const RequirementItem = styled.div<{ $met: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme, $met }) => 
    $met ? theme.colors.status.online : theme.colors.neutral.gray};
  margin: ${({ theme }) => theme.spacing.xs} 0;

  svg {
    width: 16px;
    height: 16px;
  }
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

const TermsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const TermsLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.neutral.black};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.neutral.black};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }
`;

export const SignupPage: React.FC<SignupPageProps> = ({
  onSignup,
  onSocialSignup,
  onLoginClick,
  onTermsClick,
  onPrivacyClick,
  isLoading = false,
  error,
}) => {
  const { resolved, toggle: toggleTheme } = useThemeMode();
  const isDark = resolved === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation du mot de passe
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    match: !!password && !!confirmPassword && password === confirmPassword,
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Le backend applique `en` par défaut : sans ce choix, un francophone
  // recevrait ses messages traduits vers l'anglais. On pré-remplit avec la
  // langue du navigateur quand elle fait partie des langues supportées.
  const [language, setLanguage] = useState<Language>(() => {
    const supported: Language[] = ['fr', 'en', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ar'];
    const navigatorLanguage = navigator.language.slice(0, 2) as Language;
    return supported.includes(navigatorLanguage) ? navigatorLanguage : 'fr';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordValid) {
      onSignup(name, email, password, language);
    }
  };

  return (
    <Container>
      <ThemeToggle
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={24} />
      </ThemeToggle>

      <Content>
        <LogoSection>
          <Illustration>
            <WelcomeBadge>BIENVENUE !</WelcomeBadge>
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
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

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

          <Input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
          />

          <LanguagePicker
            selected={language}
            onChange={setLanguage}
            label="Votre langue — vous recevrez les messages traduits dedans"
          />

          <PasswordRequirements>
            <RequirementItem $met={passwordChecks.length}>
              <Icon name={passwordChecks.length ? 'check' : 'x'} size={12} />
              Au moins 8 caractères
            </RequirementItem>
            <RequirementItem $met={passwordChecks.uppercase}>
              <Icon name={passwordChecks.uppercase ? 'check' : 'x'} size={12} />
              Une lettre majuscule
            </RequirementItem>
            <RequirementItem $met={passwordChecks.lowercase}>
              <Icon name={passwordChecks.lowercase ? 'check' : 'x'} size={12} />
              Une lettre minuscule
            </RequirementItem>
            <RequirementItem $met={passwordChecks.number}>
              <Icon name={passwordChecks.number ? 'check' : 'x'} size={12} />
              Un chiffre
            </RequirementItem>
            <RequirementItem $met={passwordChecks.match}>
              <Icon name={passwordChecks.match ? 'check' : 'x'} size={12} />
              Les mots de passe correspondent
            </RequirementItem>
          </PasswordRequirements>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={isLoading}
            disabled={!isPasswordValid}
          >
            S'inscrire →
          </Button>
        </Form>

        <Divider>
          <span>OU</span>
        </Divider>

        <SocialButtons>
          <Button
            variant="social"
            disabled
            title="Connexion sociale bientôt disponible"
            onClick={() => onSocialSignup('google')}
            icon={<Icon name="google" size={20} />}
          >
            <VisuallyHidden>S'inscrire avec Google</VisuallyHidden>
          </Button>
          <Button
            variant="social"
            disabled
            title="Connexion sociale bientôt disponible"
            onClick={() => onSocialSignup('apple')}
            icon={<Icon name="apple" size={20} />}
          >
            <VisuallyHidden>S'inscrire avec Apple</VisuallyHidden>
          </Button>
          <Button
            variant="social"
            disabled
            title="Connexion sociale bientôt disponible"
            onClick={() => onSocialSignup('twitter')}
            icon={<Icon name="x" size={20} />}
          >
            <VisuallyHidden>S'inscrire avec X</VisuallyHidden>
          </Button>
        </SocialButtons>

        <TermsSection>
          <div>
            En vous inscrivant, vous acceptez nos{' '}
            <TermsLink onClick={onTermsClick}>conditions d'utilisation</TermsLink>
            {' '}et notre{' '}
            <TermsLink onClick={onPrivacyClick}>politique de confidentialité</TermsLink>
          </div>
          <LoginLink onClick={onLoginClick}>
            Déjà un compte ? Connectez-vous
          </LoginLink>
        </TermsSection>
      </Content>
    </Container>
  );
};