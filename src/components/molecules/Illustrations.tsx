import React from "react";
import styled from "styled-components";

const Svg = styled.svg`
  display: block;
`;

interface IllustrationProps {
  size?: number;
}

export const PersonSearchIllustration = ({ size = 140 }: IllustrationProps) => (
  <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
    <circle cx="70" cy="55" r="28" stroke="#111" strokeWidth="6" fill="#fff" />
    <path d="M45 130c10-22 40-22 50 0" stroke="#111" strokeWidth="6" strokeLinecap="round" />
    <circle cx="118" cy="80" r="24" stroke="#111" strokeWidth="6" fill="#F9D64B" />
    <path d="M134 96l18 18" stroke="#111" strokeWidth="6" strokeLinecap="round" />
  </Svg>
);

export const ChatIllustration = ({ size = 160 }: IllustrationProps) => (
  <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
    <rect x="20" y="20" width="120" height="90" rx="16" fill="#fff" stroke="#111" strokeWidth="6" />
    <circle cx="62" cy="65" r="20" fill="#F59B3D" stroke="#111" strokeWidth="6" />
    <path d="M104 55h26" stroke="#111" strokeWidth="6" strokeLinecap="round" />
    <path d="M104 75h26" stroke="#111" strokeWidth="6" strokeLinecap="round" />
  </Svg>
);
