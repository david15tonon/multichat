import React, { useState } from 'react';
import styled from 'styled-components';
import { Language } from '../../types';
import { Icon } from '../atoms/Icon';

export interface LanguagePickerProps {
  selected: Language;
  onChange: (language: Language) => void;
  label?: string;
}

const languages: Array<{ code: Language; name: string; nativeName: string }> = [
  { code: 'fr', name: 'French', nativeName: 'Français (France)' },
  { code: 'en', name: 'English', nativeName: 'English (US)' },
  { code: 'es', name: 'Spanish', nativeName: 'Español (España)' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português (Brasil)' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

const Container = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.black};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.black};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  text-align: left;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

const SelectedLanguage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LanguageIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary.yellow};
  border: 2px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: 50%;
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + ${({ theme }) => theme.spacing.sm});
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 6px 6px 0 ${({ theme }) => theme.colors.neutral.black};
  max-height: 300px;
  overflow-y: auto;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

const DropdownItem = styled.button<{ $selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary.yellow : 'transparent'};
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.neutral.lightGray};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  text-align: left;

  &:hover {
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.colors.primary.yellow : theme.colors.neutral.offWhite};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LanguageInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const LanguageName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const NativeName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  selected,
  onChange,
  label = 'LANGUE PRÉFÉRÉE',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = languages.find((lang) => lang.code === selected);

  const handleSelect = (code: Language) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <Container>
      {label && <Label>{label}</Label>}
      <SelectWrapper>
        <Select onClick={() => setIsOpen(!isOpen)}>
          <SelectedLanguage>
            <LanguageIcon>
              <Icon name="translate" size={14} />
            </LanguageIcon>
            <span>{selectedLanguage?.nativeName}</span>
          </SelectedLanguage>
          <Icon name="arrow-right" size={20} />
        </Select>

        <Dropdown $isOpen={isOpen}>
          {languages.map((language) => (
            <DropdownItem
              key={language.code}
              $selected={language.code === selected}
              onClick={() => handleSelect(language.code)}
            >
              <LanguageIcon>
                <Icon name="translate" size={14} />
              </LanguageIcon>
              <LanguageInfo>
                <LanguageName>{language.name}</LanguageName>
                <NativeName>{language.nativeName}</NativeName>
              </LanguageInfo>
            </DropdownItem>
          ))}
        </Dropdown>
      </SelectWrapper>
    </Container>
  );
};
