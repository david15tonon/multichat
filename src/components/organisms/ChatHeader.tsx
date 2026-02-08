import React from "react";
import styled from "styled-components";
import { BackIcon, VideoIcon } from "../atoms/Icons";
import { IconButton } from "../atoms/IconButton";

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.yellow};
  border-bottom: 3px solid ${({ theme }) => theme.colors.border};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surface};
  border: 3px solid ${({ theme }) => theme.colors.border};
`;

const Details = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 800;
`;

const Status = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface ChatHeaderProps {
  name: string;
  status: string;
  onBack?: () => void;
}

export const ChatHeader = ({ name, status, onBack }: ChatHeaderProps) => (
  <Header>
    <IconButton type="button" onClick={onBack}>
      <BackIcon />
    </IconButton>
    <Avatar />
    <Details>
      <Name>{name}</Name>
      <Status>{status}</Status>
    </Details>
    <IconButton $variant="solid" type="button">
      <VideoIcon />
    </IconButton>
  </Header>
);
