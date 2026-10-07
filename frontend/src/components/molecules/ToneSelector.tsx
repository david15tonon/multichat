import React from 'react';
import styled from 'styled-components';
import { useT, type Translate } from '../../i18n/I18nContext';
import { MessageTone } from '../../types';
import { Icon } from '../atoms/Icon';

export interface ToneSelectorProps {
  selected: MessageTone;
  onChange: (tone: MessageTone) => void;
  variant?: 'full' | 'compact';
}

/** Construit la liste des tons dans la langue de l'interface. */
const buildTones = (t: Translate): Array<{
  value: MessageTone;
  label: string;
  description: string;
  example: string;
  icon: 'smile' | 'user' | 'briefcase';
}> => [
  {
    value: 'casual',
    label: t('tone.casual'),
    description: t('tone.casual.description'),
    example: t('tone.casual.example'),
    icon: 'smile',
  },
  {
    value: 'standard',
    label: t('tone.standard'),
    description: t('tone.standard.description'),
    example: t('tone.standard.example'),
    icon: 'user',
  },
  {
    value: 'formal',
    label: t('tone.formal'),
    description: t('tone.formal.description'),
    example: t('tone.formal.example'),
    icon: 'briefcase',
  },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const ToneOption = styled.button<{
  $selected: boolean;
  $variant: ToneSelectorProps['variant'];
  
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary.yellow : theme.colors.neutral.white};
  box-shadow: ${({ $selected }) => ($selected ? '4px 4px 0 #000' : 'none')};
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  width: 100%;
  text-align: left;

  &:hover {
    transform: ${({ $selected }) => ($selected ? 'none' : 'translate(-2px, -2px)')};
    box-shadow: ${({ $selected }) => ($selected ? '4px 4px 0 #000' : '4px 4px 0 #000')};
  }

  ${({ $variant }) =>
    $variant === 'compact' &&
    `
    padding: 8px 12px;
  `}
`;

const IconWrapper = styled.div<{ $selected: boolean;  }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary.orange : theme.colors.primary.purple};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.neutral.onAccent};
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const Description = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const Example = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.gray};
  font-style: italic;
`;

const RadioIndicator = styled.div<{ $selected: boolean;  }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.colors.neutral.black : 'transparent'};
    transition: background-color ${({ theme }) => theme.transitions.fast};
  }
`;

// Compact variant for message composer
const CompactContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.neutral.offWhite};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
`;

const CompactButton = styled.button<{ $selected: boolean;  }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary.yellow : 'transparent'};
  color: ${({ theme }) => theme.colors.neutral.black};
  font-weight: ${({ theme, $selected }) =>
    $selected ? theme.typography.fontWeight.bold : theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-transform: uppercase;

  &:hover {
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.colors.primary.yellow : theme.colors.neutral.lightGray};
  }
`;

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selected,
  onChange,
  variant = 'full',
}) => {
  const t = useT();
  const tones = buildTones(t);
  if (variant === 'compact') {
    return (
      <CompactContainer>
        <CompactButton $selected={selected === 'casual'} onClick={() => onChange('casual')}>
          {t('tone.casual')}
        </CompactButton>
        <CompactButton $selected={selected === 'standard'} onClick={() => onChange('standard')}>
          STD
        </CompactButton>
        <CompactButton $selected={selected === 'formal'} onClick={() => onChange('formal')}>
          {t('tone.formal')}
        </CompactButton>
      </CompactContainer>
    );
  }

  return (
    <Container>
      {tones.map((tone) => (
        <ToneOption
          key={tone.value}
          $selected={selected === tone.value}
          $variant={variant}
          onClick={() => onChange(tone.value)}
        >
          <IconWrapper $selected={selected === tone.value}>
            <Icon name={tone.icon} size={24} color="currentColor" />
          </IconWrapper>
          <TextContent>
            <Label>{tone.label}</Label>
            <Description>{tone.description}</Description>
            <Example>{tone.example}</Example>
          </TextContent>
          <RadioIndicator $selected={selected === tone.value} />
        </ToneOption>
      ))}
    </Container>
  );
};
