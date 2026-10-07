import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  type RouteProps,
} from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider, useChatSession } from './contexts/ChatContext';
import { CallOverlay } from './components/organisms';
import {
  ChatPage,
  ConversationsPage,
  ForgotPasswordPage,
  LoginPage,
  NotFoundPage,
  SettingsPage,
  SignupPage,
} from './pages';
import { api } from './lib/api';
import type { Language, MessageTone } from './types';

/** N'autorise l'accès qu'une fois la session résolue ET valide. */
function RequireAuth({ children }: { children: RouteProps['element'] }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Inversement : un utilisateur connecté n'a rien à faire sur /login. */
function RedirectIfAuthenticated({ children }: { children: RouteProps['element'] }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/conversations" replace /> : <>{children}</>;
}

function LoginRoute() {
  const { login, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  return (
    <LoginPage
      isLoading={isLoading}
      error={error ?? undefined}
      onLogin={async (email, password) => {
        try {
          await login(email, password);
          navigate('/conversations');
        } catch {
          /* message déjà porté par le contexte */
        }
      }}
      onSocialLogin={() => clearError()}
      onForgotPassword={() => navigate('/forgot-password')}
      onSignup={() => navigate('/signup')}
    />
  );
}

function SignupRoute() {
  const { signup, error, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <SignupPage
      isLoading={isLoading}
      error={error ?? undefined}
      onSignup={async (name, email, password, language) => {
        try {
          await signup({ email, full_name: name, password, preferred_language: language });
          navigate('/conversations');
        } catch {
          /* message déjà porté par le contexte */
        }
      }}
      onSocialSignup={() => undefined}
      onLoginClick={() => navigate('/login')}
      onTermsClick={() => undefined}
      onPrivacyClick={() => undefined}
    />
  );
}

function ForgotPasswordRoute() {
  const navigate = useNavigate();

  // Le backend n'expose pas encore de route de réinitialisation : on l'assume
  // explicitement plutôt que de simuler un succès trompeur.
  return (
    <ForgotPasswordPage
      onResetRequest={() => undefined}
      onBackToLogin={() => navigate('/login')}
      error="La réinitialisation par e-mail n'est pas encore disponible."
    />
  );
}

function ConversationsRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const chat = useChatSession();

  return (
    <ConversationsPage
      currentUserId={user?.id ?? ''}
      conversations={chat.conversations}
      onlineUsers={chat.onlineUsers}
      error={chat.error ?? undefined}
      onOpenConversation={(id) => navigate(`/chat/${id}`)}
      onSearchUsers={(query) => api.searchUsers(query)}
      onStartConversation={async (userId) => {
        const id = await chat.startConversation(userId);
        if (id) navigate(`/chat/${id}`);
      }}
      onSettingsClick={() => navigate('/settings')}
    />
  );
}

function ChatRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const chat = useChatSession();
  const call = chat.call;

  // La conversation ouverte vient de l'URL : le lien est partageable et le
  // rechargement de la page ne perd plus le fil en cours.
  useEffect(() => {
    if (conversationId) chat.selectConversation(conversationId);
  }, [conversationId, chat.selectConversation]);

  const peerName = chat.contact?.full_name ?? 'Conversation';

  return (
    <ChatPage
      currentUserId={user?.id ?? ''}
      contactName={peerName}
      contactAvatar={chat.contact?.avatar_url ?? ''}
      messages={chat.messages}
      onSendMessage={(content: string, tone: MessageTone) => void chat.sendMessage(content, tone)}
      onBackClick={() => navigate('/conversations')}
      onSettingsClick={() => navigate('/settings')}
      showSettingsButton
      isConnected={chat.isConnected}
      isContactOnline={chat.isContactOnline}
      isTyping={chat.isTyping}
      onTypingChange={chat.notifyTyping}
      onMessageRead={chat.markRead}
      onVideoCall={chat.contact ? () => void call.startCall(chat.contact!.id) : undefined}
    />
  );
}

function SettingsRoute() {
  const { user, updatePreferences, logout } = useAuth();
  const navigate = useNavigate();

  const leave = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <SettingsPage
      language={(user?.preferred_language ?? 'fr') as Language}
      tone={(user?.preferred_tone ?? 'standard') as MessageTone}
      fullName={user?.full_name}
      email={user?.email}
      onLanguageChange={(language) => void updatePreferences({ preferred_language: language })}
      onToneChange={(tone) => void updatePreferences({ preferred_tone: tone })}
      onFullNameChange={(fullName) => updatePreferences({ full_name: fullName })}
      // La flèche retour revient en arrière ; elle ne déconnecte plus.
      onBackClick={() => navigate('/conversations')}
      onLogout={() => void leave()}
      onDeleteAccount={async () => {
        await api.deleteAccount();
        await leave();
      }}
    />
  );
}

/**
 * Appels rendus au-dessus des routes : la signalisation arrive sur le socket
 * quelle que soit la page affichée. Confiné à ChatRoute, un appel reçu depuis
 * l'inbox ou les réglages sonnait dans le vide.
 */
function GlobalCall() {
  const chat = useChatSession();
  const call = chat.call;

  const peer = chat.conversations
    .flatMap((conversation) => conversation.participants)
    .find((participant) => participant.id === call.peerId);

  return (
    <CallOverlay
      callState={call.callState}
      peerName={peer?.full_name ?? 'Correspondant'}
      peerAvatar={peer?.avatar_url ?? undefined}
      localStream={call.localStream}
      remoteStream={call.remoteStream}
      isMuted={call.isMuted}
      isCameraOff={call.isCameraOff}
      error={call.error}
      onAccept={() => void call.acceptCall()}
      onReject={call.rejectCall}
      onHangUp={call.hangUp}
      onToggleMute={call.toggleMute}
      onToggleCamera={call.toggleCamera}
    />
  );
}

function NotFoundRoute() {
  const navigate = useNavigate();
  return <NotFoundPage onHome={() => navigate('/conversations')} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/conversations" replace />} />
      <Route
        path="/login"
        element={<RedirectIfAuthenticated><LoginRoute /></RedirectIfAuthenticated>}
      />
      <Route
        path="/signup"
        element={<RedirectIfAuthenticated><SignupRoute /></RedirectIfAuthenticated>}
      />
      <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
      <Route
        path="/conversations"
        element={<RequireAuth><ConversationsRoute /></RequireAuth>}
      />
      <Route path="/chat" element={<Navigate to="/conversations" replace />} />
      <Route
        path="/chat/:conversationId"
        element={<RequireAuth><ChatRoute /></RequireAuth>}
      />
      <Route path="/settings" element={<RequireAuth><SettingsRoute /></RequireAuth>} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            <AppRoutes />
            <GlobalCall />
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
