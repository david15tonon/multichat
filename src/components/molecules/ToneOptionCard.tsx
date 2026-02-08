import React from "react";
import styled from "styled-components";
import { BriefcaseIcon, SmileIcon, UserIcon } from "../atoms/Icons";
import type { ToneOption } from "../../types";

const Card = styled.button<{ $active: boolean; $color: string }>`
  width: 100%;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $active, $color }) => ($active ? $color : "#fff")};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  cursor: pointer;
  text-align: left;
`;

const IconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 3px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
`;

const Text = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 800;
  font-size: 16px;
`;

const Description = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Radio = styled.span<{ $active: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 3px solid ${({ theme }) => theme.colors.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: ${({ theme }) => theme.radii.pill};
    background: ${({ $active, theme }) =>
      $active ? theme.colors.textPrimary : "transparent"};
  }
`;

const iconMap = {
  smile: SmileIcon,
  user: UserIcon,
  briefcase: BriefcaseIcon,
};

interface ToneOptionCardProps {
  option: ToneOption;
  active?: boolean;
  onSelect?: (value: ToneOption) => void;
}

export const ToneOptionCard = ({ option, active = false, onSelect }: ToneOptionCardProps) => {
  const Icon = iconMap[option.icon];

  return (
    <Card $active={active} $color={option.color} onClick={() => onSelect?.(option)} type="button">
      <IconWrap>
        <Icon size={22} />
      </IconWrap>
      <Text>
        <Title>{option.label}</Title>
        <Description>{option.description}</Description>
      </Text>
      <Radio $active={active} />
    </Card>
  );
};
