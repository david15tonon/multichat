import React from 'react';
import styled from 'styled-components';
import { Button, Icon, Logo } from '../components/atoms';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.background.cream};
`;

const Code = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const Message = styled.p`
  margin: 0;
  max-width: 420px;
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

export const NotFoundPage: React.FC<{ onHome: () => void }> = ({ onHome }) => (
  <Container>
    <Logo size="large" />
    <Code>404</Code>
    <Message>
      Cette page n’existe pas. Elle a peut-être été déplacée, ou l’adresse
      comporte une faute de frappe.
    </Message>
    <Button variant="primary" onClick={onHome} icon={<Icon name="chat" size={20} />}>
      Retour aux conversations
    </Button>
  </Container>
);
