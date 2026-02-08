export type Tone = "casual" | "standard" | "formal";

export interface ToneOption {
  id: Tone;
  label: string;
  description: string;
  color: string;
  icon: "smile" | "user" | "briefcase";
}

export interface SocialProvider {
  id: string;
  label: string;
  icon: "google" | "apple" | "x";
}

export interface Message {
  id: string;
  author: string;
  content: string;
  translated?: string;
  time?: string;
  variant: "incoming" | "outgoing";
}
