import React from "react";
import styled from "styled-components";

const Wrapper = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Select = styled.select`
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 14px 16px;
  font-weight: 700;
  font-size: 16px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

interface LanguagePickerProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export const LanguagePicker = ({ label, value, options, onChange }: LanguagePickerProps) => (
  <Wrapper>
    {label}
    <Select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </Wrapper>
);
