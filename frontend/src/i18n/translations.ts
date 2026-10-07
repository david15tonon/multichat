/**
 * Chaînes de l'interface.
 *
 * `fr` fait foi : c'est lui qui définit les clés disponibles, et toute autre
 * langue doit fournir exactement les mêmes (le type `Dictionary` l'impose, le
 * compilateur refuse une traduction incomplète).
 *
 * L'application accepte 9 langues pour les MESSAGES, mais seules celles
 * présentes ici traduisent l'INTERFACE ; les autres retombent sur l'anglais.
 * Ajouter une langue = déposer un objet de plus et l'enregistrer dans
 * `dictionaries`, sans toucher aux composants.
 */

export const fr = {
  // Commun
  'common.loading': 'Chargement…',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.retry': 'Réessayer',
  'common.back': 'Retour',
  'common.or': 'OU',

  // Connexion
  'login.welcome': 'BIENVENUE !',
  'login.subtitle': 'Connectez-vous pour continuer',
  'login.email': 'Adresse e-mail',
  'login.password': 'Mot de passe',
  'login.submit': 'Connexion',
  'login.forgot': 'Mot de passe oublié ?',
  'login.noAccount': 'Pas encore de compte ?',
  'login.signup': 'S’inscrire',
  'login.withGoogle': 'Se connecter avec Google',
  'login.withApple': 'Se connecter avec Apple',
  'login.withX': 'Se connecter avec X',
  'login.socialSoon': 'Connexion sociale bientôt disponible',

  // Inscription
  'signup.title': 'Créer un compte',
  'signup.name': 'Nom complet',
  'signup.confirmPassword': 'Confirmer le mot de passe',
  'signup.submit': 'S’inscrire',
  'signup.hasAccount': 'Déjà un compte ?',
  'signup.login': 'Se connecter',
  'signup.languageLabel': 'Votre langue — vous recevrez les messages traduits dedans',
  'signup.withGoogle': 'S’inscrire avec Google',
  'signup.withApple': 'S’inscrire avec Apple',
  'signup.withX': 'S’inscrire avec X',
  'signup.req.length': 'Au moins 8 caractères',
  'signup.req.uppercase': 'Une lettre majuscule',
  'signup.req.lowercase': 'Une lettre minuscule',
  'signup.req.number': 'Un chiffre',
  'signup.req.match': 'Les mots de passe correspondent',

  // Mot de passe oublié
  'forgot.title': 'Mot de passe oublié',
  'forgot.sent': 'E-mail envoyé !',
  'forgot.backToLogin': 'Retour à la connexion',
  'forgot.unavailable': 'La réinitialisation par e-mail n’est pas encore disponible.',

  // Conversations
  'conversations.title': 'CONVERSATIONS',
  'conversations.yours': 'Vos conversations',
  'conversations.start': 'Démarrer une conversation',
  'conversations.searchPlaceholder': 'Rechercher par nom ou e-mail…',
  'conversations.searching': 'Recherche…',
  'conversations.results': '{count} résultat(s)',
  'conversations.write': 'Écrire',
  'conversations.speaks': 'Parle {language}',
  'conversations.emptyTitle': 'Aucune conversation',
  'conversations.emptyHint':
    'Cherchez quelqu’un par son nom ou son e-mail ci-dessus pour démarrer votre première discussion.',
  'conversations.noMessageYet': 'Aucun message pour l’instant',
  'conversations.searchFailed': 'Recherche impossible',

  // Discussion
  'chat.conversation': 'Conversation',
  'chat.today': 'AUJOURD’HUI',
  'chat.online': 'EN LIGNE',
  'chat.offline': 'HORS LIGNE',
  'chat.connected': 'CONNECTÉ',
  'chat.disconnected': 'HORS CONNEXION',
  'chat.emptyTitle': 'Aucun message',
  'chat.emptyHint':
    'Écrivez le premier message à {name}. Il sera traduit automatiquement dans sa langue.',
  'chat.typing': '{name} est en train d’écrire…',
  'chat.composerPlaceholder': 'Écrivez votre message…',
  'chat.send': 'Envoyer le message',
  'chat.emoji': 'Insérer un émoji',
  'chat.preview': 'Prévisualiser la traduction',
  'chat.previewLabel': 'PRÉVISUALISATION',
  'chat.callVideo': 'Appeler {name} en vidéo',
  'chat.callUnavailable': '{name} n’est pas connecté·e — l’appel ne peut pas aboutir',
  'chat.translationFailedTitle': 'Traduction indisponible',
  'chat.translationFailedText':
    'Nous n’avons pas pu traduire ce message. La connexion semble interrompue.',

  // Bulle de message
  'bubble.translating': 'Traduction en cours…',
  'bubble.originalIn': 'ORIGINAL EN {language}',
  'bubble.translatedTo': 'TRADUIT VERS {language}',
  'bubble.showOriginal': 'Afficher l’original',
  'bubble.hideOriginal': 'Masquer l’original',
  'bubble.failed': 'TRADUCTION INDISPONIBLE',

  // Réglages
  'settings.title': 'PARAMÈTRES',
  'settings.tab.language': 'Langue',
  'settings.tab.tone': 'Ton & Registre',
  'settings.tab.account': 'Compte',
  'settings.account.title': 'Votre compte',
  'settings.account.displayName': 'Nom affiché',
  'settings.account.email': 'Adresse e-mail',
  'settings.account.logout': 'Se déconnecter',
  'settings.danger.title': 'Zone sensible',
  'settings.danger.text':
    'La suppression du compte est définitive : profil, messages et conversations sont effacés sans possibilité de retour.',
  'settings.danger.confirm': 'Confirmer la suppression définitive ?',
  'settings.danger.yes': 'Oui, supprimer mon compte',
  'settings.danger.delete': 'Supprimer mon compte',
  'settings.tone.sectionTitle': 'Registre de langue',

  // Tons
  'tone.casual': 'Décontracté',
  'tone.casual.description': 'Entre amis, ton détendu',
  'tone.casual.example': '« Salut ! Ça va ? »',
  'tone.standard': 'Standard',
  'tone.standard.description': 'Poli sans être guindé',
  'tone.standard.example': '« Bonjour, comment allez-vous ? »',
  'tone.formal': 'Soutenu',
  'tone.formal.description': 'Registre professionnel',
  'tone.formal.example': '« Je vous prie d’agréer mes salutations. »',

  // Appel
  'call.calling': 'Appel en cours…',
  'call.ringing': 'Appel entrant',
  'call.connected': 'En communication',
  'call.unavailable': 'Indisponible',
  'call.accept': 'Accepter',
  'call.reject': 'Refuser',
  'call.hangUp': 'Raccrocher',
  'call.mute': 'Couper le micro',
  'call.unmute': 'Réactiver le micro',
  'call.cameraOff': 'Couper la caméra',
  'call.cameraOn': 'Activer la caméra',
  'call.peer': 'Correspondant',
  'call.withPeer': 'Appel avec {name}',
  'call.cameraDenied': 'Accès à la caméra refusé.',
  'call.startFailed': 'Impossible de démarrer l’appel.',
  'call.acceptFailed': 'Impossible d’accepter l’appel.',
  'call.rejected': 'Appel refusé.',
  'call.peerOffline': 'Votre correspondant n’est pas connecté.',
  'call.needsTurn': 'Connexion impossible — un serveur TURN est probablement nécessaire.',

  // Thème
  'theme.toLight': 'Passer en mode clair',
  'theme.toDark': 'Passer en mode sombre',

  // Erreurs
  'error.unreachable': 'Serveur injoignable',
  'error.loginFailed': 'Échec de la connexion',
  'error.loadFailed': 'Chargement impossible',
  'error.sendFailed': 'Échec de l’envoi',
  'error.noRecipient': 'Aucun destinataire sélectionné',
  'error.createFailed': 'Création impossible',

  // Conditions et confidentialité
  'signup.termsIntro': 'En vous inscrivant, vous acceptez nos',
  'signup.terms': 'conditions d’utilisation',
  'signup.and': 'et notre',
  'signup.privacy': 'politique de confidentialité',
  'signup.alreadyMember': 'Déjà un compte ? Connectez-vous',

  // Cartes des réglages
  'settings.card.multilingual': 'MultiChat Multilingue',
  'settings.card.realtime': 'Traduction en temps réel',
  'settings.card.languages': '9+ langues',
  'settings.card.accuracy': 'Précision élevée',
  'settings.card.toneTitle': 'Adaptez votre ton selon vos interlocuteurs',

  // Cartes des réglages — descriptions
  'settings.card.tagline': 'Traduisez vos émotions sans frontières.',
  'settings.card.realtimeDescription': 'Messages traduits instantanément dans votre langue',
  'settings.card.languagesDescription': 'Français, anglais, espagnol et bien d’autres',
  'settings.card.accuracyDescription': 'Une IA récente, pour des traductions qui sonnent juste',
  'settings.card.toneDescription':
    'Choisissez le registre de vos messages : décontracté entre amis, soutenu pour un échange professionnel. La traduction s’y adapte.',
  'settings.card.laterNote': 'Vous pourrez modifier ces réglages à tout moment.',

  // Sélecteur de langue
  'language.preferred': 'LANGUE PRÉFÉRÉE',

  // Mot de passe oublié — détail
  'forgot.intro':
    'Pas de panique. Indiquez votre adresse et nous vous enverrons un lien pour en choisir un nouveau.',
  'forgot.sentTo': 'Nous avons envoyé un lien de réinitialisation à :',
  'forgot.checkInbox':
    'Cliquez sur le lien reçu pour choisir un nouveau mot de passe. Sans message d’ici quelques minutes, pensez à regarder dans vos indésirables.',
  'forgot.send': 'Envoyer le lien',

  // Composeur
  'chat.reconnecting': 'Reconnexion…',

  // 404
  'notFound.message':
    'Cette page n’existe pas. Elle a peut-être été déplacée, ou l’adresse comporte une faute de frappe.',
  'notFound.home': 'Retour aux conversations',
} as const;

