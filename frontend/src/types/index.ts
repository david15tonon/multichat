// User Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  preferredLanguage: Language;
  tone: MessageTone;
  isOnline: boolean;
  lastSeen?: Date;
}

// Language Types
export type Language = 
  | 'fr' // Français
  | 'en' // English
  | 'es' // Español
  | 'de' // Deutsch
  | 'it' // Italiano
  | 'pt' // Português
  | 'zh' // 中文
  | 'ja' // 日本語
  | 'ar'; // العربية

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

// Message Types
export type MessageTone = 'casual' | 'standard' | 'formal';

export interface ToneOption {
  value: MessageTone;
  label: string;
  description: string;
  example: string;
  icon: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  originalLanguage: Language;
  translatedContent?: string;
  targetLanguage?: Language;
  tone: MessageTone;
  timestamp: Date;
  status: MessageStatus;
  translationStatus?: TranslationStatus;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type TranslationStatus = 'translating' | 'translated' | 'failed';

// Conversation Types
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

// Auth Types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  fullName: string;
  preferredLanguage: Language;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Network Types
export interface NetworkStatus {
  isOnline: boolean;
  lastConnected?: Date;
}

// Translation Types
export interface TranslationRequest {
  text: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  tone: MessageTone;
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
}

// Settings Types
export interface UserSettings {
  language: Language;
  tone: MessageTone;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  messageNotifications: boolean;
  translationNotifications: boolean;
  soundEnabled: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  readReceipts: boolean;
}

// API Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
