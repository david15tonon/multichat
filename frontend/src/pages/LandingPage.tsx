import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Logo } from '../components/atoms/Logo';
import { Button } from '../components/atoms/Button';
import { Icon, type IconName } from '../components/atoms/Icon';
import { useT } from '../i18n/I18nContext';

// ============================================
// STYLED COMPONENTS - Material Design + Neo-Brutalist
// ============================================

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  color: ${({ theme }) => theme.colors.neutral.black};
  overflow-x: hidden;
`;

const Section = styled.section<{ $variant?: 'primary' | 'secondary' | 'accent' }>`
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  /* La barre de navigation est fixe : sans cette marge, une ancre amène le
     titre de section juste en dessous, donc masqué. */
  scroll-margin-top: 88px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `background-color: ${theme.colors.primary.purple}; color: ${theme.colors.neutral.white};`;
      case 'secondary':
        return `background-color: ${theme.colors.primary.yellow}; color: ${theme.colors.neutral.black};`;
      case 'accent':
        return `background-color: ${theme.colors.primary.orange}; color: ${theme.colors.neutral.onBright};`;
      default:
        return `background-color: ${theme.colors.neutral.white}; color: ${theme.colors.neutral.black};`;
    }
  }}

  /* Material Design elevation simulation */
  ${({ $variant, theme }) =>
    $variant &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg,
        ${theme.colors.neutral.black} 0%,
        ${theme.colors.neutral.black} 50%,
        transparent 50%,
        transparent 100%);
      background-size: 20px 4px;
    }
  `}
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const Grid = styled.div<{ $columns?: number; $gap?: 'sm' | 'md' | 'lg' | 'xl' }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns || 1}, 1fr);
  gap: ${({ $gap, theme }) => theme.spacing[$gap ?? 'xl']};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// ============================================
// HERO SECTION
// ============================================

const HeroSection = styled(Section)`
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing['2xl']};
  padding-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
`;

const HeroTitle = styled.h1`
  font-size: clamp(${({ theme }) => theme.typography.fontSize['3xl']}, 6vw, ${({ theme }) => theme.typography.fontSize['4xl']});
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  line-height: 1.1;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  letter-spacing: -0.02em;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(${({ theme }) => theme.typography.fontSize.lg}, 2.5vw, ${({ theme }) => theme.typography.fontSize.xl});
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  opacity: 0.9;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

/**
 * Décor du hero. Ses cartes sont toutes en `position: absolute` : sans hauteur
 * explicite le conteneur se réduit à 0 et les cartes remontent par-dessus les
 * boutons d'appel à l'action, qui deviennent incliquables. D'où le min-height,
 * et le pointer-events: none — ce bloc est purement décoratif.
 */
const HeroIllustration = styled.div`
  margin-top: ${({ theme }) => theme.spacing['2xl']};
  position: relative;
  min-height: 340px;
  pointer-events: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

const FloatingCard = styled.div<{ $delay?: number }>`
  position: absolute;
  background: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 8px 8px 0 ${({ theme }) => theme.colors.neutral.black};
  animation: float 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || 0}s;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

// ============================================
// FEATURES SECTION
// ============================================

const FeaturesSection = styled(Section)`
  background-color: ${({ theme }) => theme.colors.neutral.offWhite};
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const SectionLabel = styled.span`
  display: inline-block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.primary.purple};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SectionTitle = styled.h2`
  font-size: clamp(${({ theme }) => theme.typography.fontSize['2xl']}, 4vw, ${({ theme }) => theme.typography.fontSize['3xl']});
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  line-height: 1.2;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.gray};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors.primary.purple};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 12px 12px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  background: ${({ theme }) => theme.colors.primary.yellow};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FeatureDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.gray};
  line-height: 1.6;
`;

// ============================================
// HOW IT WORKS SECTION
// ============================================

const HowItWorksSection = styled(Section)``;

const StepCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
`;

const StepNumber = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.purple};
  color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
`;

const StepTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StepDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.gray};
  line-height: 1.6;
`;

const StepConnector = styled.div`
  position: absolute;
  top: 28px;
  left: 50%;
  right: -50%;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutral.black},
    ${({ theme }) => theme.colors.neutral.black} 10px,
    transparent 10px,
    transparent 20px
  );
  z-index: -1;

  @media (max-width: 768px) {
    display: none;
  }
