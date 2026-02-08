import React from "react";
import styled from "styled-components";
import type { Tone, ToneOption } from "../../types";
import { ToneOptionCard } from "./ToneOptionCard";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

interface ToneSelectorProps {
  options: ToneOption[];
  selected: Tone;
  onChange: (tone: Tone) => void;
}

export const ToneSelector = ({ options, selected, onChange }: ToneSelectorProps) => (
  <Stack>
    {options.map((option) => (
      <ToneOptionCard
        key={option.id}
        option={option}
        active={option.id === selected}
        onSelect={() => onChange(option.id)}
      />
    ))}
  </Stack>
);
