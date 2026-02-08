import React from "react";
import styled from "styled-components";
import type { Message } from "../../types";

const Bubble = styled.div<{ $variant: Message["variant"] }>`
  max-width: 78%;
  padding: 16px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $variant, theme }) =>
    $variant === "outgoing" ? theme.colors.yellow : theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  align-self: ${({ $variant }) => ($variant === "outgoing" ? "flex-end" : "flex-start")};
`;

const Meta = styled.div`
  font-size: 12px;
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Translation = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.violet};
`;

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => (
  <Bubble $variant={message.variant}>
    <div>{message.content}</div>
    {message.translated && <Translation>{message.translated}</Translation>}
    {message.time && <Meta>{message.time}</Meta>}
  </Bubble>
);
