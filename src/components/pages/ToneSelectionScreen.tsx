import React, { useState } from "react";
import styled from "styled-components";
import { Logo } from "../atoms/Logo";
import { Button } from "../atoms/Button";
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

const Copy = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
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

export const ToneSelectionScreen = () => {
  const [selected, setSelected] = useState("standard");

  return (
    <Page>
      <Logo />
      <h2>Adaptez votre ton selon vos interlocuteurs</h2>
      <Copy>Configurez votre ton selon vos messageries. Vous pourrez modifier ces réglages plus tard.</Copy>
      <ToneSelector options={options} selected={selected} onChange={setSelected} />
      <Button $fullWidth>Suivant</Button>
    </Page>
  );
};
