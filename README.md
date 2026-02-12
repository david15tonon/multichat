# MultiChat 🌐💬

Application de messagerie multilingue avec traduction en temps réel et adaptation du ton selon le contexte.

![MultiChat](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Styled Components](https://img.shields.io/badge/Styled%20Components-6.1-pink)

## 🎯 Fonctionnalités

- **✨ Traduction en temps réel** - Messages traduits instantanément dans 9+ langues
- **🎭 Adaptation du ton** - Casual, Standard, ou Formel selon votre interlocuteur
- **📱 Design moderne** - Interface inspirée du design néo-brutaliste avec des couleurs vives
- **🌍 Multilingue** - Support de FR, EN, ES, DE, IT, PT, ZH, JA, AR
- **🔌 Mode hors ligne** - Gestion intelligente de la déconnexion
- **💬 Interface intuitive** - UX optimisée pour une communication fluide

## 🏗️ Architecture

Le projet suit une architecture **Atomic Design** pour une meilleure organisation et réutilisabilité :

```
src/
├── components/
│   ├── atoms/          # Composants de base (Button, Input, Icon, Avatar, etc.)
│   ├── molecules/      # Combinaisons d'atomes (MessageBubble, ToneSelector, etc.)
│   ├── organisms/      # Sections complètes (Header, MessageComposer, etc.)
│   └── templates/      # Layouts de pages
├── pages/              # Pages complètes de l'application
│   ├── LoginPage.tsx
│   ├── ChatPage.tsx
│   └── SettingsPage.tsx
├── types/              # Définitions TypeScript
├── styles/             # Thème et styles globaux
├── utils/              # Fonctions utilitaires
└── contexts/           # Contexts React (Auth, Translation, etc.)
```

## 🎨 Design System

### Couleurs
- **Primaire Jaune**: `#FDB924` - Énergie et optimisme
- **Primaire Orange**: `#FF6B35` - Chaleur et dynamisme
- **Primaire Violet**: `#6C5CE7` - Innovation et créativité
- **Noir**: `#000000` - Bordures et texte
- **Blanc cassé**: `#F5F5F0` - Arrière-plans

### Composants Atomes
- `Button` - Boutons avec variants (primary, secondary, outline, ghost, social)
- `Input` - Champs de saisie avec validation
- `Icon` - Bibliothèque d'icônes SVG
- `Avatar` - Avatars avec indicateur en ligne
- `Badge` - Badges pour notifications
- `Logo` - Logo de l'application

### Composants Molécules
- `MessageBubble` - Bulle de message avec traduction
- `ToneSelector` - Sélecteur de ton (3 modes)
- `LanguagePicker` - Sélecteur de langue

### Composants Organismes
- `Header` - En-tête avec navigation
- `MessageComposer` - Zone de composition de messages

## 🚀 Installation et Démarrage

### Prérequis
- Node.js >= 18.0.0
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <your-repo-url>
cd multichat

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 📦 Technologies

- **React 18.2** - Framework UI
- **TypeScript 5.2** - Typage statique
- **Styled Components 6.1** - CSS-in-JS
- **Vite 5** - Build tool et dev server
- **ESLint** - Linting
- **Vercel** - Déploiement

## 🎯 Utilisation des Composants

### Button

```tsx
import { Button } from '@/components/atoms';

<Button variant="primary" size="large" fullWidth>
  Connexion →
</Button>
```

### MessageBubble

```tsx
import { MessageBubble } from '@/components/molecules';

<MessageBubble
  message={message}
  isOwn={true}
  senderName="Elena"
  showTranslation={true}
/>
```

### ToneSelector

```tsx
import { ToneSelector } from '@/components/molecules';

<ToneSelector
  selected="standard"
  onChange={(tone) => setTone(tone)}
  variant="full"
/>
```

## 🔧 Configuration

### Thème
Modifiez `src/styles/theme.ts` pour personnaliser les couleurs, typographie, espacements, etc.

### Types
Tous les types TypeScript sont définis dans `src/types/index.ts`.

## 📱 Pages

### LoginPage
- Connexion email/mot de passe
- Connexion sociale (Google, Apple, X)
- Réinitialisation de mot de passe
- Inscription

### ChatPage
- Liste de messages avec traduction
- Composition de messages
- Sélection du ton
- Indicateur de connexion
- Appel vidéo

### SettingsPage
- Sélection de langue
- Configuration du ton
- Profil utilisateur

## 🌐 Déploiement sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement Vite
3. Le déploiement se fera automatiquement à chaque push

Ou via CLI :
```bash
npm install -g vercel
vercel
```

## 📄 Structure des Fichiers

```
multichat/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json
└── src/
    ├── index.tsx
    ├── App.tsx
    ├── components/
    │   ├── atoms/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Icon.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Logo.tsx
    │   │   └── index.ts
    │   ├── molecules/
    │   │   ├── MessageBubble.tsx
    │   │   ├── ToneSelector.tsx
    │   │   ├── LanguagePicker.tsx
    │   │   └── index.ts
    │   └── organisms/
    │       ├── Header.tsx
    │       ├── MessageComposer.tsx
    │       └── index.ts
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── ChatPage.tsx
    │   └── SettingsPage.tsx
    ├── types/
    │   └── index.ts
    └── styles/
        ├── theme.ts
        └── GlobalStyles.ts
```

## 🎓 Best Practices

1. **Composants réutilisables** - Tous les composants sont modulaires et réutilisables
2. **TypeScript strict** - Typage complet pour éviter les erreurs
3. **Styled Components** - CSS-in-JS pour un styling modulaire
4. **Atomic Design** - Architecture scalable et maintenable
5. **Props interfaces** - Toutes les props sont typées
6. **Composition** - Privilégier la composition à l'héritage

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Créé avec ❤️ pour faciliter la communication multilingue

---

**Note**: Ce projet est un exemple d'implémentation. Pour une application en production, ajoutez :
- Backend API pour la traduction
- Authentication réelle
- Base de données
- Tests unitaires et E2E
- CI/CD pipeline
- Monitoring et analytics
