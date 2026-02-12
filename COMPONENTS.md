# Documentation des Composants MultiChat

## 📦 Table des Matières

- [Atomes](#atomes)
  - [Button](#button)
  - [Input](#input)
  - [Icon](#icon)
  - [Avatar](#avatar)
  - [Badge](#badge)
  - [Logo](#logo)
- [Molécules](#molécules)
  - [ToneSelector](#toneselector)
  - [MessageBubble](#messagebubble)
  - [LanguagePicker](#languagepicker)
- [Organismes](#organismes)
  - [Header](#header)
  - [MessageComposer](#messagecomposer)
- [Pages](#pages)
  - [LoginPage](#loginpage)
  - [ChatPage](#chatpage)
  - [SettingsPage](#settingspage)

---

## Atomes

### Button

Bouton réutilisable avec plusieurs variantes et états.

**Props:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'social';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}
```

**Exemples:**
```tsx
// Bouton primaire
<Button variant="primary" size="large">
  Connexion →
</Button>

// Bouton avec icône
<Button variant="secondary" icon={<Icon name="send" />}>
  Envoyer
</Button>

// Bouton en chargement
<Button loading variant="primary">
  Chargement...
</Button>

// Bouton social
<Button variant="social" icon={<Icon name="google" />} />
```

---

### Input

Champ de saisie avec support pour icônes, validation et messages d'erreur.

**Props:**
```typescript
interface InputProps {
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  label?: string;
  // + toutes les props HTML input standards
}
```

**Exemples:**
```tsx
// Input simple
<Input 
  type="email" 
  placeholder="Email" 
  fullWidth 
/>

// Input avec icône
<Input 
  icon={<Icon name="user" />}
  placeholder="Nom complet"
/>

// Input avec erreur
<Input 
  error
  errorMessage="Email invalide"
  type="email"
/>

// Input avec label
<Input 
  label="Mot de passe"
  type="password"
/>
```

---

### Icon

Composant d'icône SVG avec une bibliothèque complète d'icônes.

**Props:**
```typescript
interface IconProps {
  name: IconName; // 'moon' | 'sun' | 'arrow-left' | 'arrow-right' | etc.
  size?: number; // défaut: 24
  color?: string; // défaut: 'currentColor'
  className?: string;
  onClick?: () => void;
}
```

**Icônes disponibles:**
- Navigation: `arrow-left`, `arrow-right`, `settings`, `search`
- Communication: `chat`, `translate`, `phone`, `video`, `send`
- Utilisateur: `user`, `users`, `avatar`
- Actions: `plus`, `x`, `check`, `refresh`
- Statut: `alert`, `offline`, `moon`, `sun`
- Social: `google`, `apple`, `twitter`
- Autres: `globe`, `briefcase`, `smile`

**Exemples:**
```tsx
<Icon name="chat" size={32} />
<Icon name="send" color="#6C5CE7" />
<Icon name="settings" onClick={handleSettings} />
```

---

### Avatar

Avatar utilisateur avec indicateur de statut en ligne.

**Props:**
```typescript
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  isOnline?: boolean;
  initials?: string;
  onClick?: () => void;
}
```

**Exemples:**
```tsx
// Avatar avec image
<Avatar 
  src="/path/to/image.jpg" 
  alt="Elena" 
  size="medium" 
  isOnline 
/>

// Avatar avec initiales
<Avatar 
  initials="JD" 
  size="large" 
/>

// Avatar cliquable
<Avatar 
  src="/avatar.jpg"
  onClick={handleProfileClick}
/>
```

---

### Badge

Badge pour afficher des compteurs ou des statuts.

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'neutral';
  size?: 'small' | 'medium';
}
```

**Exemples:**
```tsx
<Badge variant="error">3</Badge>
<Badge variant="success">Nouveau</Badge>
<Badge variant="neutral" size="small">12</Badge>
```

---

### Logo

Logo de l'application MultiChat.

**Props:**
```typescript
interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'default' | 'white';
}
```

**Exemples:**
```tsx
<Logo size="large" />
<Logo size="small" showText={false} />
<Logo variant="white" />
```

---

## Molécules

### ToneSelector

Sélecteur de ton pour les messages (Casual, Standard, Formel).

**Props:**
```typescript
interface ToneSelectorProps {
  selected: MessageTone; // 'casual' | 'standard' | 'formal'
  onChange: (tone: MessageTone) => void;
  variant?: 'full' | 'compact';
}
```

**Exemples:**
```tsx
// Version complète (pour settings)
<ToneSelector 
  selected="standard"
  onChange={setTone}
  variant="full"
/>

// Version compacte (pour message composer)
<ToneSelector 
  selected={tone}
  onChange={setTone}
  variant="compact"
/>
```

---

### MessageBubble

Bulle de message avec support de traduction.

**Props:**
```typescript
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  showTranslation?: boolean;
}
```

**Exemples:**
```tsx
<MessageBubble
  message={message}
  isOwn={message.senderId === currentUserId}
  senderName="Elena"
  senderAvatar="/avatar.jpg"
  showTranslation={true}
/>
```

---

### LanguagePicker

Sélecteur de langue avec dropdown.

**Props:**
```typescript
interface LanguagePickerProps {
  selected: Language;
  onChange: (language: Language) => void;
  label?: string;
}
```

**Langues supportées:**
- `fr` - Français (France)
- `en` - English (US)
- `es` - Español (España)
- `de` - Deutsch
- `it` - Italiano
- `pt` - Português (Brasil)
- `zh` - 中文 (简体)
- `ja` - 日本語
- `ar` - العربية

**Exemples:**
```tsx
<LanguagePicker
  selected="fr"
  onChange={setLanguage}
  label="LANGUE PRÉFÉRÉE"
/>
```

---

## Organismes

### Header

En-tête de page avec navigation et actions.

**Props:**
```typescript
interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
  showThemeToggle?: boolean;
  userAvatar?: string;
  isOnline?: boolean;
  onBackClick?: () => void;
  onSettingsClick?: () => void;
  onThemeToggle?: () => void;
  onAvatarClick?: () => void;
  rightAction?: React.ReactNode;
  backgroundColor?: string;
}
```

**Exemples:**
```tsx
// Header de chat
<Header
  title="Elena"
  subtitle="EN LIGNE"
  showBackButton
  isOnline={true}
  userAvatar="/avatar.jpg"
  onBackClick={handleBack}
  backgroundColor="#FDB924"
/>

// Header de settings
<Header
  title="PARAMÈTRES"
  showBackButton
  showThemeToggle={false}
  backgroundColor="#F5F5F0"
/>
```

---

### MessageComposer

Zone de composition de messages avec sélection de ton.

**Props:**
```typescript
interface MessageComposerProps {
  onSend: (message: string, tone: MessageTone) => void;
  isConnected?: boolean;
  isTranslating?: boolean;
  placeholder?: string;
}
```

**Exemples:**
```tsx
<MessageComposer
  onSend={handleSendMessage}
  isConnected={networkStatus.isOnline}
  placeholder="Tapez votre message..."
/>
```

---

## Pages

### LoginPage

Page de connexion avec authentification email et sociale.

**Props:**
```typescript
interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSocialLogin: (provider: 'google' | 'apple' | 'twitter') => void;
  onForgotPassword: () => void;
  onSignup: () => void;
  isLoading?: boolean;
  error?: string;
}
```

---

### ChatPage

Page de conversation avec messages et composer.

**Props:**
```typescript
interface ChatPageProps {
  currentUserId: string;
  contactName: string;
  contactAvatar?: string;
  isOnline?: boolean;
  messages: Message[];
  onSendMessage: (content: string, tone: MessageTone) => void;
  onBackClick?: () => void;
  onVideoCall?: () => void;
  isConnected?: boolean;
}
```

---

### SettingsPage

Page de paramètres pour langue et ton.

**Props:**
```typescript
interface SettingsPageProps {
  language: Language;
  tone: MessageTone;
  onLanguageChange: (language: Language) => void;
  onToneChange: (tone: MessageTone) => void;
  onBackClick?: () => void;
}
```

---

## 🎨 Conventions de Style

### Couleurs (Theme)
```typescript
colors: {
  primary: {
    yellow: '#FDB924',
    orange: '#FF6B35',
    purple: '#6C5CE7',
  },
  neutral: {
    black: '#000000',
    white: '#FFFFFF',
    offWhite: '#F5F5F0',
    gray: '#8E8E93',
    lightGray: '#E5E5EA',
  },
  status: {
    online: '#34C759',
    offline: '#8E8E93',
    error: '#FF3B30',
    warning: '#FF9500',
  }
}
```

### Espacements
```typescript
spacing: {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
}
```

### Border Radius
```typescript
borderRadius: {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
}
```

---

## 🔧 Bonnes Pratiques

1. **Toujours typer les props** avec TypeScript
2. **Utiliser les variants** au lieu de props booléennes multiples
3. **Exporter les types** avec les composants
4. **Utiliser le theme** pour les valeurs de style
5. **Créer des composants réutilisables** et composables
6. **Documenter les props complexes** avec des exemples

---

## 📚 Ressources

- [Styled Components Docs](https://styled-components.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
