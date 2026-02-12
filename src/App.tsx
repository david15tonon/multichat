import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { Message, MessageTone, Language } from './types';

type AppScreen = 'login' | 'chat' | 'settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [language, setLanguage] = useState<Language>('fr');
  const [tone, setTone] = useState<MessageTone>('standard');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'contact-1',
      receiverId: 'user-1',
      content: 'Bonjour ! Je voulais juste vérifier comment se passe le développement de l\'application.',
      originalLanguage: 'en',
      translatedContent: 'Hi! I just wanted to check in and see how the development of the app is going.',
      targetLanguage: 'fr',
      tone: 'standard',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
      translationStatus: 'translated',
    },
    {
      id: '2',
      senderId: 'user-1',
      receiverId: 'contact-1',
      content: "That sounds amazing! Is the real-time translation working smoothly?",
      originalLanguage: 'fr',
      translatedContent: "C'est super! La traduction en temps réel fonctionne-t-elle sans problème ?",
      targetLanguage: 'en',
      tone: 'standard',
      timestamp: new Date(Date.now() - 3000000),
      status: 'read',
      translationStatus: 'translated',
    },
  ]);

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    setCurrentScreen('chat');
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'twitter') => {
    console.log('Social login:', provider);
    setCurrentScreen('chat');
  };
  const handleSettingsClick = () => {
    setCurrentScreen('settings');
  }
  const handleSendMessage = (content: string, messageTone: MessageTone) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user-1',
      receiverId: 'contact-1',
      content,
      originalLanguage: language,
      tone: messageTone,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages([...messages, newMessage]);

    // Simulate translation
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? {
                ...msg,
                status: 'sent',
                translationStatus: 'translated',
                translatedContent: `Translated: ${content}`,
              }
            : msg
        )
      );
    }, 1000);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      
      {currentScreen === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onSocialLogin={handleSocialLogin}
          onForgotPassword={() => console.log('Forgot password')}
          onSignup={() => console.log('Sign up')}
        />
      )}

      {currentScreen === 'chat' && (
        <ChatPage
          currentUserId="user-1"
          contactName="Elena"
          contactAvatar=""
          isOnline={true}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBackClick={() => setCurrentScreen('login')}
          onSettingsClick={handleSettingsClick}
          isConnected={true}
          showSettingsButton={true}

        />
      )}

      {currentScreen === 'settings' && (
        <SettingsPage
          language={language}
          tone={tone}
          onLanguageChange={setLanguage}
          onToneChange={setTone}
          onBackClick={() => setCurrentScreen('chat')}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
