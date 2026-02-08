import React, { ReactNode } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 17, 17, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 20;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.violet};
  color: #ffffff;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 28px;
  box-shadow: ${({ theme }) => theme.shadows.bold};
  max-width: 360px;
  width: 100%;
`;

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Overlay onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>{children}</Card>
    </Overlay>
  );
};
