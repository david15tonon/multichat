export const colors = {
  background: "#F8F4E8",
  surface: "#FFFFFF",
  textPrimary: "#111111",
  textSecondary: "#3F3F3F",
  border: "#111111",
  shadow: "#111111",
  yellow: "#F9D64B",
  orange: "#F59B3D",
  violet: "#6C57D9",
  purple: "#6B4FE6",
  lavender: "#E9E3FF",
  gray: "#C6C6C6",
  green: "#63C363",
  red: "#E65555",
};

export const radii = {
  sm: "8px",
  md: "16px",
  lg: "24px",
  pill: "999px",
};

export const shadows = {
  bold: "4px 4px 0 #111111",
  soft: "2px 2px 0 #111111",
  none: "none",
};

export const typography = {
  fontFamily: "'Inter', 'Nunito', system-ui, sans-serif",
  headingWeight: 800,
  bodyWeight: 500,
  lineHeight: 1.2,
};

export const theme = {
  colors,
  radii,
  shadows,
  typography,
};

export type Theme = typeof theme;