`;

// ============================================
// TESTIMONIALS / STATS SECTION
// ============================================

const StatsSection = styled(Section)`
  background-color: ${({ theme }) => theme.colors.neutral.black};
  color: ${({ theme }) => theme.colors.neutral.white};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatNumber = styled.div`
  font-size: clamp(${({ theme }) => theme.typography.fontSize['3xl']}, 5vw, ${({ theme }) => theme.typography.fontSize['4xl']});
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  color: ${({ theme }) => theme.colors.primary.yellow};
  line-height: 1;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.gray};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// ============================================
// CTA SECTION
// ============================================

const CTASection = styled(Section)`
  text-align: center;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary.purple} 0%, 
    ${({ theme }) => theme.colors.primary.orange} 100%);
`;

const CTATitle = styled.h2`
  font-size: clamp(${({ theme }) => theme.typography.fontSize['2xl']}, 4vw, ${({ theme }) => theme.typography.fontSize['3xl']});
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.neutral.white};
`;

const CTADescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.white};
  opacity: 0.9;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const CTAActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

// ============================================
// FOOTER
// ============================================

const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.neutral.black};
  color: ${({ theme }) => theme.colors.neutral.white};
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
  border-top: 3px solid ${({ theme }) => theme.colors.primary.yellow};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrand = styled.div``;

const FooterLogo = styled(Logo)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FooterDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
  line-height: 1.6;
  max-width: 300px;
`;

const FooterColumn = styled.div``;

const FooterColumnTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.primary.yellow};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const footerLinkStyles = css`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.white};
  opacity: 0.7;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.primary.yellow};
  }
`;

/** Lien de pied de page vers une route de l'application. */
const FooterLink = styled(Link)`
  ${footerLinkStyles}
`;

/** Lien de pied de page vers une ancre de la page. */
const FooterAnchor = styled.a`
  ${footerLinkStyles}
`;

/**
 * Entrée de pied de page sans destination. Un `href="#"` renverrait en haut de
 * page : tant que ces pages n'existent pas, c'est du texte, pas un lien.
 */
const FooterItem = styled.span`
  ${footerLinkStyles}
  cursor: default;

  &:hover {
    opacity: 0.7;
    color: ${({ theme }) => theme.colors.neutral.white};
  }
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: ${({ theme }) => theme.spacing['2xl']} auto 0;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.lightGray};
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.neutral.white};
  border: 2px solid ${({ theme }) => theme.colors.neutral.lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.neutral.black};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary.yellow};
    border-color: ${({ theme }) => theme.colors.neutral.black};
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

// ============================================
// NAVIGATION BAR FOR LANDING
// ============================================

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  background: ${({ theme }) => theme.colors.neutral.white};
  border-bottom: 3px solid ${({ theme }) => theme.colors.neutral.black};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLink = styled.a`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.black};
  opacity: 0.7;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.primary.purple};
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

// ============================================
// LANDING PAGE COMPONENT
// ============================================

