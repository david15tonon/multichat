import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useT } from '../i18n/I18nContext';
import { Language, MessageTone } from '../types';
import { Header } from '../components/organisms/Header';
import { LanguagePicker } from '../components/molecules/LanguagePicker';
import { ToneSelector } from '../components/molecules/ToneSelector';
import { Button, Icon, Input } from '../components/atoms';

export interface SettingsPageProps {
  language: Language;
  tone: MessageTone;
  onLanguageChange: (language: Language) => void;
  onToneChange: (tone: MessageTone) => void;
  onBackClick?: () => void;
  /** Profil affiché dans l'onglet Compte. */
  fullName?: string;
  email?: string;
  onFullNameChange?: (fullName: string) => void | Promise<void>;
  onLogout?: () => void;
  onDeleteAccount?: () => void | Promise<void>;
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.neutral.offWhite};
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ReadOnlyValue = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.lightGray};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const FieldLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const DangerZone = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 3px dashed ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const DangerText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: 6px 6px 0 ${({ theme }) => theme.colors.neutral.black};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CardIconWrapper = styled.div<{ $color: string }>`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $color }) => $color};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.neutral.onAccent};
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  margin: 0;
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const CardDescription = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.neutral.gray};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 1.6;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.neutral.gray};
  margin: 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const FeatureCard = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary.yellow};
  color: ${({ theme }) => theme.colors.neutral.onBright};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

const FeatureTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const FeatureDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const TabNavigation = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.xl};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.neutral.white : 'transparent'};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-bottom: ${({ $active }) => ($active ? 'none' : '3px solid #000')};
  border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  bottom: -3px;

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.neutral.white : theme.colors.neutral.lightGray};
  }
`;

export const SettingsPage: React.FC<SettingsPageProps> = ({
  language,
  tone,
  onLanguageChange,
  onToneChange,
  onBackClick,
  fullName,
  email,
  onFullNameChange,
  onLogout,
  onDeleteAccount,
}) => {
  const t = useT();
  const [activeTab, setActiveTab] = useState<'language' | 'tone' | 'account'>('language');
  const [nameDraft, setNameDraft] = useState(fullName ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setNameDraft(fullName ?? '');
  }, [fullName]);

  return (
    <Container>
      <Header
        title={t('settings.title')}
        showBackButton
        onBackClick={onBackClick}
        showThemeToggle={false}
        backgroundColor="#F5F5F0"
      />

      <TabNavigation>
        <Tab $active={activeTab === 'language'} onClick={() => setActiveTab('language')}>
          <Icon name="globe" size={20} /> {t('settings.tab.language')}
        </Tab>
        <Tab $active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
          <Icon name="user" size={20} /> {t('settings.tab.account')}
        </Tab>
        <Tab $active={activeTab === 'tone'} onClick={() => setActiveTab('tone')}>
          <Icon name="chat" size={20} /> {t('settings.tab.tone')}
        </Tab>
      </TabNavigation>

      <Content>
        {activeTab === 'language' && (
          <>
            <Card>
              <CardHeader>
                <CardIconWrapper $color="#FDB924">
                  <Icon name="translate" size={32} />
                </CardIconWrapper>
                <div>
                  <CardTitle>{t('settings.card.multilingual')}</CardTitle>
                </div>
              </CardHeader>
              <CardDescription>
                Traduisez vos émotions sans frontières.
              </CardDescription>
              <LanguagePicker selected={language} onChange={onLanguageChange} />
            </Card>

            <FeatureGrid>
              <FeatureCard>
                <Icon name="translate" size={32} />
                <FeatureTitle>{t('settings.card.realtime')}</FeatureTitle>
                <FeatureDescription>
                  Messages traduits instantanément dans votre langue
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <Icon name="globe" size={32} />
                <FeatureTitle>{t('settings.card.languages')}</FeatureTitle>
                <FeatureDescription>
                  Français, Anglais, Espagnol et plus encore
                </FeatureDescription>
              </FeatureCard>
              <FeatureCard>
                <Icon name="check" size={32} />
                <FeatureTitle>{t('settings.card.accuracy')}</FeatureTitle>
                <FeatureDescription>
                  IA avancée pour des traductions naturelles
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </>
        )}

        {activeTab === 'tone' && (
          <Card>
            <CardHeader>
              <CardIconWrapper $color="#6C5CE7">
                <Icon name="chat" size={32} />
              </CardIconWrapper>
              <div>
                <CardTitle>{t('settings.card.toneTitle')}</CardTitle>
              </div>
            </CardHeader>
            <CardDescription>
              Configurez votre ton selon vos messagerie Despi'sez posirique et ous arrauvet
              salutations de intelligente.
            </CardDescription>

            <Section>
              <SectionTitle>{t('settings.tone.sectionTitle')}</SectionTitle>
              <ToneSelector selected={tone} onChange={onToneChange} variant="full" />
            </Section>

            <p style={{ fontSize: '14px', color: '#8E8E93', marginTop: '16px' }}>
              Vous pourrez modifier ces réglages plus tard.
            </p>
          </Card>
        )}
        {activeTab === 'account' && (
          <Card>
            <CardHeader>
              <CardIconWrapper $color="#6C5CE7">
                <Icon name="user" size={32} />
              </CardIconWrapper>
              <div>
                <CardTitle>{t('settings.account.title')}</CardTitle>
              </div>
            </CardHeader>

            <FieldRow>
              <Input
                label={t('settings.account.displayName')}
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                fullWidth
              />
              <Button
                variant="primary"
                size="small"
                disabled={!nameDraft.trim() || nameDraft === fullName}
                onClick={() => void onFullNameChange?.(nameDraft.trim())}
              >
                {t('common.save')}
              </Button>
            </FieldRow>

            <FieldRow>
              <FieldLabel>{t('settings.account.email')}</FieldLabel>
              <ReadOnlyValue>{email ?? '—'}</ReadOnlyValue>
            </FieldRow>

            <FieldRow>
              <Button
                variant="outline"
                fullWidth
                onClick={onLogout}
                icon={<Icon name="arrow-left" size={20} />}
              >
                {t('settings.account.logout')}
              </Button>
            </FieldRow>

            <DangerZone>
              <FieldLabel>{t('settings.danger.title')}</FieldLabel>
              <DangerText>{t('settings.danger.text')}</DangerText>
              {confirmingDelete ? (
                <>
                  <DangerText>
                    <strong>{t('settings.danger.confirm')}</strong>
                  </DangerText>
                  <Button variant="primary" onClick={() => void onDeleteAccount?.()}>
                    {t('settings.danger.yes')}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                    {t('common.cancel')}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>
                  {t('settings.danger.delete')}
                </Button>
              )}
            </DangerZone>
          </Card>
        )}
      </Content>
    </Container>
  );
};
