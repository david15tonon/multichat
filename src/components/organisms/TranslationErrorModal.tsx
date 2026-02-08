import React from "react";
import styled from "styled-components";
import { Button } from "../atoms/Button";
import { Modal } from "../molecules/Modal";

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 20px;
`;

const Copy = styled.p`
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.4;
`;

interface TranslationErrorModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export const TranslationErrorModal = ({ isOpen, onRetry, onClose }: TranslationErrorModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Title>Translation Unavailable</Title>
    <Copy>We couldn't translate that last message. It looks like you've lost your internet connection.</Copy>
    <Button $variant="secondary" $fullWidth onClick={onRetry}>
      Try Again
    </Button>
  </Modal>
);