export const LandingPage: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();

  const features: { icon: IconName; title: string; description: string; color: string }[] = [
    {
      icon: 'translate',
      title: t('landing.features.translation.title'),
      description: t('landing.features.translation.description'),
      color: 'purple',
    },
    {
      icon: 'chat',
      title: t('landing.features.tone.title'),
      description: t('landing.features.tone.description'),
      color: 'orange',
    },
    {
      icon: 'globe',
      title: t('landing.features.languages.title'),
      description: t('landing.features.languages.description'),
      color: 'yellow',
    },
    {
      icon: 'video',
      title: t('landing.features.calls.title'),
      description: t('landing.features.calls.description'),
      color: 'purple',
    },
    {
      icon: 'shield',
      title: t('landing.features.privacy.title'),
      description: t('landing.features.privacy.description'),
      color: 'orange',
    },
    {
      icon: 'zap',
      title: t('landing.features.realtime.title'),
      description: t('landing.features.realtime.description'),
      color: 'yellow',
    },
  ];

  const steps = [
    { number: 1, title: t('landing.steps.step1.title'), description: t('landing.steps.step1.description') },
    { number: 2, title: t('landing.steps.step2.title'), description: t('landing.steps.step2.description') },
    { number: 3, title: t('landing.steps.step3.title'), description: t('landing.steps.step3.description') },
  ];

  // Chiffres vérifiables dans le code : le type `Language` (9), `MessageTone`
  // (3) et `dictionaries` (2). Rien d'inventé ici.
  const stats = [
    { number: '9', label: t('landing.stats.languages') },
    { number: '3', label: t('landing.stats.tones') },
    { number: '2', label: t('landing.stats.uiLanguages') },
    { number: t('landing.stats.priceValue'), label: t('landing.stats.price') },
  ];

  return (
    <PageWrapper>
      {/* Navigation Bar */}
      <NavBar role="navigation" aria-label="Navigation principale">
        <NavContent>
          <Logo size="medium" />
          <NavLinks>
            <NavLink href="#features">{t('landing.nav.features')}</NavLink>
            <NavLink href="#how-it-works">{t('landing.nav.howItWorks')}</NavLink>
            <NavLink href="#stats">{t('landing.nav.stats')}</NavLink>
          </NavLinks>
          <NavActions>
            <Button variant="ghost" size="small" onClick={() => navigate('/login')}>
              {t('landing.nav.login')}
            </Button>
            <Button variant="primary" size="small" onClick={() => navigate('/signup')}>
              {t('landing.nav.signup')}
            </Button>
          </NavActions>
        </NavContent>
      </NavBar>

      {/* Hero Section */}
      <HeroSection id="home" aria-labelledby="hero-title">
        <Container>
          <HeroContent>
            <HeroBadge>
              <Icon name="sparkles" size={16} />
              {t('landing.hero.badge')}
            </HeroBadge>
            <HeroTitle id="hero-title">{t('landing.hero.title')}</HeroTitle>
            <HeroSubtitle>{t('landing.hero.subtitle')}</HeroSubtitle>
            <HeroActions>
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/signup')}
                icon={<Icon name="arrow-right" size={20} />}
              >
                {t('landing.hero.ctaPrimary')}
              </Button>
              <Button variant="outline" size="large" onClick={() => navigate('/login')}>
                {t('landing.hero.ctaSecondary')}
              </Button>
            </HeroActions>
            <HeroIllustration aria-hidden="true">
              <FloatingCard $delay={0} style={{ top: '-20px', right: '10%', width: '280px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '60%', height: '8px', background: '#FDB924', borderRadius: '4px' }}></div>
                  <div style={{ width: '40%', height: '8px', background: '#FF6B35', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ height: '12px', background: '#E5E5EA', borderRadius: '4px', width: '80%' }}></div>
                  <div style={{ height: '12px', background: '#E5E5EA', borderRadius: '4px', width: '60%' }}></div>
                  <div style={{ height: '12px', background: '#E5E5EA', borderRadius: '4px', width: '90%' }}></div>
                </div>
              </FloatingCard>
              <FloatingCard $delay={1} style={{ bottom: '20px', left: '10%', width: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6C5CE7' }}></div>
                  <div>
                    <div style={{ height: '10px', background: '#E5E5EA', borderRadius: '4px', width: '100px' }}></div>
                    <div style={{ height: '8px', background: '#E5E5EA', borderRadius: '4px', width: '70px', marginTop: '4px' }}></div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FF6B35' }}></div>
                  <div>
                    <div style={{ height: '10px', background: '#E5E5EA', borderRadius: '4px', width: '100px' }}></div>
                    <div style={{ height: '8px', background: '#E5E5EA', borderRadius: '4px', width: '70px', marginTop: '4px' }}></div>
                  </div>
                </div>
              </FloatingCard>
              <FloatingCard $delay={0.5} style={{ top: '40%', right: '-5%', width: '200px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px' }}>🌍</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                    {t('landing.features.languages.title')}
                  </div>
                </div>
              </FloatingCard>
            </HeroIllustration>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection id="features" aria-labelledby="features-title">
        <Container>
          <SectionHeader>
            <SectionLabel>{t('landing.features.label')}</SectionLabel>
            <SectionTitle id="features-title">{t('landing.features.title')}</SectionTitle>
            <SectionDescription>{t('landing.features.description')}</SectionDescription>
          </SectionHeader>
          <Grid $columns={3} $gap="xl">
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon>
                  <Icon name={feature.icon} size={28} />
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </Grid>
        </Container>
      </FeaturesSection>

      {/* How It Works Section */}
      <HowItWorksSection id="how-it-works" aria-labelledby="how-it-works-title">
        <Container>
          <SectionHeader>
            <SectionLabel>{t('landing.howItWorks.label')}</SectionLabel>
            <SectionTitle id="how-it-works-title">{t('landing.howItWorks.title')}</SectionTitle>
            <SectionDescription>{t('landing.howItWorks.description')}</SectionDescription>
          </SectionHeader>
          <Grid $columns={3} $gap="xl">
            {steps.map((step, index) => (
              <StepCard key={index}>
                {index < steps.length - 1 && <StepConnector />}
                <StepNumber>{step.number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepCard>
            ))}
          </Grid>
        </Container>
      </HowItWorksSection>

      {/* Stats Section */}
      <StatsSection id="stats" aria-labelledby="stats-title">
        <Container>
          <SectionHeader>
            <SectionLabel style={{ color: '#FDB924' }}>{t('landing.stats.label')}</SectionLabel>
            <SectionTitle id="stats-title" style={{ color: '#FFFFFF' }}>{t('landing.stats.title')}</SectionTitle>
            <SectionDescription style={{ color: '#9A9AA0' }}>{t('landing.stats.description')}</SectionDescription>
          </SectionHeader>
          <Grid $columns={4} $gap="lg">
            {stats.map((stat, index) => (
              <StatCard key={index}>
                <StatNumber>{stat.number}</StatNumber>
                <StatLabel>{stat.label}</StatLabel>
              </StatCard>
            ))}
          </Grid>
        </Container>
      </StatsSection>

      {/* CTA Section */}
      <CTASection aria-labelledby="cta-title">
        <Container>
          <CTATitle id="cta-title">{t('landing.cta.title')}</CTATitle>
          <CTADescription>{t('landing.cta.description')}</CTADescription>
          <CTAActions>
            <Button
              variant="secondary"
              size="large"
              onClick={() => navigate('/signup')}
              icon={<Icon name="arrow-right" size={20} />}
            >
              {t('landing.cta.primary')}
            </Button>
            <Button variant="outline" size="large" onClick={() => navigate('/login')}>
              {t('landing.cta.secondary')}
            </Button>
          </CTAActions>
        </Container>
      </CTASection>

      {/* Footer */}
      <Footer role="contentinfo">
        <FooterContent>
          <FooterBrand>
            <FooterLogo size="large" variant="white" />
            <FooterDescription>
              {t('landing.footer.description')}
            </FooterDescription>
          </FooterBrand>
          <FooterColumn>
            <FooterColumnTitle>{t('landing.footer.product')}</FooterColumnTitle>
            <FooterLink to="/login">{t('landing.footer.login')}</FooterLink>
            <FooterLink to="/signup">{t('landing.footer.signup')}</FooterLink>
            <FooterAnchor href="#features">{t('landing.footer.features')}</FooterAnchor>
            <FooterAnchor href="#how-it-works">{t('landing.footer.howItWorks')}</FooterAnchor>
          </FooterColumn>
          <FooterColumn>
            <FooterColumnTitle>{t('landing.footer.company')}</FooterColumnTitle>
            <FooterItem>{t('landing.footer.about')}</FooterItem>
            <FooterItem>{t('landing.footer.blog')}</FooterItem>
            <FooterItem>{t('landing.footer.careers')}</FooterItem>
            <FooterItem>{t('landing.footer.contact')}</FooterItem>
          </FooterColumn>
          <FooterColumn>
            <FooterColumnTitle>{t('landing.footer.legal')}</FooterColumnTitle>
            <FooterItem>{t('landing.footer.privacy')}</FooterItem>
            <FooterItem>{t('landing.footer.terms')}</FooterItem>
            <FooterItem>{t('landing.footer.cookies')}</FooterItem>
            <FooterItem>{t('landing.footer.security')}</FooterItem>
          </FooterColumn>
        </FooterContent>
        <FooterBottom>
          <span>{t('landing.footer.copyright')}</span>
          <SocialLinks>
            <SocialLink
              href="https://github.com/david15tonon/multichat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Icon name="github" size={20} />
            </SocialLink>
          </SocialLinks>
        </FooterBottom>
      </Footer>
    </PageWrapper>
  );
};

export default LandingPage;