/** Toute langue doit couvrir exactement les clés du français. */
export type Dictionary = Record<keyof typeof fr, string>;
export type TranslationKey = keyof typeof fr;

export const en: Dictionary = {
  // Common
  'common.loading': 'Loading…',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.retry': 'Try again',
  'common.back': 'Back',
  'common.or': 'OR',

  // Login
  'login.welcome': 'WELCOME!',
  'login.subtitle': 'Sign in to continue',
  'login.email': 'Email address',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.forgot': 'Forgot your password?',
  'login.noAccount': 'No account yet?',
  'login.signup': 'Sign up',
  'login.withGoogle': 'Sign in with Google',
  'login.withApple': 'Sign in with Apple',
  'login.withX': 'Sign in with X',
  'login.socialSoon': 'Social sign-in coming soon',

  // Sign up
  'signup.title': 'Create an account',
  'signup.name': 'Full name',
  'signup.confirmPassword': 'Confirm password',
  'signup.submit': 'Sign up',
  'signup.hasAccount': 'Already have an account?',
  'signup.login': 'Sign in',
  'signup.languageLabel': 'Your language — messages will be translated into it',
  'signup.withGoogle': 'Sign up with Google',
  'signup.withApple': 'Sign up with Apple',
  'signup.withX': 'Sign up with X',
  'signup.req.length': 'At least 8 characters',
  'signup.req.uppercase': 'One uppercase letter',
  'signup.req.lowercase': 'One lowercase letter',
  'signup.req.number': 'One digit',
  'signup.req.match': 'Passwords match',

  // Forgot password
  'forgot.title': 'Forgot password',
  'forgot.sent': 'Email sent!',
  'forgot.backToLogin': 'Back to sign in',
  'forgot.unavailable': 'Password reset by email is not available yet.',

  // Conversations
  'conversations.title': 'CONVERSATIONS',
  'conversations.yours': 'Your conversations',
  'conversations.start': 'Start a conversation',
  'conversations.searchPlaceholder': 'Search by name or email…',
  'conversations.searching': 'Searching…',
  'conversations.results': '{count} result(s)',
  'conversations.write': 'Message',
  'conversations.speaks': 'Speaks {language}',
  'conversations.emptyTitle': 'No conversations',
  'conversations.emptyHint':
    'Search for someone by name or email above to start your first conversation.',
  'conversations.noMessageYet': 'No messages yet',
  'conversations.searchFailed': 'Search failed',

  // Chat
  'chat.conversation': 'Conversation',
  'chat.today': 'TODAY',
  'chat.online': 'ONLINE',
  'chat.offline': 'OFFLINE',
  'chat.connected': 'CONNECTED',
  'chat.disconnected': 'NO CONNECTION',
  'chat.emptyTitle': 'No messages',
  'chat.emptyHint':
    'Write the first message to {name}. It will be translated automatically into their language.',
  'chat.typing': '{name} is typing…',
  'chat.composerPlaceholder': 'Write your message…',
  'chat.send': 'Send message',
  'chat.emoji': 'Insert an emoji',
  'chat.preview': 'Preview the translation',
  'chat.previewLabel': 'PREVIEW',
  'chat.callVideo': 'Video call {name}',
  'chat.callUnavailable': '{name} is not connected — the call cannot go through',
  'chat.translationFailedTitle': 'Translation unavailable',
  'chat.translationFailedText':
    'We could not translate that message. Your connection seems to be down.',

  // Message bubble
  'bubble.translating': 'Translating…',
  'bubble.originalIn': 'ORIGINAL IN {language}',
  'bubble.translatedTo': 'TRANSLATED TO {language}',
  'bubble.showOriginal': 'Show the original',
  'bubble.hideOriginal': 'Hide the original',
  'bubble.failed': 'TRANSLATION UNAVAILABLE',

  // Settings
  'settings.title': 'SETTINGS',
  'settings.tab.language': 'Language',
  'settings.tab.tone': 'Tone & Register',
  'settings.tab.account': 'Account',
  'settings.account.title': 'Your account',
  'settings.account.displayName': 'Display name',
  'settings.account.email': 'Email address',
  'settings.account.logout': 'Sign out',
  'settings.danger.title': 'Danger zone',
  'settings.danger.text':
    'Deleting your account is permanent: profile, messages and conversations are erased with no way back.',
  'settings.danger.confirm': 'Confirm permanent deletion?',
  'settings.danger.yes': 'Yes, delete my account',
  'settings.danger.delete': 'Delete my account',
  'settings.tone.sectionTitle': 'Language register',

  // Tones
  'tone.casual': 'Casual',
  'tone.casual.description': 'Among friends, relaxed',
  'tone.casual.example': '“Hey! How’s it going?”',
  'tone.standard': 'Standard',
  'tone.standard.description': 'Polite without being stiff',
  'tone.standard.example': '“Hello, how are you?”',
  'tone.formal': 'Formal',
  'tone.formal.description': 'Professional register',
  'tone.formal.example': '“Yours sincerely.”',

  // Call
  'call.calling': 'Calling…',
  'call.ringing': 'Incoming call',
  'call.connected': 'Connected',
  'call.unavailable': 'Unavailable',
  'call.accept': 'Accept',
  'call.reject': 'Decline',
  'call.hangUp': 'Hang up',
  'call.mute': 'Mute',
  'call.unmute': 'Unmute',
  'call.cameraOff': 'Turn camera off',
  'call.cameraOn': 'Turn camera on',
  'call.peer': 'Caller',
  'call.withPeer': 'Call with {name}',
  'call.cameraDenied': 'Camera access denied.',
  'call.startFailed': 'Could not start the call.',
  'call.acceptFailed': 'Could not accept the call.',
  'call.rejected': 'Call declined.',
  'call.peerOffline': 'The person you are calling is not connected.',
  'call.needsTurn': 'Connection failed — a TURN server is most likely required.',

  // Theme
  'theme.toLight': 'Switch to light mode',
  'theme.toDark': 'Switch to dark mode',

  // Errors
  'error.unreachable': 'Server unreachable',
  'error.loginFailed': 'Sign-in failed',
  'error.loadFailed': 'Could not load',
  'error.sendFailed': 'Could not send',
  'error.noRecipient': 'No recipient selected',
  'error.createFailed': 'Could not create',

  // Terms and privacy
  'signup.termsIntro': 'By signing up, you agree to our',
  'signup.terms': 'terms of use',
  'signup.and': 'and our',
  'signup.privacy': 'privacy policy',
  'signup.alreadyMember': 'Already have an account? Sign in',

  // Settings cards
  'settings.card.multilingual': 'MultiChat Multilingual',
  'settings.card.realtime': 'Real-time translation',
  'settings.card.languages': '9+ languages',
  'settings.card.accuracy': 'High accuracy',
  'settings.card.toneTitle': 'Adapt your tone to the person you write to',

  // Settings cards — descriptions
  'settings.card.tagline': 'Translate your feelings across borders.',
  'settings.card.realtimeDescription': 'Messages translated instantly into your language',
  'settings.card.languagesDescription': 'French, English, Spanish and many more',
  'settings.card.accuracyDescription': 'Recent AI, for translations that read naturally',
  'settings.card.toneDescription':
    'Choose the register of your messages: casual among friends, formal for professional exchanges. The translation follows.',
  'settings.card.laterNote': 'You can change these settings at any time.',

  // Language picker
  'language.preferred': 'PREFERRED LANGUAGE',

  // Forgot password — detail
  'forgot.intro':
    'No panic. Enter your address and we will send you a link to choose a new one.',
  'forgot.sentTo': 'We sent a reset link to:',
  'forgot.checkInbox':
    'Click the link you received to choose a new password. If nothing arrives within a few minutes, check your spam folder.',
  'forgot.send': 'Send the link',

  // Composer
  'chat.reconnecting': 'Reconnecting…',

  // 404
  'notFound.message':
    'This page does not exist. It may have moved, or the address contains a typo.',
  'notFound.home': 'Back to conversations',
};

/** Langues dont l'INTERFACE est traduite. Les autres retombent sur l'anglais. */
export const dictionaries = { fr, en } as const;

export type UiLocale = keyof typeof dictionaries;
export const FALLBACK_LOCALE: UiLocale = 'en';

export function isUiLocale(value: string): value is UiLocale {
  return value in dictionaries;
}
