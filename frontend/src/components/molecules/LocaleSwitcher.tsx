/**
 * Bascule FR / EN des pages publiques.
 *
 * Avant connexion, c'est le seul endroit où la langue de l'interface se
 * choisit : le reste du temps elle suit le compte, qui se règle dans les
 * paramètres. Deux boutons plutôt qu'une liste déroulante — il n'y a que deux
 * langues d'interface, et un visiteur qui ne lit pas la langue affichée doit
 * voir sa sortie du premier coup d'œil, pas derrière un clic.
 */

import styled from 'styled-components';
import { useI18n } from '../../i18n/I18nContext';
import type { TranslationKey, UiLocale } from '../../i18n/translations';

interface Choice {
  code: UiLocale;
  /** Code affiché, volontairement non traduit : « EN » et « FR » se lisent partout. */
  label: string;
  /** Libellé accessible, lui traduit : il annonce l'action, pas l'état. */
  description: TranslationKey;
}

const CHOICES: readonly Choice[] = [
  { code: 'en', label: 'EN', description: 'landing.nav.switchToEn' },
  { code: 'fr', label: 'FR', description: 'landing.nav.switchToFr' },
];

const Group = styled.div`
  display: inline-flex;
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.neutral.white};
`;

const Choice = styled.button<{ $active: boolean }>`
  padding: 6px ${({ theme }) => theme.spacing.sm};
  min-width: 40px;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary.purple : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.neutral.onAccent : theme.colors.neutral.black};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary.purple : theme.colors.neutral.lightGray};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.primary.orange};
    outline-offset: -3px;
  }
`;

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Group role="group" aria-label={t('landing.nav.language')}>
      {CHOICES.map(({ code, label, description }) => (
        <Choice
          key={code}
          type="button"
          $active={locale === code}
          aria-pressed={locale === code}
          aria-label={t(description)}
          onClick={() => setLocale(code)}
        >
          {label}
        </Choice>
      ))}
    </Group>
  );
}
