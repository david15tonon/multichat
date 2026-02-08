import React from "react";

interface IconProps {
  size?: number;
}

export const SmileIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
    <path d="M8 14c1 1 2.4 1.6 4 1.6s3-.6 4-1.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const UserIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M4 20c2.5-4 13.5-4 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BriefcaseIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="2" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ArrowRightIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BackIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MoonIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TranslateIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 5c0 6-2.5 9-5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 7l3 7 3-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const VideoIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const GearIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7.2 7.2 0 0 0-2-1.2L12 2 9.5 4.5a7.2 7.2 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.9a7.2 7.2 0 0 0 2 1.2L12 22l2.5-2.5a7.2 7.2 0 0 0 2-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
