import React from "react";
import styled from "styled-components";
import { IconButton } from "../atoms/IconButton";
import { ArrowRightIcon } from "../atoms/Icons";

const Wrapper = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const Textarea = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  background: transparent;
`;

interface MessageComposerProps {
  placeholder?: string;
  onSend?: (message: string) => void;
}

export const MessageComposer = ({ placeholder = "Votre message", onSend }: MessageComposerProps) => (
  <Wrapper
    onSubmit={(event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const message = String(formData.get("message") || "");
      if (message.trim()) {
        onSend?.(message);
        event.currentTarget.reset();
      }
    }}
  >
    <Textarea name="message" rows={1} placeholder={placeholder} />
    <IconButton $variant="solid" type="submit">
      <ArrowRightIcon />
    </IconButton>
  </Wrapper>
);
