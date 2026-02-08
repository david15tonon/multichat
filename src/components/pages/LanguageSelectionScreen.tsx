import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "../atoms/Button";
import { Logo } from "../atoms/Logo";
import { LanguagePicker } from "../molecules/LanguagePicker";
import { ToneSelector } from "../molecules/ToneSelector";
import type { ToneOption } from "../../types";

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const options: ToneOption[] = [
  {
    id: "casual",
    label: "Décontracté",
    description: "Salut ! Ça va ?",
    icon: "smile",
    color: "#FCE5A7",
  },
  {
    id: "standard",
    label: "Standard",
    description: "Bonjour, comment allez-vous ?",
    icon: "user",
    color: "#F9D64B",
  },
  {
    id: "formal",
    label: "Soutenu",
    description: "Je vous prie d'agréer mes salutations.",
    icon: "briefcase",
    color: "#FFFFFF",
  },
];

export const LanguageSelectionScreen = () => {
  const [language, setLanguage] = useState("fr-FR");
  const [tone, setTone] = useState("standard");

  return (
    <Page>
      <Logo />
      <h2>Configurez votre expérience de messagerie intelligente.</h2>
      <LanguagePicker
        label="Langue préférée"
        value={language}
        onChange={setLanguage}
        options={[
          { value: "fr-FR", label: "Français (France)" },
          { value: "en-US", label: "English (United States)" },
          { value: "es-ES", label: "Español (España)" },
        ]}
      />
      <ToneSelector options={options} selected={tone} onChange={setTone} />
      <Button $fullWidth>C'est parti</Button>
    </Page>
  );
};
