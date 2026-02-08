import React from "react";
import styled from "styled-components";
import { ChatHeader } from "../organisms/ChatHeader";
import { MessageBubble } from "../molecules/MessageBubble";
import { MessageComposer } from "../organisms/MessageComposer";
import { TranslationErrorModal } from "../organisms/TranslationErrorModal";
import type { Message } from "../../types";

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.yellow};
  display: flex;
  flex-direction: column;
`;

const Messages = styled.div`
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Footer = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
`;

const sampleMessages: Message[] = [
  {
    id: "1",
    author: "Elena",
    content: "Salut ! Comment se passe ton projet sur MultiChat ?",
    translated: "Auto-traduit du français",
    time: "10:24 AM",
    variant: "incoming",
  },
  {
    id: "2",
    author: "You",
    content: "C'est super ! Je travaille sur l'interface mobile en ce moment.",
    time: "10:25 AM",
    variant: "outgoing",
  },
  {
    id: "3",
    author: "Elena",
    content: "That sounds amazing! Is the real-time translation working smoothly?",
    translated: "Traduction : Cela semble incroyable !",
    time: "10:26 AM",
    variant: "incoming",
  },
];

export const ChatScreen = () => (
  <Page>
    <ChatHeader name="Elena" status="En ligne" />
    <Messages>
      {sampleMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </Messages>
    <Footer>
      <MessageComposer />
    </Footer>
    <TranslationErrorModal isOpen={false} onRetry={() => undefined} onClose={() => undefined} />
  </Page>
);
