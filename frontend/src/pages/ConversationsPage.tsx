import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Avatar, Badge, Button, Icon, Input } from '../components/atoms';
import { Header } from '../components/organisms/Header';
import type { ConversationPublic, UserPublic } from '../lib/api';

export interface ConversationsPageProps {
  currentUserId: string;
  conversations: ConversationPublic[];
  /** Présences temps réel ; plus fiables que `is_online` en base. */
  onlineUsers?: Set<string>;
  isLoading?: boolean;
  error?: string;
  onOpenConversation: (conversationId: string) => void;
  onSearchUsers: (query: string) => Promise<UserPublic[]>;
  onStartConversation: (userId: string) => Promise<void>;
  onSettingsClick?: () => void;
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background.cream};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

const SearchZone = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.neutral.black};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 ${({ theme }) => theme.colors.neutral.black};
  }
`;

const RowText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Name = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const Preview = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral.gray};
`;

const EmptyTitle = styled.p`
  margin: 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.black};
`;

const ErrorBanner = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.neutral.onAccent};
  border: 3px solid ${({ theme }) => theme.colors.neutral.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const SEARCH_DEBOUNCE_MS = 300;

export const ConversationsPage: React.FC<ConversationsPageProps> = ({
  currentUserId,
  conversations,
  onlineUsers,
  isLoading = false,
  error,
  onOpenConversation,
  onSearchUsers,
  onStartConversation,
  onSettingsClick,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserPublic[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Débounce : on ne lance pas une requête à chaque frappe.
  useEffect(() => {
    const term = query.trim();
    if (timer.current) clearTimeout(timer.current);

    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        setResults(await onSearchUsers(term));
        setSearchError(null);
      } catch (cause) {
        setSearchError(cause instanceof Error ? cause.message : 'Recherche impossible');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, onSearchUsers]);

  const start = useCallback(
    async (userId: string) => {
      await onStartConversation(userId);
      setQuery('');
      setResults([]);
    },
    [onStartConversation],
  );

  const named = useMemo(
    () =>
      conversations.map((conversation) => {
        const other = conversation.participants.find((p) => p.id !== currentUserId);
        return {
          id: conversation.id,
          title: conversation.name ?? other?.full_name ?? 'Conversation',
          avatar: other?.avatar_url ?? undefined,
          isOnline: other ? (onlineUsers?.has(other.id) ?? other.is_online) : false,
          unread: conversation.unread_count,
          preview: conversation.last_message?.content ?? 'Aucun message pour l’instant',
        };
      }),
    [conversations, currentUserId, onlineUsers],
  );

  return (
    <Container>
      <Header
        title="CONVERSATIONS"
        showSettingsButton
        onSettingsClick={onSettingsClick}
      />

      <Content>
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <SearchZone>
          <Input
            label="Démarrer une conversation"
            placeholder="Rechercher par nom ou e-mail…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            icon={<Icon name="search" size={18} />}
            fullWidth
          />

          {searchError && <ErrorBanner>{searchError}</ErrorBanner>}

          {query.trim().length >= 2 && (
            <>
              <SectionTitle>
                {searching ? 'Recherche…' : `${results.length} résultat(s)`}
              </SectionTitle>
              <List>
                {results.map((user) => (
                  <Row key={user.id} onClick={() => void start(user.id)}>
                    <Avatar
                      src={user.avatar_url ?? undefined}
                      alt={user.full_name}
                      size="medium"
                      isOnline={onlineUsers?.has(user.id) ?? user.is_online}
                      initials={user.full_name.slice(0, 2).toUpperCase()}
                    />
                    <RowText>
                      <Name>{user.full_name}</Name>
                      <Preview>Parle {user.preferred_language.toUpperCase()}</Preview>
                    </RowText>
                    <Button variant="outline" size="small" onClick={() => void start(user.id)}>
                      Écrire
                    </Button>
                  </Row>
                ))}
              </List>
            </>
          )}
        </SearchZone>

        <SectionTitle>Vos conversations</SectionTitle>

        {isLoading && <EmptyState>Chargement…</EmptyState>}

        {!isLoading && named.length === 0 && (
          <EmptyState>
            <Icon name="chat" size={48} />
            <EmptyTitle>Aucune conversation</EmptyTitle>
            <p>
              Cherchez quelqu’un par son nom ou son e-mail ci-dessus pour démarrer
              votre première discussion.
            </p>
          </EmptyState>
        )}

        <List>
          {named.map((conversation) => (
            <Row key={conversation.id} onClick={() => onOpenConversation(conversation.id)}>
              <Avatar
                src={conversation.avatar}
                alt={conversation.title}
                size="medium"
                isOnline={conversation.isOnline}
                initials={conversation.title.slice(0, 2).toUpperCase()}
              />
              <RowText>
                <Name>{conversation.title}</Name>
                <Preview>{conversation.preview}</Preview>
              </RowText>
              {conversation.unread > 0 && (
                <Badge variant="primary" size="small">
                  {conversation.unread}
                </Badge>
              )}
            </Row>
          ))}
        </List>
      </Content>
    </Container>
  );
};
